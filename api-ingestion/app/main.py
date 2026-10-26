from decimal import Decimal
from enum import Enum
from typing import Annotated
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import (
    Boolean,
    Column,
    Integer,
    MetaData,
    Numeric,
    String,
    Table,
    and_,
    case,
    func,
    literal,
    select,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Session

from .database import get_db

app = FastAPI(
    title="API de Produtos para Orçamentos",
    version="1.0.0",
    description="Consulta produtos armazenados em PostgreSQL.",
)

metadata = MetaData()
produto = Table(
    "produto",
    metadata,
    Column("id", PGUUID(as_uuid=True), primary_key=True),
    Column("nome", String(255)),
    Column("marca", String(100)),
    Column("codigo_barras", String(50)),
    Column("categoria_id", PGUUID(as_uuid=True)),
    Column("preco_venda", Numeric(10, 2)),
    Column("unidade", String(10)),
    Column("estoque", Integer),
    Column("ativo", Boolean),
)
categoria = Table(
    "categoria",
    metadata,
    Column("id", PGUUID(as_uuid=True), primary_key=True),
    Column("nome", String(255)),
)
produto_estatistica = Table(
    "produto_estatistica",
    metadata,
    Column("produto_id", PGUUID(as_uuid=True), primary_key=True),
    Column("qtd_vendida", Integer),
)


class SortOption(str, Enum):
    relevancia = "relevancia"
    mais_comprados = "mais_comprados"


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    nome: str
    marca: str | None
    codigo_barras: str | None
    categoria: str | None
    preco_venda: Decimal | None
    unidade: str | None
    estoque: int | None
    ativo: bool


class PaginatedProducts(BaseModel):
    items: list[ProductResponse]
    page: int
    page_size: int
    total: int
    total_pages: int


def normalized_term(term: str):
    return func.lower(func.unaccent(literal(term.strip())))


def ranking(term: str):
    normalized_name = func.lower(func.unaccent(produto.c.nome))
    normalized = normalized_term(term)
    whole_word = normalized_name.op("~")(
        func.concat(literal(r"\y"), normalized, literal(r"\y"))
    )
    return case(
        (normalized_name == normalized, 1),
        (normalized_name.like(normalized + literal("%")), 2),
        (whole_word, 3),
        (normalized_name.like(literal("%") + normalized + literal("%")), 4),
        else_=5,
    )


def product_columns():
    return [
        produto.c.id,
        produto.c.nome,
        produto.c.marca,
        produto.c.codigo_barras,
        categoria.c.nome.label("categoria"),
        produto.c.preco_venda,
        produto.c.unidade,
        produto.c.estoque,
        produto.c.ativo,
    ]


def to_product(row) -> ProductResponse:
    return ProductResponse.model_validate(dict(row._mapping))


@app.get("/health")
def health(db: Annotated[Session, Depends(get_db)]):
    db.execute(select(literal(1)))
    return {"status": "ok"}


@app.get("/produtos/busca", response_model=ProductResponse)
def search_product(
    q: Annotated[str, Query(min_length=1)],
    db: Annotated[Session, Depends(get_db)],
):
    term = q.strip()
    if not term:
        raise HTTPException(status_code=422, detail="O termo de busca não pode ser vazio.")
    query = (
        select(*product_columns())
        .select_from(produto.join(categoria, produto.c.categoria_id == categoria.c.id, isouter=True))
        .where(produto.c.ativo.is_(True))
        .where(func.lower(func.unaccent(produto.c.nome)).like(
            literal("%") + normalized_term(term) + literal("%")
        ))
        .order_by(ranking(term), produto.c.nome.asc())
        .limit(1)
    )
    row = db.execute(query).mappings().first()
    if row is None:
        raise HTTPException(status_code=404, detail="Nenhum produto encontrado para o termo informado.")
    return ProductResponse.model_validate(row)


@app.get("/produtos", response_model=PaginatedProducts)
def list_products(
    db: Annotated[Session, Depends(get_db)],
    q: Annotated[str | None, Query(min_length=1)] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    pageSize: Annotated[int, Query(ge=1, le=100)] = 20,
    sort: SortOption = SortOption.relevancia,
    incluir_inativos: bool = False,
):
    base = (
        produto.join(categoria, produto.c.categoria_id == categoria.c.id, isouter=True)
        .join(produto_estatistica, produto.c.id == produto_estatistica.c.produto_id, isouter=True)
    )
    conditions = [] if incluir_inativos else [produto.c.ativo.is_(True)]
    if q is not None and q.strip():
        term = q.strip()
        normalized_name = func.lower(func.unaccent(produto.c.nome))
        conditions.append(
            normalized_name.like(literal("%") + normalized_term(term) + literal("%"))
        )
    where_clause = and_(*conditions)
    count_query = select(func.count()).select_from(base).where(where_clause)
    total = db.execute(count_query).scalar_one()
    query = select(*product_columns()).select_from(base).where(where_clause)
    if sort == SortOption.mais_comprados:
        query = query.order_by(
            func.coalesce(produto_estatistica.c.qtd_vendida, 0).desc(),
            produto.c.nome.asc(),
        )
    elif q and q.strip():
        query = query.order_by(ranking(q.strip()), produto.c.nome.asc())
    else:
        query = query.order_by(produto.c.nome.asc())
    rows = db.execute(query.limit(pageSize).offset((page - 1) * pageSize)).mappings()
    items = [ProductResponse.model_validate(row) for row in rows]
    return PaginatedProducts(
        items=items,
        page=page,
        page_size=pageSize,
        total=total,
        total_pages=(total + pageSize - 1) // pageSize,
    )

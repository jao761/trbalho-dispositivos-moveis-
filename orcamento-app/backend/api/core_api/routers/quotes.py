from datetime import datetime, date, timedelta
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from backend.database.business.connection import get_business_db
from backend.database.business.models import Quote, QuoteItem, Client, AuditLog
from backend.shared.exceptions.exceptions import NotFoundException, BadRequestException
from backend.shared.utils.date_utils import utc_now, format_date_br
from backend.api.core_api.dependencies import get_tenant_context, TenantContext
from backend.api.core_api.schemas import (
    QuoteCreate,
    QuoteResponse,
    QuoteItemCreate,
    QuoteItemResponse,
)

router = APIRouter(prefix="/quotes", tags=["Orçamentos"])

# Mapeamento de status aceitando tanto inglês quanto português
STATUS_MAP = {
    "TODOS": None,
    "ALL": None,
    "RASCUNHO": "DRAFT",
    "RASCUNHOS": "DRAFT",
    "DRAFT": "DRAFT",
    "ENVIADO": "SENT",
    "ENVIADOS": "SENT",
    "SENT": "SENT",
    "APROVADO": "APPROVED",
    "APROVADOS": "APPROVED",
    "APPROVED": "APPROVED",
    "RECUSADO": "REJECTED",
    "RECUSADOS": "REJECTED",
    "REJECTED": "REJECTED",
    "EXPIRADO": "EXPIRED",
    "EXPIRADOS": "EXPIRED",
    "EXPIRED": "EXPIRED",
}


def _quote_to_response(q: Quote, db: Session) -> QuoteResponse:
    client = db.query(Client).filter(Client.id == q.client_id).first()
    client_name = client.name if client else "Cliente"

    items_resp = [
        QuoteItemResponse(
            id=str(it.id),
            productId=it.external_product_id,
            external_product_id=it.external_product_id,
            productName=it.product_name,
            product_name=it.product_name,
            quantity=float(it.quantity),
            unitPrice=float(it.unit_price),
            unit_price=float(it.unit_price),
            discount=float(it.discount),
            subtotal=float(it.subtotal),
        )
        for it in q.items
    ]

    valid_until_str = ""
    valid_until_raw = ""
    if q.valid_until:
        valid_until_str = format_date_br(datetime.combine(q.valid_until, datetime.min.time()))
        valid_until_raw = str(q.valid_until)

    return QuoteResponse(
        id=str(q.id),
        number=q.number,
        clientId=str(q.client_id),
        client_id=str(q.client_id),
        clientName=client_name,
        client_name=client_name,
        status=q.status,
        createdAt=format_date_br(q.created_at),
        created_at=str(q.created_at),
        validUntil=valid_until_str,
        valid_until=valid_until_raw,
        subtotal=float(q.subtotal),
        discount=float(q.discount),
        total=float(q.total),
        notes=q.notes or "",
        items=items_resp,
    )


def _recalculate_quote_totals(quote: Quote, db: Session):
    subtotal = sum(item.subtotal for item in quote.items)
    discount = quote.discount or 0
    total = max(0, subtotal - discount)
    quote.subtotal = subtotal
    quote.total = total
    db.add(quote)


@router.get("", response_model=List[QuoteResponse])
def list_quotes(
    status_filter: Optional[str] = Query(None, alias="status"),
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """Lista orçamentos da empresa com filtro opcional por status."""
    query = db.query(Quote).filter(Quote.company_id == tenant.company_id)

    if status_filter:
        normalized = STATUS_MAP.get(status_filter.strip().upper(), status_filter.strip().upper())
        if normalized:
            query = query.filter(Quote.status == normalized)

    quotes = query.order_by(desc(Quote.created_at)).all()
    return [_quote_to_response(q, db) for q in quotes]


@router.post("", response_model=QuoteResponse, status_code=status.HTTP_201_CREATED)
def create_quote(
    payload: QuoteCreate,
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """Cria um orçamento com seus itens e valida cálculos no backend."""
    raw_client_id = payload.clientId or payload.client_id
    if not raw_client_id:
        raise BadRequestException("O cliente deve ser informado")

    try:
        c_uuid = uuid.UUID(raw_client_id)
    except ValueError:
        raise BadRequestException("ID de cliente inválido")

    client = db.query(Client).filter(Client.id == c_uuid, Client.company_id == tenant.company_id).first()
    if not client:
        raise NotFoundException("Cliente não encontrado nesta empresa")

    # Gera número sequencial do orçamento para a empresa
    last_quote = (
        db.query(Quote)
        .filter(Quote.company_id == tenant.company_id)
        .order_by(desc(Quote.created_at))
        .first()
    )
    if last_quote and last_quote.number.isdigit():
        next_num = int(last_quote.number) + 1
    else:
        count = db.query(Quote).filter(Quote.company_id == tenant.company_id).count()
        next_num = count + 1
    quote_number = payload.number or f"{next_num:06d}"

    # A validade fornecida pelo cliente deve ser preservada; se ausente, vale por 10 dias.
    valid_until_raw = payload.validUntil or payload.valid_until
    if valid_until_raw:
        try:
            valid_until_date = date.fromisoformat(valid_until_raw)
        except ValueError as exc:
            raise BadRequestException("Data de validade inválida; use AAAA-MM-DD") from exc
    else:
        valid_until_date = date.today() + timedelta(days=10)

    # Inicia transação
    quote_id = uuid.uuid4()
    quote = Quote(
        id=quote_id,
        company_id=tenant.company_id,
        client_id=c_uuid,
        created_by_user_id=tenant.user_id,
        number=quote_number,
        valid_until=valid_until_date,
        subtotal=0,
        discount=payload.discount,
        total=0,
        status="DRAFT",
        notes=payload.notes or "",
    )
    db.add(quote)
    db.flush()

    total_subtotal = 0.0
    for it in payload.items:
        ext_id = it.productId or it.external_product_id or "prod-custom"
        p_name = it.productName or it.product_name or "Produto"
        u_price = it.unitPrice if it.unitPrice is not None else (it.unit_price or 0.0)
        qty = max(0.01, it.quantity)
        disc = max(0.0, it.discount)
        item_sub = max(0.0, (qty * u_price) - disc)
        total_subtotal += item_sub

        item = QuoteItem(
            id=uuid.uuid4(),
            quote_id=quote.id,
            external_product_id=ext_id,
            product_name=p_name,
            quantity=qty,
            unit_price=u_price,
            discount=disc,
            subtotal=item_sub,
        )
        db.add(item)

    final_total = max(0.0, total_subtotal - payload.discount)
    quote.subtotal = total_subtotal
    quote.total = final_total

    log = AuditLog(
        id=uuid.uuid4(),
        company_id=tenant.company_id,
        user_id=tenant.user_id,
        action="QUOTE_CREATED",
        entity_type="QUOTE",
        entity_id=str(quote.id),
        metadata_={"number": quote.number, "client": client.name, "total": float(final_total)},
    )
    db.add(log)
    db.commit()
    db.refresh(quote)

    return _quote_to_response(quote, db)


@router.get("/{quote_id}", response_model=QuoteResponse)
def get_quote(
    quote_id: str,
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """Busca detalhes de um orçamento da empresa ativa."""
    try:
        q_uuid = uuid.UUID(quote_id)
    except ValueError:
        raise NotFoundException("Orçamento não encontrado")

    quote = db.query(Quote).filter(Quote.id == q_uuid, Quote.company_id == tenant.company_id).first()
    if not quote:
        raise NotFoundException("Orçamento não encontrado nesta empresa")

    return _quote_to_response(quote, db)


@router.put("/{quote_id}", response_model=QuoteResponse)
def update_quote(
    quote_id: str,
    payload: QuoteCreate,
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """Atualiza dados do orçamento."""
    try:
        q_uuid = uuid.UUID(quote_id)
    except ValueError:
        raise NotFoundException("Orçamento não encontrado")

    quote = db.query(Quote).filter(Quote.id == q_uuid, Quote.company_id == tenant.company_id).first()
    if not quote:
        raise NotFoundException("Orçamento não encontrado")

    if payload.notes is not None:
        quote.notes = payload.notes
    if payload.discount is not None:
        quote.discount = payload.discount

    _recalculate_quote_totals(quote, db)
    db.commit()
    db.refresh(quote)

    return _quote_to_response(quote, db)


@router.post("/{quote_id}/approve", response_model=QuoteResponse)
def approve_quote(
    quote_id: str,
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """Aprova um orçamento comercial."""
    try:
        q_uuid = uuid.UUID(quote_id)
    except ValueError:
        raise NotFoundException("Orçamento não encontrado")

    quote = db.query(Quote).filter(Quote.id == q_uuid, Quote.company_id == tenant.company_id).first()
    if not quote:
        raise NotFoundException("Orçamento não encontrado")

    quote.status = "APPROVED"
    db.add(quote)

    log = AuditLog(
        id=uuid.uuid4(),
        company_id=tenant.company_id,
        user_id=tenant.user_id,
        action="QUOTE_APPROVED",
        entity_type="QUOTE",
        entity_id=str(quote.id),
        metadata_={"number": quote.number},
    )
    db.add(log)
    db.commit()
    db.refresh(quote)

    return _quote_to_response(quote, db)


@router.post("/{quote_id}/reject", response_model=QuoteResponse)
def reject_quote(
    quote_id: str,
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """Marca um orçamento como recusado."""
    try:
        q_uuid = uuid.UUID(quote_id)
    except ValueError:
        raise NotFoundException("Orçamento não encontrado")

    quote = db.query(Quote).filter(Quote.id == q_uuid, Quote.company_id == tenant.company_id).first()
    if not quote:
        raise NotFoundException("Orçamento não encontrado")

    quote.status = "REJECTED"
    db.add(quote)

    log = AuditLog(
        id=uuid.uuid4(),
        company_id=tenant.company_id,
        user_id=tenant.user_id,
        action="QUOTE_REJECTED",
        entity_type="QUOTE",
        entity_id=str(quote.id),
        metadata_={"number": quote.number},
    )
    db.add(log)
    db.commit()
    db.refresh(quote)

    return _quote_to_response(quote, db)


@router.get("/{quote_id}/items", response_model=List[QuoteItemResponse])
def get_quote_items(
    quote_id: str,
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """Lista itens de um orçamento."""
    try:
        q_uuid = uuid.UUID(quote_id)
    except ValueError:
        raise NotFoundException("Orçamento não encontrado")

    quote = db.query(Quote).filter(Quote.id == q_uuid, Quote.company_id == tenant.company_id).first()
    if not quote:
        raise NotFoundException("Orçamento não encontrado")

    return [
        QuoteItemResponse(
            id=str(it.id),
            productId=it.external_product_id,
            external_product_id=it.external_product_id,
            productName=it.product_name,
            product_name=it.product_name,
            quantity=float(it.quantity),
            unitPrice=float(it.unit_price),
            unit_price=float(it.unit_price),
            discount=float(it.discount),
            subtotal=float(it.subtotal),
        )
        for it in quote.items
    ]


@router.post("/{quote_id}/items", response_model=QuoteItemResponse, status_code=status.HTTP_201_CREATED)
def add_quote_item(
    quote_id: str,
    payload: QuoteItemCreate,
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """Adiciona um item ao orçamento e recalcula totais."""
    try:
        q_uuid = uuid.UUID(quote_id)
    except ValueError:
        raise NotFoundException("Orçamento não encontrado")

    quote = db.query(Quote).filter(Quote.id == q_uuid, Quote.company_id == tenant.company_id).first()
    if not quote:
        raise NotFoundException("Orçamento não encontrado")

    ext_id = payload.productId or payload.external_product_id or "prod-custom"
    p_name = payload.productName or payload.product_name or "Produto"
    u_price = payload.unitPrice if payload.unitPrice is not None else (payload.unit_price or 0.0)
    qty = max(0.01, payload.quantity)
    disc = max(0.0, payload.discount)
    sub = max(0.0, (qty * u_price) - disc)

    item = QuoteItem(
        id=uuid.uuid4(),
        quote_id=quote.id,
        external_product_id=ext_id,
        product_name=p_name,
        quantity=qty,
        unit_price=u_price,
        discount=disc,
        subtotal=sub,
    )
    db.add(item)
    db.flush()

    _recalculate_quote_totals(quote, db)
    db.commit()
    db.refresh(item)

    return QuoteItemResponse(
        id=str(item.id),
        productId=item.external_product_id,
        external_product_id=item.external_product_id,
        productName=item.product_name,
        product_name=item.product_name,
        quantity=float(item.quantity),
        unitPrice=float(item.unit_price),
        unit_price=float(item.unit_price),
        discount=float(item.discount),
        subtotal=float(item.subtotal),
    )


@router.put("/{quote_id}/items/{item_id}", response_model=QuoteItemResponse)
def update_quote_item(
    quote_id: str,
    item_id: str,
    payload: QuoteItemCreate,
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """Atualiza a quantidade ou valor de um item do orçamento."""
    try:
        q_uuid = uuid.UUID(quote_id)
        it_uuid = uuid.UUID(item_id)
    except ValueError:
        raise NotFoundException("Item ou orçamento não encontrado")

    quote = db.query(Quote).filter(Quote.id == q_uuid, Quote.company_id == tenant.company_id).first()
    if not quote:
        raise NotFoundException("Orçamento não encontrado")

    item = db.query(QuoteItem).filter(QuoteItem.id == it_uuid, QuoteItem.quote_id == quote.id).first()
    if not item:
        raise NotFoundException("Item não encontrado neste orçamento")

    if payload.quantity is not None:
        item.quantity = max(0.01, payload.quantity)
    if payload.unitPrice is not None or payload.unit_price is not None:
        item.unit_price = payload.unitPrice if payload.unitPrice is not None else payload.unit_price
    if payload.discount is not None:
        item.discount = max(0.0, payload.discount)

    item.subtotal = max(0.0, (float(item.quantity) * float(item.unit_price)) - float(item.discount))
    db.add(item)
    db.flush()

    _recalculate_quote_totals(quote, db)
    db.commit()
    db.refresh(item)

    return QuoteItemResponse(
        id=str(item.id),
        productId=item.external_product_id,
        external_product_id=item.external_product_id,
        productName=item.product_name,
        product_name=item.product_name,
        quantity=float(item.quantity),
        unitPrice=float(item.unit_price),
        unit_price=float(item.unit_price),
        discount=float(item.discount),
        subtotal=float(item.subtotal),
    )


@router.delete("/{quote_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quote_item(
    quote_id: str,
    item_id: str,
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """Remove um item do orçamento e atualiza os totais."""
    try:
        q_uuid = uuid.UUID(quote_id)
        it_uuid = uuid.UUID(item_id)
    except ValueError:
        raise NotFoundException("Item ou orçamento não encontrado")

    quote = db.query(Quote).filter(Quote.id == q_uuid, Quote.company_id == tenant.company_id).first()
    if not quote:
        raise NotFoundException("Orçamento não encontrado")

    item = db.query(QuoteItem).filter(QuoteItem.id == it_uuid, QuoteItem.quote_id == quote.id).first()
    if not item:
        raise NotFoundException("Item não encontrado")

    db.delete(item)
    db.flush()

    _recalculate_quote_totals(quote, db)
    db.commit()

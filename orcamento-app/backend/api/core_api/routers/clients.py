import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, func

from backend.database.business.connection import get_business_db
from backend.database.business.models import Client, Quote, AuditLog
from backend.shared.exceptions.exceptions import NotFoundException
from backend.shared.utils.date_utils import utc_now, format_date_br
from backend.api.core_api.dependencies import get_tenant_context, TenantContext
from backend.api.core_api.schemas import (
    ClientCreate,
    ClientUpdate,
    ClientResponse,
    QuoteResponse,
    QuoteItemResponse,
)

router = APIRouter(prefix="/clients", tags=["Clientes"])


def _client_to_response(client: Client, db: Session) -> ClientResponse:
    # Calcula métricas reais a partir dos orçamentos do cliente
    quotes = (
        db.query(Quote)
        .filter(Quote.client_id == client.id, Quote.company_id == client.company_id)
        .order_by(desc(Quote.created_at))
        .all()
    )

    quote_count = len(quotes)
    last_quote_value = float(quotes[0].total) if quotes else 0.0
    total_value = float(sum(q.total for q in quotes if q.status == "APPROVED"))

    return ClientResponse(
        id=str(client.id),
        name=client.name,
        email=client.email or "",
        phone=client.phone or "",
        document=client.cpf_cnpj or "",
        cpf_cnpj=client.cpf_cnpj or "",
        address=client.address or "",
        number=client.number or "",
        complement=client.complement or "",
        city=client.city or "",
        state=client.state or "",
        lastQuoteValue=last_quote_value,
        quoteCount=quote_count,
        totalValue=total_value,
    )


@router.get("", response_model=List[ClientResponse])
def list_clients(
    search: Optional[str] = Query(None, description="Busca por nome, e-mail ou documento"),
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """Lista clientes da empresa ativa (excluindo clientes soft-deleted)."""
    query = db.query(Client).filter(
        Client.company_id == tenant.company_id,
        Client.deleted_at.is_(None),
    )

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Client.name.ilike(s),
                Client.email.ilike(s),
                Client.cpf_cnpj.ilike(s),
            )
        )

    clients = query.order_by(Client.name.asc()).all()
    return [_client_to_response(c, db) for c in clients]


@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
    payload: ClientCreate,
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """Cadastra um novo cliente vinculado à empresa do tenant."""
    doc = payload.document or payload.cpf_cnpj

    client = Client(
        id=uuid.uuid4(),
        company_id=tenant.company_id,
        name=payload.name.strip(),
        cpf_cnpj=doc.strip() if doc else None,
        email=payload.email.strip() if payload.email else None,
        phone=payload.phone.strip() if payload.phone else None,
        address=payload.address.strip() if payload.address else None,
        number=payload.number.strip() if payload.number else None,
        complement=payload.complement.strip() if payload.complement else None,
        city=payload.city.strip() if payload.city else None,
        state=payload.state.strip() if payload.state else None,
    )
    db.add(client)

    # Registra no log de auditoria
    log = AuditLog(
        id=uuid.uuid4(),
        company_id=tenant.company_id,
        user_id=tenant.user_id,
        action="CLIENT_CREATED",
        entity_type="CLIENT",
        entity_id=str(client.id),
        metadata_={"name": client.name, "email": client.email},
    )
    db.add(log)
    db.commit()
    db.refresh(client)

    return _client_to_response(client, db)


@router.get("/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: str,
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """Retorna detalhes de um cliente da empresa ativa."""
    try:
        c_uuid = uuid.UUID(client_id)
    except ValueError:
        raise NotFoundException("Cliente não encontrado")

    client = (
        db.query(Client)
        .filter(
            Client.id == c_uuid,
            Client.company_id == tenant.company_id,
            Client.deleted_at.is_(None),
        )
        .first()
    )
    if not client:
        raise NotFoundException("Cliente não encontrado nesta empresa")

    return _client_to_response(client, db)


@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: str,
    payload: ClientUpdate,
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """Atualiza dados do cliente."""
    try:
        c_uuid = uuid.UUID(client_id)
    except ValueError:
        raise NotFoundException("Cliente não encontrado")

    client = (
        db.query(Client)
        .filter(
            Client.id == c_uuid,
            Client.company_id == tenant.company_id,
            Client.deleted_at.is_(None),
        )
        .first()
    )
    if not client:
        raise NotFoundException("Cliente não encontrado")

    if payload.name is not None:
        client.name = payload.name.strip()
    doc = payload.document or payload.cpf_cnpj
    if doc is not None:
        client.cpf_cnpj = doc.strip()
    if payload.email is not None:
        client.email = payload.email.strip()
    if payload.phone is not None:
        client.phone = payload.phone.strip()
    if payload.address is not None:
        client.address = payload.address.strip()
    if payload.number is not None:
        client.number = payload.number.strip()
    if payload.complement is not None:
        client.complement = payload.complement.strip()
    if payload.city is not None:
        client.city = payload.city.strip()
    if payload.state is not None:
        client.state = payload.state.strip()

    db.add(client)
    db.commit()
    db.refresh(client)

    return _client_to_response(client, db)


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(
    client_id: str,
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """Realiza Soft Delete do cliente para preservar histórico comercial."""
    try:
        c_uuid = uuid.UUID(client_id)
    except ValueError:
        raise NotFoundException("Cliente não encontrado")

    client = (
        db.query(Client)
        .filter(
            Client.id == c_uuid,
            Client.company_id == tenant.company_id,
            Client.deleted_at.is_(None),
        )
        .first()
    )
    if not client:
        raise NotFoundException("Cliente não encontrado")

    client.deleted_at = utc_now()
    db.add(client)

    log = AuditLog(
        id=uuid.uuid4(),
        company_id=tenant.company_id,
        user_id=tenant.user_id,
        action="CLIENT_ARCHIVED",
        entity_type="CLIENT",
        entity_id=str(client.id),
        metadata_={"name": client.name},
    )
    db.add(log)
    db.commit()


@router.get("/{client_id}/quotes", response_model=List[QuoteResponse])
def get_client_quotes(
    client_id: str,
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """Lista todos os orçamentos associados a um cliente."""
    try:
        c_uuid = uuid.UUID(client_id)
    except ValueError:
        raise NotFoundException("Cliente não encontrado")

    quotes = (
        db.query(Quote)
        .filter(Quote.client_id == c_uuid, Quote.company_id == tenant.company_id)
        .order_by(desc(Quote.created_at))
        .all()
    )

    client = db.query(Client).filter(Client.id == c_uuid).first()
    client_name = client.name if client else "Cliente"

    results = []
    for q in quotes:
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

        results.append(
            QuoteResponse(
                id=str(q.id),
                number=q.number,
                clientId=str(q.client_id),
                client_id=str(q.client_id),
                clientName=client_name,
                client_name=client_name,
                status=q.status,
                createdAt=format_date_br(q.created_at),
                created_at=str(q.created_at),
                validUntil=format_date_br(datetime.combine(q.valid_until, datetime.min.time())) if q.valid_until else "",
                valid_until=str(q.valid_until) if q.valid_until else "",
                subtotal=float(q.subtotal),
                discount=float(q.discount),
                total=float(q.total),
                notes=q.notes or "",
                items=items_resp,
            )
        )
    return results

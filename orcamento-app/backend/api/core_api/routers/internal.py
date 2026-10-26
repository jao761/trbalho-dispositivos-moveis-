from typing import Optional, List, Dict, Any
import uuid
from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database.business.connection import get_business_db
from backend.database.business.models import Quote, Client
from backend.shared.auth.dependencies import verify_internal_api_key
from backend.shared.exceptions.exceptions import (
    NotFoundException,
    BadRequestException,
    ForbiddenTenantException,
)

router = APIRouter(prefix="/internal", tags=["Interno"])


class InternalItemContext(BaseModel):
    external_product_id: str
    product_name: str
    quantity: float
    unit_price: float
    subtotal: float


class OrderContextResponse(BaseModel):
    quote_id: str
    quote_number: str
    company_id: str
    created_by_user_id: str
    client_name: str
    total: float
    items: List[InternalItemContext]


@router.get(
    "/quotes/{quote_id}/order-context",
    response_model=OrderContextResponse,
    dependencies=[Depends(verify_internal_api_key)],
)
def get_quote_order_context(
    quote_id: str,
    x_company_id: Optional[str] = Header(None, alias="X-Company-ID"),
    db: Session = Depends(get_business_db),
):
    """
    Fornece o contexto de um orçamento aprovado à Order API.
    Exige autenticação de serviço interna (X-Internal-Key) e validação do tenant (X-Company-ID).
    """
    try:
        q_uuid = uuid.UUID(quote_id)
    except ValueError:
        raise NotFoundException("Orçamento não encontrado")

    quote = db.query(Quote).filter(Quote.id == q_uuid).first()
    if not quote:
        raise NotFoundException("Orçamento não encontrado")

    if x_company_id:
        try:
            target_company_id = uuid.UUID(x_company_id)
            if quote.company_id != target_company_id:
                raise ForbiddenTenantException("Orçamento não pertence a esta empresa")
        except ValueError:
            raise BadRequestException("X-Company-ID inválido")

    if quote.status != "APPROVED":
        raise BadRequestException(
            f"O orçamento deve estar aprovado para gerar pedido. Status atual: {quote.status}"
        )

    client = db.query(Client).filter(Client.id == quote.client_id).first()
    client_name = client.name if client else "Cliente Geral"

    items_list = [
        InternalItemContext(
            external_product_id=it.external_product_id,
            product_name=it.product_name,
            quantity=float(it.quantity),
            unit_price=float(it.unit_price),
            subtotal=float(it.subtotal),
        )
        for it in quote.items
    ]

    return OrderContextResponse(
        quote_id=str(quote.id),
        quote_number=quote.number,
        company_id=str(quote.company_id),
        created_by_user_id=str(quote.created_by_user_id),
        client_name=client_name,
        total=float(quote.total),
        items=items_list,
    )

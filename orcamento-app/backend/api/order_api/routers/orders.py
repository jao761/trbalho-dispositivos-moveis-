import uuid
from typing import List, Dict, Set
from fastapi import APIRouter, Depends, status
import httpx
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.database.commerce.connection import get_commerce_db
from backend.database.commerce.models import Order, OrderItem
from backend.shared.config.settings import settings
from backend.shared.exceptions.exceptions import (
    NotFoundException,
    BadRequestException,
    ForbiddenTenantException,
)
from backend.shared.utils.date_utils import format_date_br
from backend.api.order_api.dependencies import get_order_tenant_context, OrderTenantContext
from backend.api.order_api.schemas import (
    OrderResponse,
    OrderItemResponse,
    OrderStatusUpdate,
)

router = APIRouter(prefix="/orders", tags=["Pedidos"])

# Regras de transição de status permitidas
ALLOWED_TRANSITIONS: Dict[str, Set[str]] = {
    "PENDING": {"PAYMENT_PENDING", "CANCELLED"},
    "PAYMENT_PENDING": {"PAID", "CANCELLED"},
    "PAID": {"PROCESSING", "CANCELLED"},
    "PROCESSING": {"SHIPPED", "CANCELLED"},
    "SHIPPED": {"DELIVERED"},
    "DELIVERED": set(),
    "CANCELLED": set(),
}

STATUS_NORMALIZATION: Dict[str, str] = {
    "AGUARDANDO PAGAMENTO": "PAYMENT_PENDING",
    "PAGO": "PAID",
    "PROCESSANDO": "PROCESSING",
    "ENVIADO": "SHIPPED",
    "ENTREGUE": "DELIVERED",
    "CANCELADO": "CANCELLED",
    "PENDENTE": "PENDING",
}


def _order_to_response(order: Order) -> OrderResponse:
    items_resp = [
        OrderItemResponse(
            id=str(it.id),
            productId=it.external_product_id,
            external_product_id=it.external_product_id,
            productName=it.product_name,
            product_name=it.product_name,
            quantity=float(it.quantity),
            unitPrice=float(it.unit_price),
            unit_price=float(it.unit_price),
            subtotal=float(it.subtotal),
        )
        for it in order.items
    ]

    return OrderResponse(
        id=str(order.id),
        number=order.number,
        clientName=order.client_name,
        client_name=order.client_name,
        quoteId=str(order.quote_id),
        quote_id=str(order.quote_id),
        total=float(order.total),
        status=order.status,
        createdAt=format_date_br(order.created_at),
        created_at=str(order.created_at),
        items=items_resp,
    )


@router.get("", response_model=List[OrderResponse])
def list_orders(
    tenant: OrderTenantContext = Depends(get_order_tenant_context),
    db: Session = Depends(get_commerce_db),
):
    """Lista todos os pedidos da empresa autenticada."""
    orders = (
        db.query(Order)
        .filter(Order.company_id == tenant.company_id)
        .order_by(desc(Order.created_at))
        .all()
    )
    return [_order_to_response(o) for o in orders]


@router.post("/from-quote/{quote_id}", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order_from_quote(
    quote_id: str,
    tenant: OrderTenantContext = Depends(get_order_tenant_context),
    db: Session = Depends(get_commerce_db),
):
    """
    Converte um orçamento aprovado da Core API em um pedido no commerce_db.
    A Order API NÃO consulta as tabelas internas de quotes; ela se comunica
    via endpoint interno autenticado da Core API.
    """
    # 1. Consulta Core API internamente
    url = f"{settings.CORE_API_URL}/internal/quotes/{quote_id}/order-context"
    headers = {
        "X-Internal-Key": settings.INTERNAL_API_KEY,
        "X-Company-ID": str(tenant.company_id),
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(url, headers=headers)
            if res.status_code == 404:
                raise NotFoundException("Orçamento não encontrado na Core API")
            if res.status_code == 403:
                raise ForbiddenTenantException("Orçamento não pertence à sua empresa")
            if res.status_code == 400:
                detail = res.json().get("detail", "Orçamento não aprovado")
                raise BadRequestException(detail)
            if res.status_code != 200:
                raise BadRequestException(f"Erro ao consultar Core API: {res.text}")

            context_data = res.json()
    except httpx.RequestError as exc:
        raise BadRequestException(f"Falha de comunicação com Core API: {str(exc)}")

    # 2. Gera número sequencial de pedido
    count = db.query(Order).filter(Order.company_id == tenant.company_id).count()
    order_number = f"00{count + 1:04d}"

    # 3. Cria pedido no commerce_db
    order_id = uuid.uuid4()
    order = Order(
        id=order_id,
        company_id=tenant.company_id,
        created_by_user_id=tenant.user_id,
        quote_id=uuid.UUID(context_data["quote_id"]),
        number=order_number,
        client_name=context_data["client_name"],
        status="PAYMENT_PENDING",
        total=context_data["total"],
    )
    db.add(order)
    db.flush()

    # 4. Cria itens com snapshot
    for it in context_data.get("items", []):
        order_item = OrderItem(
            id=uuid.uuid4(),
            order_id=order.id,
            external_product_id=it["external_product_id"],
            product_name=it["product_name"],
            quantity=it["quantity"],
            unit_price=it["unit_price"],
            subtotal=it["subtotal"],
        )
        db.add(order_item)

    db.commit()
    db.refresh(order)

    return _order_to_response(order)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: str,
    tenant: OrderTenantContext = Depends(get_order_tenant_context),
    db: Session = Depends(get_commerce_db),
):
    """Busca detalhes de um pedido da empresa."""
    try:
        o_uuid = uuid.UUID(order_id)
    except ValueError:
        raise NotFoundException("Pedido não encontrado")

    order = db.query(Order).filter(Order.id == o_uuid, Order.company_id == tenant.company_id).first()
    if not order:
        raise NotFoundException("Pedido não encontrado nesta empresa")

    return _order_to_response(order)


@router.get("/{order_id}/items", response_model=List[OrderItemResponse])
def get_order_items(
    order_id: str,
    tenant: OrderTenantContext = Depends(get_order_tenant_context),
    db: Session = Depends(get_commerce_db),
):
    """Lista itens de um pedido."""
    try:
        o_uuid = uuid.UUID(order_id)
    except ValueError:
        raise NotFoundException("Pedido não encontrado")

    order = db.query(Order).filter(Order.id == o_uuid, Order.company_id == tenant.company_id).first()
    if not order:
        raise NotFoundException("Pedido não encontrado nesta empresa")

    return [
        OrderItemResponse(
            id=str(it.id),
            productId=it.external_product_id,
            external_product_id=it.external_product_id,
            productName=it.product_name,
            product_name=it.product_name,
            quantity=float(it.quantity),
            unitPrice=float(it.unit_price),
            unit_price=float(it.unit_price),
            subtotal=float(it.subtotal),
        )
        for it in order.items
    ]


@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: str,
    payload: OrderStatusUpdate,
    tenant: OrderTenantContext = Depends(get_order_tenant_context),
    db: Session = Depends(get_commerce_db),
):
    """
    Atualiza o status de um pedido com base nas regras de transição válidas:
    PENDING -> PAYMENT_PENDING -> PAID -> PROCESSING -> SHIPPED -> DELIVERED
    Cancelamentos: PENDING/PAYMENT_PENDING/PAID/PROCESSING -> CANCELLED
    """
    try:
        o_uuid = uuid.UUID(order_id)
    except ValueError:
        raise NotFoundException("Pedido não encontrado")

    order = db.query(Order).filter(Order.id == o_uuid, Order.company_id == tenant.company_id).first()
    if not order:
        raise NotFoundException("Pedido não encontrado")

    new_status = STATUS_NORMALIZATION.get(payload.status.strip().upper(), payload.status.strip().upper())
    current_status = order.status

    allowed = ALLOWED_TRANSITIONS.get(current_status, set())
    if new_status not in allowed and new_status != current_status:
        raise BadRequestException(
            f"Transição inválida de status: '{current_status}' não pode mudar diretamente para '{new_status}'."
        )

    order.status = new_status
    db.add(order)
    db.commit()
    db.refresh(order)

    return _order_to_response(order)

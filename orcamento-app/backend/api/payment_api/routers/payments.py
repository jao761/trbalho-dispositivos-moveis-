import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
import httpx

from backend.database.commerce.connection import get_commerce_db
from backend.database.commerce.models import Payment, Order
from backend.api.payment_api.dependencies import (
    PaymentTenantContext,
    get_payment_tenant_context,
)
from backend.api.payment_api.schemas import (
    PaymentCreate,
    PaymentResponse,
    PaymentSimulateRequest,
)
from backend.shared.config.settings import settings
from backend.shared.exceptions.exceptions import (
    NotFoundException,
    BadRequestException,
    ForbiddenTenantException,
)
from backend.shared.utils.date_utils import utc_now

router = APIRouter(prefix="/payments", tags=["Pagamentos"])


def map_payment_response(p: Payment) -> PaymentResponse:
    # Mapeia status para compatibilidade com português/inglês no frontend
    status_map = {
        "PENDING": "PENDENTE",
        "APPROVED": "APROVADO",
        "REJECTED": "RECUSADO",
        "REFUNDED": "ESTORNADO",
        "CANCELLED": "CANCELADO",
    }
    frontend_status = status_map.get(p.status, p.status)

    return PaymentResponse(
        id=str(p.id),
        company_id=str(p.company_id),
        order_id=str(p.order_id),
        orderId=str(p.order_id),
        order_number=p.order_number,
        orderNumber=p.order_number,
        provider=p.provider,
        external_payment_id=p.external_payment_id,
        amount=float(p.amount),
        currency=p.currency,
        status=frontend_status,
        payment_method=p.payment_method or "Pix",
        method=p.payment_method or "Pix",
        created_at=p.created_at.strftime("%d/%m/%Y") if p.created_at else "",
        createdAt=p.created_at.strftime("%d/%m/%Y") if p.created_at else "",
        updated_at=p.updated_at.isoformat() if p.updated_at else None,
    )


@router.get("", response_model=List[PaymentResponse])
def list_payments(
    order_id: Optional[str] = Query(None, description="Filtrar por pedido específico"),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    tenant: PaymentTenantContext = Depends(get_payment_tenant_context),
    db: Session = Depends(get_commerce_db),
):
    """Lista todos os pagamentos da empresa autenticada com isolamento multi-tenant estrito."""
    query = db.query(Payment).filter(Payment.company_id == tenant.company_id)

    if order_id:
        try:
            o_uuid = uuid.UUID(order_id)
            query = query.filter(Payment.order_id == o_uuid)
        except ValueError:
            raise BadRequestException("ID de pedido inválido")

    if status:
        # Suporta status em inglês ou português
        status_reverse_map = {
            "PENDENTE": "PENDING",
            "APROVADO": "APPROVED",
            "RECUSADO": "REJECTED",
            "ESTORNADO": "REFUNDED",
            "CANCELADO": "CANCELLED",
        }
        db_status = status_reverse_map.get(status.upper(), status.upper())
        query = query.filter(Payment.status == db_status)

    payments = query.order_by(Payment.created_at.desc()).all()
    return [map_payment_response(p) for p in payments]


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: str,
    tenant: PaymentTenantContext = Depends(get_payment_tenant_context),
    db: Session = Depends(get_commerce_db),
):
    """Retorna detalhes de um pagamento específico do tenant."""
    try:
        p_uuid = uuid.UUID(payment_id)
    except ValueError:
        raise NotFoundException("Pagamento não encontrado")

    payment = (
        db.query(Payment)
        .filter(Payment.id == p_uuid, Payment.company_id == tenant.company_id)
        .first()
    )
    if not payment:
        raise NotFoundException("Pagamento não encontrado")

    return map_payment_response(payment)


@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    payload: PaymentCreate,
    tenant: PaymentTenantContext = Depends(get_payment_tenant_context),
    db: Session = Depends(get_commerce_db),
):
    """Cria uma cobrança/pagamento para um pedido da empresa."""
    try:
        o_uuid = uuid.UUID(payload.order_id)
    except ValueError:
        raise BadRequestException("ID de pedido inválido")

    # Verifica se o pedido existe e pertence à empresa autenticada
    order = (
        db.query(Order)
        .filter(Order.id == o_uuid, Order.company_id == tenant.company_id)
        .first()
    )
    if not order:
        raise NotFoundException("Pedido não encontrado ou você não tem acesso")

    payment_amount = payload.amount if payload.amount is not None else float(order.total)
    if payment_amount <= 0:
        raise BadRequestException("Valor do pagamento deve ser maior que zero")

    new_payment = Payment(
        id=uuid.uuid4(),
        company_id=tenant.company_id,
        order_id=order.id,
        order_number=order.number,
        provider=payload.provider or "SIMULATED",
        external_payment_id=f"sim_pay_{uuid.uuid4().hex[:12]}",
        amount=payment_amount,
        currency="BRL",
        status="PENDING",
        payment_method=payload.payment_method or "Pix",
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    db.add(new_payment)

    # Se o pedido estiver como PENDING, atualiza para PAYMENT_PENDING
    if order.status == "PENDING":
        order.status = "PAYMENT_PENDING"
        db.add(order)

    db.commit()
    db.refresh(new_payment)

    return map_payment_response(new_payment)


@router.post("/{payment_id}/simulate", response_model=PaymentResponse)
def simulate_payment(
    payment_id: str,
    payload: PaymentSimulateRequest,
    tenant: PaymentTenantContext = Depends(get_payment_tenant_context),
    db: Session = Depends(get_commerce_db),
):
    """Simula a confirmação ou recusa de um pagamento pelo gateway."""
    try:
        p_uuid = uuid.UUID(payment_id)
    except ValueError:
        raise NotFoundException("Pagamento não encontrado")

    payment = (
        db.query(Payment)
        .filter(Payment.id == p_uuid, Payment.company_id == tenant.company_id)
        .first()
    )
    if not payment:
        raise NotFoundException("Pagamento não encontrado")

    target_status = payload.status.upper() if payload.status else "APPROVED"

    if target_status in ["APPROVED", "PAID", "APROVADO"]:
        payment.status = "APPROVED"
        payment.updated_at = utc_now()
        db.add(payment)

        # Atualiza o pedido diretamente no commerce_db
        order = db.query(Order).filter(Order.id == payment.order_id).first()
        if order:
            order.status = "PAID"
            db.add(order)

        db.commit()
        db.refresh(payment)

        # Notifica o Order API via endpoint interno
        try:
            with httpx.Client(timeout=5.0) as client:
                client.put(
                    f"{settings.ORDER_API_URL}/internal/orders/{payment.order_id}/mark-paid",
                    headers={"X-Internal-Key": settings.INTERNAL_API_KEY},
                )
        except Exception:
            pass  # Já garantido localmente no banco compartilhado commerce_db
    elif target_status in ["REJECTED", "RECUSADO"]:
        payment.status = "REJECTED"
        payment.updated_at = utc_now()
        db.add(payment)
        db.commit()
        db.refresh(payment)
    else:
        raise BadRequestException(f"Status '{payload.status}' não suportado para simulação")

    return map_payment_response(payment)

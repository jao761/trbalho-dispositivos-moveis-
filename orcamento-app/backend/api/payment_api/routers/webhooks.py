import uuid
from typing import Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
import httpx

from backend.database.commerce.connection import get_commerce_db
from backend.database.commerce.models import Payment, Order, PaymentEvent
from backend.api.payment_api.schemas import WebhookPaymentPayload
from backend.shared.config.settings import settings
from backend.shared.utils.date_utils import utc_now

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@router.post("/payment", status_code=status.HTTP_200_OK)
def handle_payment_webhook(
    event: WebhookPaymentPayload,
    db: Session = Depends(get_commerce_db),
):
    """
    Processador de Webhook idempotente para eventos de gateways de pagamento.
    Garante que eventos duplicados (mesmo provider e external_event_id) sejam ignorados com segurança.
    """
    # 1. Verificação de idempotência
    existing_event = (
        db.query(PaymentEvent)
        .filter(
            PaymentEvent.provider == event.provider,
            PaymentEvent.external_event_id == event.external_event_id,
        )
        .first()
    )

    if existing_event:
        return {
            "status": "ignored",
            "reason": "duplicate_event",
            "external_event_id": event.external_event_id,
            "processed_at": existing_event.processed_at.isoformat() if existing_event.processed_at else None,
        }

    # 2. Localização do pagamento no banco
    payment = None
    if event.payment_id:
        try:
            p_uuid = uuid.UUID(event.payment_id)
            payment = db.query(Payment).filter(Payment.id == p_uuid).first()
        except ValueError:
            pass

    if not payment and event.external_payment_id:
        payment = (
            db.query(Payment)
            .filter(
                Payment.provider == event.provider,
                Payment.external_payment_id == event.external_payment_id,
            )
            .first()
        )

    if not payment and event.order_id:
        try:
            o_uuid = uuid.UUID(event.order_id)
            payment = (
                db.query(Payment)
                .filter(Payment.order_id == o_uuid)
                .order_by(Payment.created_at.desc())
                .first()
            )
        except ValueError:
            pass

    # 3. Registro do evento recebido para auditoria e garantia de idempotência
    new_event = PaymentEvent(
        id=uuid.uuid4(),
        payment_id=payment.id if payment else None,
        provider=event.provider,
        external_event_id=event.external_event_id,
        event_type=event.event_type,
        payload=event.payload or {},
        received_at=utc_now(),
        processed_at=None,
    )
    db.add(new_event)
    db.flush()

    # 4. Transição de status do pagamento e notificação do pedido
    status_upper = event.status.upper()
    order_marked_paid = False

    if payment:
        if status_upper in ["APPROVED", "PAID", "CONFIRMED", "SUCCESS", "APROVADO"]:
            payment.status = "APPROVED"
            payment.updated_at = utc_now()
            db.add(payment)

            # Atualiza o pedido diretamente no commerce_db
            order = db.query(Order).filter(Order.id == payment.order_id).first()
            if order:
                order.status = "PAID"
                db.add(order)
                order_marked_paid = True

            # Notifica também o Order API via endpoint interno
            try:
                with httpx.Client(timeout=5.0) as client:
                    client.put(
                        f"{settings.ORDER_API_URL}/internal/orders/{payment.order_id}/mark-paid",
                        headers={"X-Internal-Key": settings.INTERNAL_API_KEY},
                    )
            except Exception:
                pass
        elif status_upper in ["REJECTED", "FAILED", "CANCELLED", "RECUSADO"]:
            payment.status = "REJECTED"
            payment.updated_at = utc_now()
            db.add(payment)
        elif status_upper in ["REFUNDED", "ESTORNADO"]:
            payment.status = "REFUNDED"
            payment.updated_at = utc_now()
            db.add(payment)

    new_event.processed_at = utc_now()
    db.commit()

    return {
        "status": "processed",
        "external_event_id": event.external_event_id,
        "payment_id": str(payment.id) if payment else None,
        "payment_status": payment.status if payment else None,
        "order_marked_paid": order_marked_paid,
    }

import uuid
from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database.commerce.connection import get_commerce_db
from backend.database.commerce.models import Order
from backend.shared.auth.dependencies import verify_internal_api_key
from backend.shared.exceptions.exceptions import NotFoundException, ForbiddenTenantException

router = APIRouter(prefix="/internal", tags=["Interno"])

MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]


def _recent_months(count: int = 6) -> list[tuple[int, int, str]]:
    """Últimos meses do calendário, incluindo o atual, sem uma janela fixa no código."""
    year, month = datetime.now().year, datetime.now().month
    months: list[tuple[int, int, str]] = []
    for _ in range(count):
        months.append((year, month, f"{MONTH_NAMES[month - 1]}/{str(year)[-2:]}"))
        month -= 1
        if month == 0:
            month, year = 12, year - 1
    return list(reversed(months))


class OrdersSummaryResponse(BaseModel):
    sales_total: float
    orders_count: int
    sales_by_month: Dict[str, float]


@router.get(
    "/companies/{company_id}/orders-summary",
    response_model=OrdersSummaryResponse,
    dependencies=[Depends(verify_internal_api_key)],
)
def get_company_orders_summary(
    company_id: str,
    db: Session = Depends(get_commerce_db),
):
    """
    Retorna o resumo real de vendas da empresa para o agregador do Dashboard.
    Vendas reais = pedidos com status PAID, PROCESSING, SHIPPED ou DELIVERED.
    """
    try:
        c_uuid = uuid.UUID(company_id)
    except ValueError:
        raise NotFoundException("ID de empresa inválido")

    # Filtra pedidos efetivamente comercializados
    orders = (
        db.query(Order)
        .filter(
            Order.company_id == c_uuid,
            Order.status.in_(["PAID", "PROCESSING", "SHIPPED", "DELIVERED"]),
        )
        .all()
    )

    sales_total = sum(float(o.total) for o in orders)
    recent_months = _recent_months()
    month_labels = {(year, month): label for year, month, label in recent_months}
    sales_by_month: Dict[str, float] = {label: 0.0 for _, _, label in recent_months}

    for o in orders:
        lbl = month_labels.get((o.created_at.year, o.created_at.month))
        if lbl:
            sales_by_month[lbl] = sales_by_month.get(lbl, 0.0) + float(o.total)

    return OrdersSummaryResponse(
        sales_total=round(sales_total, 2),
        orders_count=len(orders),
        sales_by_month={k: round(v, 2) for k, v in sales_by_month.items()},
    )


@router.put(
    "/orders/{order_id}/mark-paid",
    dependencies=[Depends(verify_internal_api_key)],
)
def mark_order_paid(
    order_id: str,
    db: Session = Depends(get_commerce_db),
):
    """Atualiza o status do pedido para PAID quando o pagamento for aprovado."""
    try:
        o_uuid = uuid.UUID(order_id)
    except ValueError:
        raise NotFoundException("Pedido não encontrado")

    order = db.query(Order).filter(Order.id == o_uuid).first()
    if not order:
        raise NotFoundException("Pedido não encontrado")

    order.status = "PAID"
    db.add(order)
    db.commit()

    return {"status": "ok", "order_id": str(order.id), "order_status": "PAID"}

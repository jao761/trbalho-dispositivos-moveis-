from typing import List, Dict, Any
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database.business.connection import get_business_db
from backend.database.business.models import Quote, Client
from backend.shared.config.settings import settings
from backend.api.core_api.dependencies import get_tenant_context, TenantContext
from backend.api.core_api.schemas import DashboardResponse, SalesMonth

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardResponse)
async def get_dashboard(
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """
    Retorna indicadores consolidados do dashboard.
    Regra de negócio para vendas (salesTotal):
    Representa o somatório de pedidos efetivamente comercializados/pagos obtidos via Order API.
    """
    # 1. Indicadores do business_db
    quotes = db.query(Quote).filter(Quote.company_id == tenant.company_id).all()
    quote_count = len(quotes)
    approved_count = sum(1 for q in quotes if q.status == "APPROVED")
    pending_count = sum(1 for q in quotes if q.status in ["DRAFT", "SENT"])
    rejected_count = sum(1 for q in quotes if q.status == "REJECTED")

    clients_total = (
        db.query(Client)
        .filter(Client.company_id == tenant.company_id, Client.deleted_at.is_(None))
        .count()
    )

    # 2. Consulta agregadora à Order API interna para obter vendas reais
    sales_total = 0.0
    sales_by_month_dict: Dict[str, float] = {}

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            headers = {
                "X-Internal-Key": settings.INTERNAL_API_KEY,
                "X-Company-ID": str(tenant.company_id),
            }
            res = await client.get(
                f"{settings.ORDER_API_URL}/internal/companies/{tenant.company_id}/orders-summary",
                headers=headers,
            )
            if res.status_code == 200:
                data = res.json()
                sales_total = float(data.get("sales_total", 0.0))
                monthly_data = data.get("sales_by_month", {})
                for k, v in monthly_data.items():
                    sales_by_month_dict[k] = float(v)
            else:
                raise HTTPException(status_code=503, detail="A API de pedidos não está disponível")
    except HTTPException:
        raise
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="A API de pedidos não está disponível") from exc

    sales_by_month = [
        SalesMonth(label=k, value=round(v, 2))
        for k, v in sales_by_month_dict.items()
    ]

    # Ticket médio calculado pelas vendas totais / quantidade de propostas aprovadas
    avg_ticket = round(sales_total / approved_count, 2) if approved_count > 0 else 0.0

    return DashboardResponse(
        salesTotal=round(sales_total, 2),
        quoteCount=quote_count,
        approvedCount=approved_count,
        pendingCount=pending_count,
        rejectedCount=rejected_count,
        clientsTotal=clients_total,
        averageTicket=avg_ticket,
        salesByMonth=sales_by_month,
    )

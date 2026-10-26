from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.database.business.connection import get_business_db
from backend.database.business.models import AuditLog
from backend.shared.utils.date_utils import format_date_br
from backend.api.core_api.dependencies import get_tenant_context, TenantContext
from backend.api.core_api.schemas import HistoryItem

router = APIRouter(prefix="/history", tags=["Histórico"])

ACTION_TITLES = {
    "CLIENT_CREATED": ("Cliente cadastrado", "primary"),
    "CLIENT_ARCHIVED": ("Cliente arquivado", "warning"),
    "QUOTE_CREATED": ("Orçamento criado", "primary"),
    "QUOTE_APPROVED": ("Orçamento aprovado", "success"),
    "QUOTE_REJECTED": ("Orçamento recusado", "warning"),
    "ORDER_CREATED": ("Pedido gerado", "success"),
    "PAYMENT_APPROVED": ("Pagamento aprovado", "success"),
}


@router.get("", response_model=List[HistoryItem])
def get_company_history(
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """Retorna o histórico cronológico de atividades da empresa."""
    logs = (
        db.query(AuditLog)
        .filter(AuditLog.company_id == tenant.company_id)
        .order_by(desc(AuditLog.created_at))
        .limit(50)
        .all()
    )

    results = []
    for log in logs:
        default_title, default_tone = ACTION_TITLES.get(log.action, (log.action.replace("_", " ").title(), "primary"))
        
        detail_msg = ""
        meta = log.metadata_ or {}
        if "number" in meta and "client" in meta:
            detail_msg = f"Orçamento #{meta['number']} para {meta['client']}"
        elif "number" in meta:
            detail_msg = f"Documento #{meta['number']}"
        elif "name" in meta:
            detail_msg = f"{meta['name']}"
        else:
            detail_msg = f"Ação executada: {log.action}"

        results.append(
            HistoryItem(
                id=str(log.id),
                date=format_date_br(log.created_at),
                title=default_title,
                detail=detail_msg,
                tone=default_tone,
            )
        )
    return results

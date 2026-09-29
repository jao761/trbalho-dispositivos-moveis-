from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database.business.connection import get_business_db
from backend.database.business.models import Company
from backend.api.core_api.dependencies import get_tenant_context, TenantContext
from backend.api.core_api.schemas import CompanyResponse

router = APIRouter(prefix="/companies", tags=["Empresas"])


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    cnpj: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


@router.get("/me", response_model=CompanyResponse)
def get_current_company(tenant: TenantContext = Depends(get_tenant_context)):
    """Retorna os dados da empresa ativa."""
    c = tenant.company
    return CompanyResponse(
        id=str(c.id),
        name=c.name,
        cnpj=c.cnpj,
        email=c.email,
        phone=c.phone,
        address=c.address,
    )


@router.put("/me", response_model=CompanyResponse)
def update_current_company(
    payload: CompanyUpdate,
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """Atualiza dados cadastrais da empresa ativa."""
    company = tenant.company
    if payload.name is not None:
        company.name = payload.name.strip()
    if payload.cnpj is not None:
        company.cnpj = payload.cnpj.strip()
    if payload.email is not None:
        company.email = payload.email.strip()
    if payload.phone is not None:
        company.phone = payload.phone.strip()
    if payload.address is not None:
        company.address = payload.address.strip()

    db.add(company)
    db.commit()
    db.refresh(company)

    return CompanyResponse(
        id=str(company.id),
        name=company.name,
        cnpj=company.cnpj,
        email=company.email,
        phone=company.phone,
        address=company.address,
    )

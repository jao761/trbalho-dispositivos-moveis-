from dataclasses import dataclass
from typing import Optional
import uuid
from fastapi import Depends, Header
from sqlalchemy.orm import Session

from backend.database.business.connection import get_business_db
from backend.database.business.models import User, Company, CompanyUser
from backend.shared.auth.dependencies import get_current_user_id
from backend.shared.exceptions.exceptions import UnauthorizedException, ForbiddenTenantException


@dataclass
class TenantContext:
    user: User
    company: Company
    role: str

    @property
    def user_id(self) -> uuid.UUID:
        return self.user.id

    @property
    def company_id(self) -> uuid.UUID:
        return self.company.id


def get_tenant_context(
    user_id_str: str = Depends(get_current_user_id),
    x_company_id: Optional[str] = Header(None, alias="X-Company-ID"),
    db: Session = Depends(get_business_db),
) -> TenantContext:
    """Identifica o usuário autenticado e descobre a empresa autorizada."""
    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        raise UnauthorizedException("ID de usuário inválido no token")

    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise UnauthorizedException("Usuário não encontrado")

    # Busca vínculos em company_users
    query = db.query(CompanyUser).filter(CompanyUser.user_id == user_uuid)
    
    if x_company_id:
        try:
            target_company_id = uuid.UUID(x_company_id)
            query = query.filter(CompanyUser.company_id == target_company_id)
        except ValueError:
            pass

    company_user = query.first()
    if not company_user:
        # Se tentou especificar empresa e falhou, ou não tem nenhuma
        if x_company_id:
            raise ForbiddenTenantException("Você não tem permissão para acessar esta empresa")
        raise ForbiddenTenantException("Usuário não possui nenhuma empresa associada")

    company = db.query(Company).filter(Company.id == company_user.company_id).first()
    if not company:
        raise ForbiddenTenantException("Empresa vinculada não encontrada")

    return TenantContext(
        user=user,
        company=company,
        role=company_user.role,
    )

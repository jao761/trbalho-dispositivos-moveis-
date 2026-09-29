from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from backend.database.business.connection import get_business_db
from backend.database.business.models import User, CompanyUser
from backend.shared.security.passwords import hash_password
from backend.shared.exceptions.exceptions import (
    NotFoundException,
    ConflictException,
    ForbiddenTenantException,
)
from backend.api.core_api.dependencies import get_tenant_context, TenantContext
from backend.api.core_api.schemas import UserResponse

router = APIRouter(prefix="/users", tags=["Usuários"])


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "SELLER"


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None


@router.get("", response_model=List[UserResponse])
def list_company_users(
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """Lista usuários associados à empresa do tenant autenticado."""
    company_users = (
        db.query(CompanyUser, User)
        .join(User, CompanyUser.user_id == User.id)
        .filter(CompanyUser.company_id == tenant.company_id)
        .all()
    )

    results = []
    for cu, u in company_users:
        parts = u.name.strip().split()
        initials = (parts[0][0] + (parts[-1][0] if len(parts) > 1 else "")).upper()
        results.append(
            UserResponse(
                id=str(u.id),
                name=u.name,
                email=u.email,
                initials=initials,
                role=cu.role,
            )
        )
    return results


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_company_user(
    payload: UserCreate,
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """Cria um novo usuário e o vincula à empresa do tenant."""
    if tenant.role not in ["ADMIN", "MANAGER"]:
        raise ForbiddenTenantException("Apenas administradores podem adicionar usuários")

    email_clean = payload.email.strip().lower()
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise ConflictException("Já existe um usuário com este e-mail")

    user = User(
        id=uuid.uuid4(),
        name=payload.name.strip(),
        email=email_clean,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.flush()

    cu = CompanyUser(
        id=uuid.uuid4(),
        company_id=tenant.company_id,
        user_id=user.id,
        role=payload.role.upper(),
    )
    db.add(cu)
    db.commit()

    parts = user.name.strip().split()
    initials = (parts[0][0] + (parts[-1][0] if len(parts) > 1 else "")).upper()
    return UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        initials=initials,
        role=cu.role,
    )


@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: str,
    tenant: TenantContext = Depends(get_tenant_context),
    db: Session = Depends(get_business_db),
):
    """Busca um usuário vinculado à empresa."""
    try:
        u_id = uuid.UUID(user_id)
    except ValueError:
        raise NotFoundException("Usuário não encontrado")

    cu = (
        db.query(CompanyUser)
        .filter(CompanyUser.company_id == tenant.company_id, CompanyUser.user_id == u_id)
        .first()
    )
    if not cu:
        raise NotFoundException("Usuário não encontrado nesta empresa")

    user = db.query(User).filter(User.id == u_id).first()
    if not user:
        raise NotFoundException("Usuário não encontrado")

    parts = user.name.strip().split()
    initials = (parts[0][0] + (parts[-1][0] if len(parts) > 1 else "")).upper()
    return UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        initials=initials,
        role=cu.role,
    )

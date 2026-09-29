import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.database.business.connection import get_business_db
from backend.database.business.models import User, Company, CompanyUser
from backend.shared.security.passwords import hash_password, verify_password
from backend.shared.security.jwt import create_access_token
from backend.shared.exceptions.exceptions import (
    BadRequestException,
    ConflictException,
    UnauthorizedException,
)
from backend.api.core_api.schemas import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    UserResponse,
    CompanyResponse,
)
from backend.api.core_api.dependencies import get_tenant_context, TenantContext

router = APIRouter(prefix="/auth", tags=["Autenticação"])


def _user_to_response(user: User, role: str = "ADMIN") -> UserResponse:
    parts = user.name.strip().split()
    initials = (parts[0][0] + (parts[-1][0] if len(parts) > 1 else "")).upper()
    return UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        initials=initials,
        role=role,
    )


def _company_to_response(company: Company) -> CompanyResponse:
    return CompanyResponse(
        id=str(company.id),
        name=company.name,
        cnpj=company.cnpj,
        email=company.email,
        phone=company.phone,
        address=company.address,
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_business_db)):
    """Cadastra um novo usuário e provisiona sua empresa com role ADMIN."""
    email_clean = payload.email.strip().lower()

    if payload.passwordConfirmation and payload.password != payload.passwordConfirmation:
        raise BadRequestException("A senha e a confirmação de senha não conferem")

    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise ConflictException("Já existe um usuário cadastrado com este e-mail")

    # Cria empresa
    company_name = payload.company_name.strip()
    company = Company(
        id=uuid.uuid4(),
        name=company_name,
    )
    db.add(company)
    db.flush()

    # Cria usuário
    user = User(
        id=uuid.uuid4(),
        name=payload.name.strip(),
        email=email_clean,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.flush()

    # Cria relação multiempresa como ADMIN
    company_user = CompanyUser(
        id=uuid.uuid4(),
        company_id=company.id,
        user_id=user.id,
        role="ADMIN",
    )
    db.add(company_user)
    db.commit()

    token = create_access_token({
        "sub": str(user.id),
        "user_id": str(user.id),
        "company_id": str(company.id),
        "role": "ADMIN",
    })

    return AuthResponse(
        token=token,
        user=_user_to_response(user, role="ADMIN"),
        company=_company_to_response(company),
    )


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_business_db)):
    """Autentica o usuário por e-mail e retorna JWT com contexto de empresa."""
    identifier = (payload.usernameOrEmail or payload.email or "").strip().lower()
    if not identifier:
        raise BadRequestException("Informe o usuário ou e-mail")

    user = db.query(User).filter(User.email == identifier).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise UnauthorizedException("E-mail ou senha incorretos")

    # Identifica a empresa do usuário em company_users
    company_user = db.query(CompanyUser).filter(CompanyUser.user_id == user.id).first()
    if not company_user:
        raise UnauthorizedException("Usuário não possui vínculo com nenhuma empresa")

    company = db.query(Company).filter(Company.id == company_user.company_id).first()
    if not company:
        raise UnauthorizedException("Empresa vinculada não encontrada")

    token = create_access_token({
        "sub": str(user.id),
        "user_id": str(user.id),
        "company_id": str(company.id),
        "role": company_user.role,
    })

    return AuthResponse(
        token=token,
        user=_user_to_response(user, role=company_user.role),
        company=_company_to_response(company),
    )


@router.get("/me", response_model=AuthResponse)
def get_me(tenant: TenantContext = Depends(get_tenant_context)):
    """Retorna os dados do usuário autenticado e da empresa ativa."""
    token = create_access_token({
        "sub": str(tenant.user.id),
        "user_id": str(tenant.user.id),
        "company_id": str(tenant.company.id),
        "role": tenant.role,
    })

    return AuthResponse(
        token=token,
        user=_user_to_response(tenant.user, role=tenant.role),
        company=_company_to_response(tenant.company),
    )

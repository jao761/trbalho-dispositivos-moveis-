from dataclasses import dataclass
from typing import Optional
import uuid
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from backend.database.commerce.connection import get_commerce_db
from backend.shared.security.jwt import decode_access_token
from backend.shared.exceptions.exceptions import UnauthorizedException, ForbiddenTenantException

security = HTTPBearer(auto_error=False)


@dataclass
class OrderTenantContext:
    user_id: uuid.UUID
    company_id: uuid.UUID
    role: str


def get_order_tenant_context(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> OrderTenantContext:
    """Extrai e valida user_id e company_id diretamente do JWT seguro."""
    if not credentials:
        raise UnauthorizedException("Token de autenticação não fornecido")
    try:
        payload = decode_access_token(credentials.credentials)
        user_id_str = payload.get("user_id") or payload.get("sub")
        company_id_str = payload.get("company_id")
        role = payload.get("role", "SELLER")

        if not user_id_str:
            raise UnauthorizedException("Token inválido: user_id ausente")
        if not company_id_str:
            raise ForbiddenTenantException("Token não possui contexto de empresa autorizada")

        return OrderTenantContext(
            user_id=uuid.UUID(user_id_str),
            company_id=uuid.UUID(company_id_str),
            role=role,
        )
    except ValueError as e:
        raise UnauthorizedException(f"Token inválido: {str(e)}")

from typing import Optional
from fastapi import Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.shared.security.jwt import decode_access_token
from backend.shared.exceptions.exceptions import UnauthorizedException, ForbiddenTenantException
from backend.shared.config.settings import settings

security = HTTPBearer(auto_error=False)

def get_current_user_id(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> str:
    """Extrai e valida o user_id a partir do Bearer JWT."""
    if not credentials:
        raise UnauthorizedException("Token de autenticação não fornecido")
    try:
        payload = decode_access_token(credentials.credentials)
        user_id: Optional[str] = payload.get("user_id") or payload.get("sub")
        if not user_id:
            raise UnauthorizedException("Token inválido: user_id ausente")
        return user_id
    except ValueError as e:
        raise UnauthorizedException(str(e))

def verify_internal_api_key(x_internal_key: Optional[str] = Header(None, alias="X-Internal-Key")) -> bool:
    """Valida chave secreta para comunicação segura entre microsserviços/APIs."""
    if not x_internal_key or x_internal_key != settings.INTERNAL_API_KEY:
        raise ForbiddenTenantException("Acesso negado: chamada interna não autorizada")
    return True

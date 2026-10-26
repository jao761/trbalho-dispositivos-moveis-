from fastapi import HTTPException, status

class NotFoundException(HTTPException):
    def __init__(self, detail: str = "Registro não encontrado"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

class ForbiddenTenantException(HTTPException):
    def __init__(self, detail: str = "Acesso negado aos dados desta empresa"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)

class UnauthorizedException(HTTPException):
    def __init__(self, detail: str = "Credenciais inválidas ou token expirado"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )

class BadRequestException(HTTPException):
    def __init__(self, detail: str = "Requisição inválida"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

class ConflictException(HTTPException):
    def __init__(self, detail: str = "Conflito de dados ou registro já existente"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)

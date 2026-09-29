from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError

_hasher = PasswordHasher()

def hash_password(password: str) -> str:
    """Gera hash seguro da senha usando Argon2id."""
    return _hasher.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha em texto puro confere com o hash Argon2."""
    try:
        return _hasher.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False

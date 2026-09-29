from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from backend.shared.config.settings import settings

engine = create_engine(
    settings.commerce_db_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_commerce_db() -> Generator[Session, None, None]:
    """Dependency para obter sessão com o commerce_db."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

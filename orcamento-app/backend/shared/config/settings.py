import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE_PATH = Path(__file__).resolve().parent.parent.parent / ".env"

class Settings(BaseSettings):
    POSTGRES_HOST: str = "/tmp"
    POSTGRES_PORT: int = 5433
    
    BUSINESS_DB_USER: str = "business_db_user"
    BUSINESS_DB_PASSWORD: str = "business_pass"
    BUSINESS_DB_NAME: str = "business_db"
    
    COMMERCE_DB_USER: str = "commerce_db_user"
    COMMERCE_DB_PASSWORD: str = "commerce_pass"
    COMMERCE_DB_NAME: str = "commerce_db"
    
    JWT_SECRET: str = "super-secret-jwt-key-for-orcamento-app-production-change-this"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200
    
    INTERNAL_API_KEY: str = "internal-secret-service-token-123456"
    
    CORE_API_URL: str = "http://127.0.0.1:8000"
    ORDER_API_URL: str = "http://127.0.0.1:8001"
    PAYMENT_API_URL: str = "http://127.0.0.1:8002"

    @property
    def business_db_url(self) -> str:
        if self.POSTGRES_HOST.startswith("/"):
            return f"postgresql+psycopg2://{self.BUSINESS_DB_USER}:{self.BUSINESS_DB_PASSWORD}@/{self.BUSINESS_DB_NAME}?host={self.POSTGRES_HOST}&port={self.POSTGRES_PORT}"
        return f"postgresql+psycopg2://{self.BUSINESS_DB_USER}:{self.BUSINESS_DB_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.BUSINESS_DB_NAME}"

    @property
    def commerce_db_url(self) -> str:
        if self.POSTGRES_HOST.startswith("/"):
            return f"postgresql+psycopg2://{self.COMMERCE_DB_USER}:{self.COMMERCE_DB_PASSWORD}@/{self.COMMERCE_DB_NAME}?host={self.POSTGRES_HOST}&port={self.POSTGRES_PORT}"
        return f"postgresql+psycopg2://{self.COMMERCE_DB_USER}:{self.COMMERCE_DB_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.COMMERCE_DB_NAME}"

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE_PATH) if ENV_FILE_PATH.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "ScamCheck ML Service"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    REDIS_URL: str = "redis://localhost:6379"
    
    LLM_API_KEY: Optional[str] = None
    EMBEDDING_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"

settings = Settings()
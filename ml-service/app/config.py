from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "ScamCheck ML Service"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    REDIS_URL: str = "redis://localhost:6379"
    
    LLM_PROVIDER: str = "openai"
    LLM_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gpt-3.5-turbo"
    LLM_BASE_URL: str = "https://api.openai.com/v1"
    
    EMBEDDING_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"

settings = Settings()
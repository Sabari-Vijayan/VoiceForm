from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    GEMINI_API_KEY: str
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None
    PORT: int = 8000

    class Config:
        env_file = ".env"
        extra = "ignore" # Allow extra env vars without crashing

@lru_cache()
def get_settings():
    return Settings()

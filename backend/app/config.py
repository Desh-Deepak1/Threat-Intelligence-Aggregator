import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Get the absolute path of the root directory (3 levels up from this file)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = True
    VIRUSTOTAL_API_KEY: str = ""
    ALIENVAULT_OTX_API_KEY: str = ""
    ABUSEIPDB_API_KEY: str = ""
    DATABASE_URL: str = "sqlite+aiosqlite:///./threat_intel.db"

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE_PATH),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
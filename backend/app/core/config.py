import os
from pydantic_settings import BaseSettings
from pydantic import validator
from typing import List, Optional

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Community AI Platform"
    DEBUG: bool = False

    # JWT signing key. MUST be set in the environment (Render > Environment).
    # The old hard-coded fallback was public on GitHub, so anyone could forge
    # login tokens. If it's missing we use a random per-process key: tokens
    # stop working after a restart, but they can never be forged.
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://communityai.co.in"
    ]

    @validator("ALLOWED_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: any) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            import json
            if isinstance(v, str):
                return json.loads(v)
            return v
        return v
    
    # Note: DATABASE_URL is resolved at runtime in app/core/database.py
    # to ensure Turso always takes priority over stale Render env vars.
    
    # AI & Service API Keys
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    BREVO_API_KEY: str = os.getenv("BREVO_API_KEY", "")
    NEWS_API_KEY: str = os.getenv("NEWS_API_KEY", "")
    YOUTUBE_API_KEY: str = os.getenv("YOUTUBE_API_KEY", "")
    PIB_RSS_URL: str = "https://pib.gov.in/RssMain.aspx?ModId=6"
    MARKET_SCAN_INTERVAL_HOURS: int = 24
    GOOGLE_CLIENT_ID: str = "951248037202-s3mqg1q79rgodj93skft5r253rd3mkfd.apps.googleusercontent.com"

    def check_keys(self):
        """Check for essential API keys and print warnings"""
        missing = []
        if not self.BREVO_API_KEY: missing.append("BREVO_API_KEY (for emails)")
        if not self.GEMINI_API_KEY and not self.GROQ_API_KEY: missing.append("AI_API_KEY (for Chatbot)")
        
        if not os.getenv("TURSO_AUTH_TOKEN"):
            print("\n" + "!"*50)
            print("⚠️ WARNING: TURSO_AUTH_TOKEN is not set — falling back to DATABASE_URL.")
            print("!"*50 + "\n")
            
        if missing:
            print("\n" + "!"*50)
            print(f"⚠️ WARNING: Missing essential configuration:")
            for m in missing: print(f"  - {m}")
            print("Please set these in your .env or Render environment variables.")
            print("!"*50 + "\n")
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        # .env also holds keys read elsewhere (AWS_*, DATABASE_URL, …); without
        # this, pydantic-settings refuses to start on any key not declared here.
        extra = "ignore"

settings = Settings()

_LEAKED_DEFAULT_KEYS = {"community-ai-platform-super-stable-key-123-fixed"}
if not settings.SECRET_KEY or len(settings.SECRET_KEY) < 32 or settings.SECRET_KEY in _LEAKED_DEFAULT_KEYS:
    import secrets as _secrets
    print("[SECURITY] SECRET_KEY is missing, too short or a known public value. "
          "Using a random key for this process; set a strong SECRET_KEY in the environment.")
    settings.SECRET_KEY = _secrets.token_urlsafe(48)

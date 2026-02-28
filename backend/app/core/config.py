import os
from pydantic_settings import BaseSettings
from pydantic import validator
from typing import List, Optional

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Community AI Platform"
    DEBUG: bool = True
    
    # Security - Fixed key to prevent session loss on redeploy
    SECRET_KEY: str = os.getenv("SECRET_KEY", "community-ai-platform-super-stable-key-123-fixed")
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
    
    # Database - Handle Render Postgres URL format (postgres:// -> postgresql://)
    _db_url: str = os.getenv("DATABASE_URL", "sqlite:///./community_ai.db")
    
    @property
    def DATABASE_URL(self) -> str:
        # Prioritize Turso-specific URL if set, otherwise use standard DATABASE_URL
        url = os.getenv("TURSO_DATABASE_URL") or self._db_url
        
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        # Handle Turso libsql format
        if url.startswith("libsql://"):
            # SQLAlchemy with libsql-client expects sqlite+libsql://
            url = url.replace("libsql://", "sqlite+libsql://", 1)
            
            # Append auth token if present in environment
            auth_token = os.getenv("TURSO_AUTH_TOKEN")
            if auth_token:
                if "?" in url:
                    url += f"&auth_token={auth_token}"
                else:
                    url += f"?auth_token={auth_token}"
        return url
    
    # AI & Service API Keys
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    BREVO_API_KEY: str = os.getenv("BREVO_API_KEY", "")
    NEWS_API_KEY: str = os.getenv("NEWS_API_KEY", "")
    YOUTUBE_API_KEY: str = os.getenv("YOUTUBE_API_KEY", "")
    PIB_RSS_URL: str = "https://pib.gov.in/RssMain.aspx?ModId=6"
    GOOGLE_CLIENT_ID: str = "951248037202-st6tgbo07tjljditc95n7kuvgqr7a7mg.apps.googleusercontent.com"

    def check_keys(self):
        """Check for essential API keys and print warnings"""
        missing = []
        if not self.BREVO_API_KEY: missing.append("BREVO_API_KEY (for emails)")
        if not self.GEMINI_API_KEY and not self.GROQ_API_KEY: missing.append("AI_API_KEY (for Chatbot)")
        
        if self.DATABASE_URL.startswith("sqlite+libsql") and not os.getenv("TURSO_AUTH_TOKEN"):
            print("\n" + "!"*50)
            print("⚠️ WARNING: Using Turso but TURSO_AUTH_TOKEN is not set.")
            print("Please set TURSO_AUTH_TOKEN in your .env file.")
            print("!"*50 + "\n")

        if self.DATABASE_URL.startswith("sqlite://"):
            print("\n" + "-"*50)
            print("ℹ️  Using SQLite. Note: On Render, data clears on redeploy.")
            print("   To persist data, use Render Postgres or a Persistent Disk.")
            print("-"*50 + "\n")
            
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

settings = Settings()

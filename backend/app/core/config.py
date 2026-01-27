from pydantic_settings import BaseSettings
from pydantic import validator
from typing import List

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Community AI Platform"
    DEBUG: bool = True
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
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
    
    # Database
    DATABASE_URL: str = "sqlite:///./community_ai.db"
    
    # AI & Service API Keys
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    BREVO_API_KEY: str = ""
    NEWS_API_KEY: str = ""
    YOUTUBE_API_KEY: str = ""
    PIB_RSS_URL: str = "https://pib.gov.in/RssMain.aspx?ModId=6"
    GOOGLE_CLIENT_ID: str = "951248037202-st6tgbo07tjljditc95n7kuvgqr7a7mg.apps.googleusercontent.com"

    def check_keys(self):
        """Check for essential API keys and print warnings"""
        missing = []
        if not self.BREVO_API_KEY: missing.append("BREVO_API_KEY (for emails)")
        if not self.GEMINI_API_KEY and not self.GROQ_API_KEY: missing.append("AI_API_KEY (for Chatbot)")
        
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

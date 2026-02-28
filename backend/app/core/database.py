import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# =========================================================================
# DATABASE URL RESOLUTION
#
# Priority order:
#   1. Turso (if TURSO_AUTH_TOKEN is set) — always wins
#   2. DATABASE_URL from environment (Render dashboard, .env, etc.)
#   3. Local SQLite as ultimate fallback
# =========================================================================

TURSO_DB_URL  = "libsql://communityai-riteshkr.aws-ap-south-1.turso.io"
TURSO_DB_TOKEN = os.environ.get("TURSO_AUTH_TOKEN", "")

def _resolve_database_url() -> str:
    """
    Resolve the database URL at runtime, giving Turso priority
    whenever TURSO_AUTH_TOKEN is present in the environment.
    """
    # --- Turso is configured: always use it ---
    if TURSO_DB_TOKEN:
        return f"sqlite+libsql://{TURSO_DB_URL.replace('libsql://', '')}?auth_token={TURSO_DB_TOKEN}"

    # --- Fall back to whatever DATABASE_URL is set ---
    env_url = os.environ.get("DATABASE_URL", "sqlite:///./community_ai.db")

    # Normalise Render's older postgres:// scheme
    if env_url.startswith("postgres://"):
        env_url = env_url.replace("postgres://", "postgresql://", 1)

    return env_url


DATABASE_URL = _resolve_database_url()
print(f"[DB] Using database: {DATABASE_URL.split('?')[0]}")  # hide token in logs

# =========================================================================
# ENGINE CONFIGURATION
# =========================================================================

def _build_engine():
    url = DATABASE_URL

    if url.startswith("sqlite+libsql://"):
        # libsql remote — minimal pool, StaticPool works best
        from sqlalchemy.pool import StaticPool
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )

    if url.startswith("sqlite:///"):
        # Local SQLite file
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
        )

    # PostgreSQL / other remote databases
    return create_engine(
        url,
        pool_size=10,
        max_overflow=20,
        pool_timeout=30,
        pool_recycle=1800,
        pool_pre_ping=True,
    )


engine       = _build_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base         = declarative_base()


def get_db():
    """FastAPI dependency — yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

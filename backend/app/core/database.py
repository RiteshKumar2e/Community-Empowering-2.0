import os
from urllib.parse import urlparse, parse_qs
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# =========================================================================
# DATABASE URL RESOLUTION
#
# Priority order:
#   1. TURSO_DATABASE_URL (libsql://...?authToken=...)  — always wins
#   2. DATABASE_URL from environment (Render dashboard, .env, etc.)
#   3. Local SQLite as ultimate fallback
# =========================================================================

def _resolve_database_url() -> str:
    """
    Build the SQLAlchemy-compatible connection URL at runtime.
    
    TURSO_DATABASE_URL format (both supported):
      libsql://<host>?authToken=<token>     ← combined (single line)
      libsql://<host>                       ← host only, token from TURSO_AUTH_TOKEN
    """
    turso_url = os.environ.get("TURSO_DATABASE_URL", "")

    if turso_url:
        # Parse authToken out of the URL if present
        if "?" in turso_url:
            base, query = turso_url.split("?", 1)
            params = parse_qs(query)
            token = params.get("authToken", [os.environ.get("TURSO_AUTH_TOKEN", "")])[0]
        else:
            base  = turso_url
            token = os.environ.get("TURSO_AUTH_TOKEN", "")

        # Normalise base: strip libsql:// prefix, keep just the host
        host = base.replace("libsql://", "")

        if token:
            return f"sqlite+libsql://{host}?auth_token={token}"
        else:
            return f"sqlite+libsql://{host}"

    # Fallback: raw DATABASE_URL (Render dashboard, etc.)
    env_url = os.environ.get("DATABASE_URL", "sqlite:///./community_ai.db")

    # Normalise older Render postgres:// scheme
    if env_url.startswith("postgres://"):
        env_url = env_url.replace("postgres://", "postgresql://", 1)

    return env_url


DATABASE_URL = _resolve_database_url()
print(f"[DB] Connecting to: {DATABASE_URL.split('?')[0]}")   # hide token in logs


# =========================================================================
# ENGINE CONFIGURATION
# =========================================================================

def _build_engine():
    url = DATABASE_URL

    if url.startswith("sqlite+libsql://"):
        # Turso remote — StaticPool avoids threading issues.
        # isolation_level=None prevents SQLAlchemy from running
        # "PRAGMA read_uncommitted" which Turso rejects with HTTP 405.
        from sqlalchemy.pool import StaticPool
        return create_engine(
            url,
            isolation_level=None,
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

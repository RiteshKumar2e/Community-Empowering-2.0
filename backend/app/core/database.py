import os
from urllib.parse import parse_qs
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# =========================================================================
# TURSO / LIBSQL COMPATIBILITY PATCH
#
# SQLAlchemy's SQLite dialect always runs "PRAGMA read_uncommitted" on
# first connect to detect the isolation level.  Turso's Hrana HTTP
# protocol rejects this with 405 / 308.  We patch the two dialect
# methods so they return a safe default instead of raising.
# =========================================================================
from sqlalchemy.dialects.sqlite.base import SQLiteDialect

_orig_get_isolation_level         = SQLiteDialect.get_isolation_level
_orig_get_default_isolation_level = SQLiteDialect.get_default_isolation_level

def _safe_get_isolation_level(self, connection):
    try:
        return _orig_get_isolation_level(self, connection)
    except Exception:
        return "SERIALIZABLE"          # safe default for Turso

def _safe_get_default_isolation_level(self, connection):
    try:
        return _orig_get_default_isolation_level(self, connection)
    except Exception:
        return "SERIALIZABLE"

SQLiteDialect.get_isolation_level         = _safe_get_isolation_level
SQLiteDialect.get_default_isolation_level = _safe_get_default_isolation_level

# =========================================================================
# DATABASE URL RESOLUTION
#
# Priority:
#   1. TURSO_DATABASE_URL env var  (libsql://host?authToken=…)  ← always wins
#   2. DATABASE_URL env var        (Render dashboard / .env)
#   3. Local SQLite fallback
# =========================================================================

def _resolve_database_url() -> str:
    turso_env = os.environ.get("TURSO_DATABASE_URL", "").strip()

    if turso_env:
        # Split authToken out of the URL if included inline
        if "?" in turso_env:
            base, query = turso_env.split("?", 1)
            params = parse_qs(query)
            token = params.get("authToken", [os.environ.get("TURSO_AUTH_TOKEN", "")])[0]
        else:
            base  = turso_env
            token = os.environ.get("TURSO_AUTH_TOKEN", "")

        # Strip scheme so we can rebuild it for SQLAlchemy
        host = base.replace("libsql://", "").rstrip("/")

        if token:
            return f"sqlite+libsql://{host}?auth_token={token}"
        return f"sqlite+libsql://{host}"

    # Fallback to whatever DATABASE_URL is set (Render / .env)
    env_url = os.environ.get("DATABASE_URL", "sqlite:///./community_ai.db").strip()
    if env_url.startswith("postgres://"):
        env_url = env_url.replace("postgres://", "postgresql://", 1)
    return env_url


DATABASE_URL = _resolve_database_url()
# Log without exposing the token
print(f"[DB] Connecting to: {DATABASE_URL.split('?')[0]}")

# =========================================================================
# ENGINE
# =========================================================================

def _build_engine():
    url = DATABASE_URL

    if url.startswith("sqlite+libsql://"):
        from sqlalchemy.pool import StaticPool
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )

    if url.startswith("sqlite:///"):
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
        )

    # PostgreSQL or other remote DB
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
    """FastAPI dependency — yields a scoped database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

import os
from urllib.parse import parse_qs

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# =========================================================================
# TURSO / LIBSQL DIALECT PATCHES
#
# SQLAlchemy's SQLite dialect uses several PRAGMA statements for
# introspection (isolation level, table existence).  Turso rejects
# these via its Hrana HTTP API.  We patch every affected method
# to either return a safe default or use a compatible SQL alternative.
# =========================================================================
from sqlalchemy.dialects.sqlite import base as _sqlite_base


# --- Isolation level (PRAGMA read_uncommitted) ---
def _safe_get_isolation_level(self, connection):
    try:
        cursor = connection.cursor()
        cursor.execute("PRAGMA read_uncommitted")
        val = cursor.fetchone()
        cursor.close()
        return "READ UNCOMMITTED" if val and val[0] else "SERIALIZABLE"
    except Exception:
        return "SERIALIZABLE"

def _safe_get_default_isolation_level(self, connection):
    try:
        return _safe_get_isolation_level(None, connection)
    except Exception:
        return "SERIALIZABLE"

_sqlite_base.SQLiteDialect.get_isolation_level         = _safe_get_isolation_level
_sqlite_base.SQLiteDialect.get_default_isolation_level = _safe_get_default_isolation_level


# --- Table existence (PRAGMA table_info → use sqlite_master instead) ---
def _turso_has_table(self, connection, table_name, schema=None, **kw):
    """Check table existence via sqlite_master (works on Turso)."""
    try:
        query = "SELECT 1 FROM sqlite_master WHERE type='table' AND name=?"
        result = connection.exec_driver_sql(query, [table_name])
        return result.fetchone() is not None
    except Exception:
        # If even this fails, assume table doesn't exist — CREATE IF NOT EXISTS is safe
        return False

_sqlite_base.SQLiteDialect.has_table = _turso_has_table

# --- Suppress raw _get_table_pragma errors too ---
_orig_get_table_pragma = _sqlite_base.SQLiteDialect._get_table_pragma

def _safe_get_table_pragma(self, connection, pragma, table_name, **kw):
    try:
        return _orig_get_table_pragma(self, connection, pragma, table_name, **kw)
    except Exception:
        return []

_sqlite_base.SQLiteDialect._get_table_pragma = _safe_get_table_pragma


# =========================================================================
# DATABASE URL RESOLUTION
# Priority:
#   1. TURSO_DATABASE_URL  (libsql://host?authToken=…)  ← always wins
#   2. DATABASE_URL from Render dashboard / .env
#   3. Local SQLite fallback
# =========================================================================

def _resolve_url():
    turso_env = os.environ.get("TURSO_DATABASE_URL", "").strip()

    if turso_env:
        # Split inline authToken if present
        if "?" in turso_env:
            base, qs = turso_env.split("?", 1)
            params = parse_qs(qs)
            token  = params.get("authToken", [os.environ.get("TURSO_AUTH_TOKEN", "")])[0]
        else:
            base  = turso_env
            token = os.environ.get("TURSO_AUTH_TOKEN", "")

        host = base.replace("libsql://", "").rstrip("/")
        url  = f"sqlite+libsql://{host}"
        if token:
            url += f"?auth_token={token}"
        return url

    # Fallback: raw DATABASE_URL
    env_url = os.environ.get("DATABASE_URL", "sqlite:///./community_ai.db").strip()
    if env_url.startswith("postgres://"):
        env_url = env_url.replace("postgres://", "postgresql://", 1)
    return env_url


DATABASE_URL = _resolve_url()
_display_url = DATABASE_URL.split("?")[0]
print(f"[DB] Connecting to: {_display_url}")


# =========================================================================
# ENGINE
# =========================================================================

def _build_engine():
    url = DATABASE_URL

    if url.startswith("sqlite+libsql://"):
        # sqlalchemy-libsql dialect — StaticPool for thread safety
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

    # PostgreSQL / other remote
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

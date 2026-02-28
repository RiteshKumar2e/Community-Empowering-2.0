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

def _resolve_url_and_token():
    """Extract host and auth token from environment variables."""
    turso_url = os.environ.get("TURSO_DATABASE_URL", "").strip()
    auth_token = os.environ.get("TURSO_AUTH_TOKEN", "").strip()

    # Also check DATABASE_URL — it may contain a libsql:// URL with ?authToken=
    database_url = os.environ.get("DATABASE_URL", "").strip()

    # 1. Handle Turso URL if present
    url_to_parse = turso_url or database_url
    if url_to_parse and ("libsql://" in url_to_parse or "turso.io" in url_to_parse):
        # Parse query params if present
        if "?" in url_to_parse:
            base, qs = url_to_parse.split("?", 1)
            params = parse_qs(qs)
            # Extract token from URL if it's there (overrides standalone env var)
            url_token = params.get("authToken", params.get("auth_token", [None]))[0]
            if url_token and len(url_token) > len(auth_token):
                auth_token = url_token
        else:
            base = url_to_parse

        # Clean the host
        host = base.replace("libsql://", "").replace("https://", "").replace("http://", "").replace("sqlite+libsql://", "").rstrip("/")

        # Build the SQLAlchemy URL — token will be appended in _build_engine
        final_url = f"sqlite+libsql://{host}?secure=true"

        # Validate token length — real Turso JWTs are 200-300+ chars
        if auth_token:
            if len(auth_token) < 150:
                print(f"[DB] WARNING: Auth token is suspiciously short ({len(auth_token)} chars). "
                      f"Turso JWTs are typically 200-300+ chars. Token may be truncated.")
            # Verify it looks like a JWT (three base64 sections separated by dots)
            if auth_token.count('.') != 2:
                print(f"[DB] WARNING: Token doesn't look like a valid JWT (expected 2 dots, found {auth_token.count('.')}).")
        else:
            print("[DB] ERROR: No auth token found! Turso connection will fail.")

        return final_url, auth_token

    # 2. Fallback: standard DATABASE_URL
    env_url = database_url or "sqlite:///./community_ai.db"
    if env_url.startswith("postgres://"):
        env_url = env_url.replace("postgres://", "postgresql://", 1)

    return env_url, None


# Resolve at module level
DATABASE_URL, DATABASE_TOKEN = _resolve_url_and_token()

_display_url = DATABASE_URL.split("?")[0]
print(f"[DB] Target: {_display_url}")
if DATABASE_TOKEN:
    # Diagnostic logging: show length and first few chars to detect truncation
    token_prefix = DATABASE_TOKEN[:10] + "..." if len(DATABASE_TOKEN) > 10 else DATABASE_TOKEN
    print(f"[DB] Auth: Token detected (length: {len(DATABASE_TOKEN)}, prefix: {token_prefix})")
else:
    print("[DB] Auth: No specialized auth token found (using URL or local)")


# =========================================================================
# ENGINE
# =========================================================================

def _build_engine():
    url = DATABASE_URL
    token = DATABASE_TOKEN

    if url.startswith("sqlite+libsql://"):
        from sqlalchemy.pool import StaticPool
        import libsql_experimental as libsql

        # Extract the host from the URL
        host = url.split("?")[0].replace("sqlite+libsql://", "").rstrip("/")

        # Use creator to bypass SQLAlchemy's URL parsing entirely.
        # SQLAlchemy strips query params like authToken from the URL before
        # passing to the driver, so we must connect directly.
        def _creator():
            conn = libsql.connect(
                host,
                auth_token=token or "",
                scheme="https",
            )
            return conn

        print(f"[DB] Connection: Using direct libsql.connect to {host}")
        print(f"[DB] Connection: auth_token provided = {bool(token)}")

        return create_engine(
            "sqlite+libsql://",
            creator=_creator,
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

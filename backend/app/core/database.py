import os
from urllib.parse import parse_qs

import time

from sqlalchemy import create_engine, event, exc, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

# =========================================================================
# TURSO / LIBSQL DIALECT PATCHES
#
# SQLAlchemy's SQLite dialect uses several PRAGMA statements for
# introspection (isolation level, table existence).  Turso rejects
# these via its Hrana HTTP API.  We patch every affected method
# to either return a safe default or use a compatible SQL alternative.
# =========================================================================
from sqlalchemy.dialects.sqlite import base as _sqlite_base
from sqlalchemy.schema import CreateTable, CreateIndex
from sqlalchemy.ext.compiler import compiles

# =========================================================================
# TURSO COMPATIBILITY: FORCE 'IF NOT EXISTS' FOR TABLES & INDEXES
#
# Turso/libsql can be sensitive to already existing objects if introspection 
# fails. We patch the compilers to ALWAYS include 'IF NOT EXISTS'.
# =========================================================================
@compiles(CreateTable, "sqlite")
def _add_if_not_exists_table(element, compiler, **kw):
    sql = compiler.visit_create_table(element, **kw)
    if "IF NOT EXISTS" not in sql.upper():
        return sql.replace("CREATE TABLE ", "CREATE TABLE IF NOT EXISTS ", 1)
    return sql

@compiles(CreateIndex, "sqlite")
def _add_if_not_exists_index(element, compiler, **kw):
    sql = compiler.visit_create_index(element, **kw)
    if "IF NOT EXISTS" in sql.upper():
        return sql
        
    if "CREATE UNIQUE INDEX" in sql.upper():
        return sql.replace("CREATE UNIQUE INDEX ", "CREATE UNIQUE INDEX IF NOT EXISTS ", 1)
    
    return sql.replace("CREATE INDEX ", "CREATE INDEX IF NOT EXISTS ", 1)


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
    # Priority 1: TURSO_DATABASE_URL
    turso_url = os.environ.get("TURSO_DATABASE_URL", "").strip()
    # Priority 2: Standalone TURSO_AUTH_TOKEN
    auth_token = os.environ.get("TURSO_AUTH_TOKEN", "").strip()
    # Check DATABASE_URL as well (Render often sets this)
    database_url = os.environ.get("DATABASE_URL", "").strip()

    # Determine which URL to use
    raw_url = turso_url or database_url
    
    if raw_url and ("libsql://" in raw_url or "turso.io" in raw_url):
        # Extract token from the URL if present
        if "?" in raw_url:
            base_part, query_part = raw_url.split("?", 1)
            params = parse_qs(query_part)
            url_token = params.get("authToken", params.get("auth_token", [None]))[0]
            if url_token and len(url_token) > len(auth_token):
                auth_token = url_token
        else:
            base_part = raw_url

        # Clean host (strip all protocols)
        host = base_part.replace("sqlite+libsql://", "").replace("libsql://", "")
        host = host.replace("https://", "").replace("http://", "").rstrip("/")
        
        # Build the SQLAlchemy dialect URL
        # We keep it simple here and pass the token in connect_args for reliability
        final_url = f"sqlite+libsql://{host}"
        
        return final_url, auth_token

    # Fallback: standard local SQLite or other (PostgreSQL)
    fallback_url = database_url or "sqlite:///./community_ai.db"
    if fallback_url.startswith("postgres://"):
        fallback_url = fallback_url.replace("postgres://", "postgresql://", 1)
    
    return fallback_url, None


# Resolve at module level
DATABASE_URL, DATABASE_TOKEN = _resolve_url_and_token()

_display_url = DATABASE_URL.split("?")[0]
print(f"[DB] Base URL: {_display_url}")
if DATABASE_TOKEN:
    # Diagnostic logging
    token_display = DATABASE_TOKEN[:10] + "..." if len(DATABASE_TOKEN) > 10 else "EMPTY"
    print(f"[DB] Auth: Token loaded (length: {len(DATABASE_TOKEN)}, prefix: {token_display})")
    
    if len(DATABASE_TOKEN) < 100:
        print("[DB] WARNING: Token is suspiciously short. Auth may fail.")
else:
    print("[DB] Auth: No specialized auth token found.")


# =========================================================================
# ENGINE
# =========================================================================

# Turso closes an idle HTTP stream after a few seconds. Reusing the same
# connection after that fails with
#   Hrana: api error: status=404 ... "stream not found"
# (this broke Google sign-in and other requests once the server stayed awake
# between visits). The guard below replaces a connection that sat idle, and
# marks "stream not found" errors as disconnects so the pool drops the dead
# connection instead of reusing it.
TURSO_MAX_IDLE_SECONDS = 5
_STALE_MARKERS = ("stream not found", "stream expired", "hrana")


def is_stale_stream_error(error) -> bool:
    message = str(error).lower()
    return any(marker in message for marker in _STALE_MARKERS)


def install_stale_connection_guard(target_engine, max_idle_seconds: float = TURSO_MAX_IDLE_SECONDS):
    @event.listens_for(target_engine, "checkin")
    def _remember_last_use(dbapi_connection, connection_record):
        connection_record.info["last_used"] = time.monotonic()

    @event.listens_for(target_engine, "checkout")
    def _replace_if_idle(dbapi_connection, connection_record, connection_proxy):
        last_used = connection_record.info.get("last_used")
        if last_used is not None and time.monotonic() - last_used > max_idle_seconds:
            connection_record.info.pop("last_used", None)
            # The pool closes this connection and opens a fresh one.
            raise exc.DisconnectionError("idle Turso stream; reconnecting")

    @event.listens_for(target_engine, "handle_error")
    def _stale_stream_is_disconnect(context):
        if is_stale_stream_error(context.original_exception):
            context.is_disconnect = True


def _build_engine():
    url = DATABASE_URL
    token = DATABASE_TOKEN

    if url.startswith("sqlite+libsql://"):
        
        # Clean the host for the engine URL
        host = url.split("?")[0].replace("sqlite+libsql://", "").rstrip("/")
        
        # Use the standard protocol format for Turso: sqlite+libsql://[host]
        # We pass the auth_token via connect_args for maximum reliability.
        # '?secure=true' is added to force HTTPS and avoid 308 redirects.
        sqlalchemy_url = f"sqlite+libsql://{host}?secure=true"
        
        connect_args = {
            "check_same_thread": False,
        }
        
        if token:
            # We use strictly 'auth_token' (snake_case) because the LibSQL python 
            # driver connect() function does NOT accept 'authToken' (camelCase).
            connect_args["auth_token"] = token
            print(f"[DB] Initializing Turso connection to {host} (auth_token enabled)")
        else:
            print(f"[DB] WARNING: Initializing Turso connection to {host} WITHOUT auth_token")

        # A real pool, NOT StaticPool: StaticPool hands the same libsql
        # connection to every request at once. When the frontend fires several
        # requests together (admin dashboard: 8, forum: 4), one request was
        # querying while another rolled back/closed that same connection, and
        # the Rust driver panicked (PanicException) -> plain 500 responses.
        # With QueuePool each request has its own connection. poolclass must be
        # explicit: for this URL (no file path) SQLAlchemy would otherwise pick
        # SingletonThreadPool, which rejects pool_size and fails at startup.
        turso_engine = create_engine(
            sqlalchemy_url,
            connect_args=connect_args,
            poolclass=QueuePool,
            pool_size=5,
            max_overflow=10,
            pool_timeout=30,
        )
        install_stale_connection_guard(turso_engine)
        return turso_engine

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

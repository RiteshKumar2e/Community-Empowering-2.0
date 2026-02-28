"""
migrate_to_turso.py
-------------------
Migrates data from PostgreSQL (old Render DB) → Turso (libsql) using
the Turso HTTP API directly via `requests`. No sqlalchemy-libsql needed.

Usage (from the backend/ folder):
    pip install psycopg2-binary requests python-dotenv
    python migrate_to_turso.py

Required in backend/.env:
    OLD_DATABASE_URL   = postgresql://...
    TURSO_DATABASE_URL = libsql://host?authToken=TOKEN
"""

import os
import sys
import json
from urllib.parse import parse_qs

# ── Auto-install missing packages ──────────────────────────────────────────
def _ensure(*packages):
    import importlib, subprocess
    for pkg in packages:
        mod = pkg.split(":")[0].replace("-", "_")
        try:
            importlib.import_module(mod)
        except ImportError:
            print(f"  [setup] Installing {pkg}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", pkg])

_ensure("psycopg2-binary", "requests", "python-dotenv")

import requests
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()


# ── Turso HTTP helper ──────────────────────────────────────────────────────

def _parse_turso(raw: str):
    """Return (host_url, token) from TURSO_DATABASE_URL."""
    if "?" in raw:
        base, qs = raw.split("?", 1)
        params = parse_qs(qs)
        token  = params.get("authToken", [params.get("auth_token", [""])[0]])[0]
    else:
        base, token = raw, os.environ.get("TURSO_AUTH_TOKEN", "")
    host = base.replace("libsql://", "").rstrip("/")
    return f"https://{host}", token


class TursoClient:
    """Tiny Turso HTTP client that executes SQL via the Hrana /v2/pipeline API."""

    def __init__(self, base_url: str, token: str):
        self.url     = f"{base_url}/v2/pipeline"
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type":  "application/json",
        }

    def execute(self, sql: str, params=None):
        """Execute one SQL statement. Returns list-of-rows (as dicts) or []."""
        stmt = {"type": "execute", "stmt": {"sql": sql}}
        if params:
            stmt["stmt"]["args"] = [{"type": "text", "value": str(v)} for v in params]

        payload = {"requests": [stmt, {"type": "close"}]}
        resp = requests.post(self.url, headers=self.headers, json=payload, timeout=30)

        if resp.status_code != 200:
            raise RuntimeError(f"Turso HTTP {resp.status_code}: {resp.text[:200]}")

        result = resp.json()["results"][0]
        if result.get("type") == "error":
            raise RuntimeError(f"Turso SQL error: {result['error']['message']}")

        if result["type"] == "ok" and result["response"]["type"] == "execute":
            rs = result["response"]["result"]
            cols = [c["name"] for c in rs.get("cols", [])]
            return [dict(zip(cols, [v["value"] for v in row])) for row in rs.get("rows", [])]
        return []

    def execute_many(self, sql: str, rows: list[list]):
        """Execute a batch of INSERT statements."""
        requests_list = [{"type": "execute", "stmt": {
            "sql": sql,
            "args": [{"type": "text", "value": str(v) if v is not None else None} for v in row]
        }} for row in rows]
        requests_list.append({"type": "close"})

        payload = {"requests": requests_list}
        resp = requests.post(self.url, headers=self.headers, json=payload, timeout=60)

        if resp.status_code != 200:
            raise RuntimeError(f"Turso HTTP {resp.status_code}: {resp.text[:200]}")

        errors = []
        for i, r in enumerate(resp.json()["results"][:-1]):
            if r.get("type") == "error":
                errors.append(f"Row {i}: {r['error']['message']}")
        if errors:
            print(f"    ⚠️  {len(errors)} row errors: {errors[:3]}")


# ── PG type normaliser ─────────────────────────────────────────────────────

def _pg_to_sqlite_type(pg_type: str) -> str:
    mapping = {
        "integer": "INTEGER", "bigint": "INTEGER", "smallint": "INTEGER",
        "serial": "INTEGER", "bigserial": "INTEGER",
        "boolean": "INTEGER",
        "real": "REAL", "double precision": "REAL", "numeric": "REAL", "float": "REAL",
        "text": "TEXT", "varchar": "TEXT", "character varying": "TEXT",
        "char": "TEXT", "uuid": "TEXT",
        "timestamp": "TEXT", "timestamp with time zone": "TEXT",
        "timestamp without time zone": "TEXT",
        "date": "TEXT", "time": "TEXT", "json": "TEXT", "jsonb": "TEXT",
    }
    return mapping.get(pg_type.lower().split("(")[0].strip(), "TEXT")


# ── Main ───────────────────────────────────────────────────────────────────
CHUNK_SIZE = 100

def migrate():
    print("\n" + "=" * 60)
    print("   POSTGRES → TURSO MIGRATION TOOL")
    print("=" * 60 + "\n")

    old_url   = os.getenv("OLD_DATABASE_URL") or os.getenv("SOURCE_DATABASE_URL")
    turso_raw = os.getenv("TURSO_DATABASE_URL")

    if not old_url:
        print("❌  OLD_DATABASE_URL not set in .env"); sys.exit(1)
    if not turso_raw:
        print("❌  TURSO_DATABASE_URL not set in .env"); sys.exit(1)

    turso_base, turso_token = _parse_turso(turso_raw)
    print(f"📡  Source : {old_url.split('@')[-1].split('?')[0]}")
    print(f"🎯  Dest   : {turso_base}\n")

    # ── Connect Postgres ────────────────────────────────────────────────
    try:
        # Render Postgres requires SSL for external connections
        conn_url = old_url
        if "render.com" in conn_url and "sslmode=" not in conn_url:
            if "?" in conn_url:
                conn_url += "&sslmode=require"
            else:
                conn_url += "?sslmode=require"
        
        pg = psycopg2.connect(conn_url, cursor_factory=psycopg2.extras.RealDictCursor)
        cur = pg.cursor()
        print("✅  Connected to Postgres\n")
    except Exception as e:
        print(f"❌  Postgres connection failed: {e}"); sys.exit(1)

    # ── Connect Turso ───────────────────────────────────────────────────
    turso = TursoClient(turso_base, turso_token)
    try:
        turso.execute("SELECT 1")
        print("✅  Connected to Turso\n")
    except Exception as e:
        print(f"❌  Turso connection failed: {e}"); sys.exit(1)

    # ── Get table list (ordered by FK dependencies) ─────────────────────
    cur.execute("""
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
    """)
    tables = [r["table_name"] for r in cur.fetchall()]
    print(f"📋  Tables found: {tables}\n")

    total_rows = 0
    failed     = []

    for table in tables:
        print(f"📦  {table}")

        # Get column info from Postgres
        cur.execute("""
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = %s
            ORDER BY ordinal_position
        """, (table,))
        cols_info = cur.fetchall()

        if not cols_info:
            print("    — no columns found, skipping\n"); continue

        # Build CREATE TABLE for Turso (SQLite/libsql syntax)
        col_defs = []
        for c in cols_info:
            sqlite_type = _pg_to_sqlite_type(c["data_type"])
            nullable    = "" if c["is_nullable"] == "YES" else " NOT NULL"
            pk          = " PRIMARY KEY" if c.get("column_default", "").startswith("nextval") else ""
            col_defs.append(f'"{c["column_name"]}" {sqlite_type}{pk}{nullable}')

        create_sql = f'CREATE TABLE IF NOT EXISTS "{table}" ({", ".join(col_defs)})'
        try:
            turso.execute(create_sql)
            print(f"    🏗️  Table created/verified")
        except Exception as e:
            print(f"    ❌  Create table failed: {e}\n")
            failed.append(table); continue

        # Fetch rows from Postgres
        try:
            cur.execute(f'SELECT * FROM "{table}"')
            rows = cur.fetchall()
        except Exception as e:
            print(f"    ❌  Fetch failed: {e}\n")
            failed.append(table); continue

        if not rows:
            print("    — empty table, skipping\n"); continue

        col_names  = [c["column_name"] for c in cols_info]
        placeholders = ", ".join(["?" for _ in col_names])
        col_list     = ", ".join([f'"{c}"' for c in col_names])
        insert_sql   = f'INSERT OR IGNORE INTO "{table}" ({col_list}) VALUES ({placeholders})'

        inserted = 0
        for i in range(0, len(rows), CHUNK_SIZE):
            chunk = [[r[c] for c in col_names] for r in rows[i:i + CHUNK_SIZE]]
            try:
                turso.execute_many(insert_sql, chunk)
                inserted += len(chunk)
            except Exception as e:
                print(f"    ⚠️  Chunk {i//CHUNK_SIZE + 1} failed: {e}")

        total_rows += inserted
        print(f"    ✅  {inserted}/{len(rows)} rows inserted\n")

    pg.close()

    print("=" * 60)
    print(f"✨  Done! {total_rows} total rows migrated.")
    if failed:
        print(f"⚠️   Failed tables: {failed}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    migrate()

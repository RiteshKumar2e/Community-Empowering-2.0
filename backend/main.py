from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import warnings
# Silence specific websockets deprecation warning coming from third-party internals
warnings.filterwarnings(
    "ignore",
    category=DeprecationWarning,
    message=r".*ConnectionClosed.code is deprecated; use Protocol.close_code or ConnectionClosed.rcvd.code.*"
)
from app.core.config import settings
from app.core.database import engine, Base
from app.models import models  # Import models to register them
from app.api import auth, users, ai, resources, learning, admin, agent, feedback, tracking, forum, chat, aws_services, me
from app.services.market_scanner import market_scanner
import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Check configuration
    settings.check_keys()
    
    # Create tables once in lifespan
    try:
        print("[DB] Ensuring database tables exist (lifespan)...")
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[DB] Note: Table creation check skipped or failed (likely already exist): {e}")
    
    # Seed data
    await seed_database()
    
    # Run market scan in background on startup to ensure fresh data
    print("🔔 Server starting... Initiating background market scan.")
    asyncio.create_task(market_scanner.scan_and_update())
    yield

app = FastAPI(
    title="Community AI Platform API",
    description="AI-powered platform for community access to information and resources",
    version="1.0.0",
    lifespan=lifespan,
    # Interactive API docs only when DEBUG=true (they map every endpoint for attackers).
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
)

# --- Security middleware -----------------------------------------------------
from fastapi import Request
from fastapi.responses import JSONResponse

MAX_BODY_BYTES = 1 * 1024 * 1024          # 1 MB for normal API calls
MAX_UPLOAD_BYTES = 5 * 1024 * 1024        # 5 MB for the profile photo upload


def _error_response(request: Request) -> JSONResponse:
    response = JSONResponse({"detail": "Something went wrong. Please try again."}, status_code=500)
    # Error responses are built outside CORSMiddleware, so without these
    # headers the browser reports a 500 as a misleading "blocked by CORS".
    origin = request.headers.get("origin")
    if origin and origin in _CORS_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Vary"] = "Origin"
    return response


class DriverPanicGuard:
    """The Turso driver is written in Rust; when it panics it raises pyo3's
    PanicException, which is NOT an Exception subclass. It skipped FastAPI's
    error handler (and the CORS headers) and the browser got a bare 500.
    This outermost layer turns it into a normal JSON 500 and drops the
    database connections, which may be broken, so the next request starts
    clean. Plain ASGI on purpose: @app.middleware runs requests inside a task
    group that cancels the request before such an error could be caught."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        response_started = False

        async def send_and_track(message):
            nonlocal response_started
            if message["type"] == "http.response.start":
                response_started = True
            await send(message)

        try:
            await self.app(scope, receive, send_and_track)
        except Exception:
            raise
        except BaseException as exc:
            if isinstance(exc, (KeyboardInterrupt, SystemExit, asyncio.CancelledError)):
                raise
            inner = exc
            while getattr(inner, "exceptions", None):  # unwrap (Base)ExceptionGroup
                inner = inner.exceptions[0]
            request = Request(scope)
            print(f"[ERROR] {request.method} {request.url.path}: {type(inner).__name__}: {inner}")
            try:
                engine.dispose()
            except Exception as dispose_error:  # never mask the original problem
                print(f"[DB] dispose after driver panic failed: {dispose_error}")
            if not response_started:
                await _error_response(request)(scope, receive, send)


@app.middleware("http")
async def security_middleware(request: Request, call_next):
    # Reject oversized bodies early (stops memory/CPU exhaustion via huge JSON).
    limit = MAX_UPLOAD_BYTES if request.url.path.endswith("/me/photo") else MAX_BODY_BYTES
    length = request.headers.get("content-length")
    if length and length.isdigit() and int(length) > limit:
        return JSONResponse({"detail": "Request is too large."}, status_code=413)

    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "camera=(), geolocation=(), payment=()")
    # API responses can contain personal data: never let proxies/CDNs cache them.
    if request.url.path.startswith("/api/"):
        response.headers.setdefault("Cache-Control", "no-store")
    return response


# Never "*" together with credentials (see CORSMiddleware below).
_CORS_ORIGINS = [o for o in settings.ALLOWED_ORIGINS if o.strip() not in ("*", "null")]


@app.exception_handler(Exception)
async def unhandled_error(request: Request, exc: Exception):
    # Log the details on the server; never send stack traces or DB errors to clients.
    print(f"[ERROR] {request.method} {request.url.path}: {type(exc).__name__}: {exc}")
    return _error_response(request)

# Ensure uploads directory exists
os.makedirs("uploads/profiles", exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    # Never "*" together with credentials: that would let any website make
    # logged-in requests on a user's behalf. Only explicit origins are kept.
    allow_origins=_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Outermost layer, so it also covers errors raised inside the middlewares above.
app.add_middleware(DriverPanicGuard)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(me.router, prefix="/api/me", tags=["My data"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(resources.router, prefix="/api/resources", tags=["Resources"])
app.include_router(learning.router, prefix="/api/learning", tags=["Learning"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(agent.router, prefix="/api/agent", tags=["Agent"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["Feedback"])
app.include_router(tracking.router, prefix="/api/tracking", tags=["Tracking"])
app.include_router(forum.router, tags=["Forum"])
app.include_router(chat.router, tags=["Chat"])
app.include_router(aws_services.router, tags=["AWS Services"])

async def seed_database():
    """Seed initial data if database is empty"""
    from app.core.database import SessionLocal
    from app.models.models import ForumCategory
    
    db = SessionLocal()
    try:
        # Check and add categories individually
        print("🌱 Checking forum categories...")
        categories = [
            {"name": "Community Support", "description": "Get help from fellow community members", "icon": "🤝", "color": "#6366f1"},
            {"name": "Social Impact", "description": "Discuss projects making a difference", "icon": "❤️", "color": "#f59e0b"},
            {"name": "Local Resources", "description": "Find and share local services and tools", "icon": "📍", "color": "#10b981"},
            {"name": "Skill Building", "description": "Learn and share new talents", "icon": "🎓", "color": "#8b5cf6"},
            {"name": "Success Stories", "description": "Share your wins and milestones", "icon": "🏆", "color": "#facc15"},
            {"name": "General Help", "description": "Misc community discussions", "icon": "💬", "color": "#64748b"}
        ]
        
        for cat_data in categories:
            exists = db.query(ForumCategory).filter(ForumCategory.name == cat_data["name"]).first()
            if not exists:
                print(f"  + Adding category: {cat_data['name']}")
                db.add(ForumCategory(**cat_data))
        
        db.commit()
        print("✅ Forum categories checked/updated!")
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    from fastapi.responses import Response
    return Response(status_code=204)

@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {
        "message": "Community AI Platform API",
        "version": "1.0.0",
    }

# HEAD too: uptime monitors (UptimeRobot) often send HEAD, and a 405 would
# show as "down". No database call, so pings stay cheap. See docs/UPTIME-MONITORING.md.
@app.api_route("/health", methods=["GET", "HEAD"])
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

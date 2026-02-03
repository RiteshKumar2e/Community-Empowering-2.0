from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.core.config import settings
from app.core.database import engine, Base
from app.models import models  # Import models to register them
from app.api import auth, users, ai, resources, learning, admin, agent, feedback, tracking, forum, chat, aws_services
from app.services.market_scanner import market_scanner
import asyncio

# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Check configuration
    settings.check_keys()
    
    # Create tables separately to be safe
    Base.metadata.create_all(bind=engine)
    
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
    lifespan=lifespan
)

# Ensure uploads directory exists
os.makedirs("uploads/profiles", exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
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
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

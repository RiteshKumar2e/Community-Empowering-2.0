from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.core.config import settings
from app.core.database import engine, Base
from app.models import models  # Import models to register them
from app.api import auth, users, ai, resources, learning, admin, agent

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Community AI Platform API",
    description="AI-powered platform for community access to information and resources",
    version="1.0.0"
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

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    from fastapi.responses import Response
    return Response(status_code=204)

@app.get("/")
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

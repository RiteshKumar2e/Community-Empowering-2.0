from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.api.users import get_current_user
from app.models.models import User
from app.services.activity_tracker import ActivityTracker

router = APIRouter()

class ResourceViewLog(BaseModel):
    title: str
    category: str

class PlatformVisitLog(BaseModel):
    platform_name: str
    platform_url: str = None

@router.post("/log/resource-view")
async def log_resource_view(
    data: ResourceViewLog,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log when user views a resource"""
    ActivityTracker.log_resource_view(
        db=db,
        user_id=current_user.id,
        resource_title=data.title,
        category=data.category
    )
    return {"status": "logged"}

@router.post("/log/platform-visit")
async def log_platform_visit(
    data: PlatformVisitLog,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log when user visits a learning platform"""
    ActivityTracker.log_platform_visit(
        db=db,
        user_id=current_user.id,
        platform_name=data.platform_name,
        platform_url=data.platform_url
    )
    return {"status": "logged"}

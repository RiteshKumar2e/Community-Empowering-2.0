from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import get_db
from app.models.models import User, Query, Enrollment, Course, Resource, LearningPlatform
from app.api.users import get_current_user

router = APIRouter()

class ResourceCreate(BaseModel):
    title: str
    description: str
    category: str
    eligibility: Optional[str] = None
    provider: Optional[str] = None
    link: str
    isNew: bool = False

class PlatformCreate(BaseModel):
    title: str
    description: str
    category: str
    provider: str
    duration: str
    students: str
    level: str
    link: str
    features: List[str]
    isOfficial: bool = False

async def verify_admin(current_user: User = Depends(get_current_user)):
    """Verify that the current user is an admin"""
    if not current_user.is_admin and current_user.email != 'riteshkumar90359@gmail.com':
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.post("/resources")
async def add_resource(
    resource_data: ResourceCreate,
    admin: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Add a new government resource/scheme"""
    new_resource = Resource(
        title=resource_data.title,
        description=resource_data.description,
        category=resource_data.category,
        eligibility=resource_data.eligibility,
        provider=resource_data.provider,
        link=resource_data.link,
        is_new=resource_data.isNew
    )
    db.add(new_resource)
    db.commit()
    db.refresh(new_resource)
    return new_resource

@router.post("/platforms")
async def add_platform(
    platform_data: PlatformCreate,
    admin: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Add a new learning platform"""
    import json
    new_platform = LearningPlatform(
        title=platform_data.title,
        description=platform_data.description,
        category=platform_data.category,
        provider=platform_data.provider,
        duration=platform_data.duration,
        students=platform_data.students,
        level=platform_data.level,
        link=platform_data.link,
        features=json.dumps(platform_data.features),
        is_official=platform_data.isOfficial
    )
    db.add(new_platform)
    db.commit()
    db.refresh(new_platform)
    return new_platform

@router.get("/users")
async def get_all_users(
    admin: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get all registered users"""
    users = db.query(User).all()
    
    return [{
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "location": user.location,
        "language": user.language,
        "community_type": user.community_type,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None
    } for user in users]

@router.get("/queries")
async def get_all_queries(
    admin: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get all AI queries"""
    queries = db.query(Query).order_by(Query.created_at.desc()).all()
    
    return [{
        "id": query.id,
        "user_id": query.user_id,
        "message": query.message,
        "response": query.response,
        "language": query.language,
        "created_at": query.created_at.isoformat() if query.created_at else None
    } for query in queries]

@router.get("/enrollments")
async def get_all_enrollments(
    admin: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get all course enrollments"""
    enrollments = db.query(Enrollment).all()
    
    result = []
    for enrollment in enrollments:
        user = db.query(User).filter(User.id == enrollment.user_id).first()
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()
        
        result.append({
            "id": enrollment.id,
            "user_id": enrollment.user_id,
            "user_name": user.name if user else "Unknown",
            "course_id": enrollment.course_id,
            "course_title": course.title if course else "Unknown",
            "progress": enrollment.progress,
            "completed": enrollment.completed,
            "enrolled_at": enrollment.enrolled_at.isoformat() if enrollment.enrolled_at else None
        })
    
    return result

@router.get("/stats")
async def get_admin_stats(
    admin: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get platform statistics"""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_queries = db.query(Query).count()
    total_enrollments = db.query(Enrollment).count()
    
    return {
        "totalUsers": total_users,
        "activeUsers": active_users,
        "totalQueries": total_queries,
        "totalEnrollments": total_enrollments
    }

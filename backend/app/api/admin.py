from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import get_db
from app.models.models import User, Query, Enrollment, Course, Resource, LearningPlatform, Feedback, ForumDiscussion, ForumReply, ForumCategory, UserActivity
from app.services.market_scanner import market_scanner
from app.api.users import get_current_user
from datetime import timezone, timedelta

# IST is UTC+5:30
IST = timezone(timedelta(hours=5, minutes=30))

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
    
    user_list = []
    for user in users:
        # Convert timestamps to IST
        created_at_ist = None
        if user.created_at:
            utc_time = user.created_at.replace(tzinfo=timezone.utc)
            created_at_ist = utc_time.astimezone(IST).strftime("%d %b %Y, %I:%M %p")
        
        last_login_ist = None
        if user.last_login:
            utc_time = user.last_login.replace(tzinfo=timezone.utc)
            last_login_ist = utc_time.astimezone(IST).strftime("%d %b %Y, %I:%M %p")
        
        user_list.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "location": user.location,
            "language": user.language,
            "community_type": user.community_type,
            "is_active": user.is_active,
            "created_at": created_at_ist,
            "last_login": last_login_ist
        })
    
    return user_list

@router.get("/queries")
async def get_all_queries(
    admin: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get all AI queries"""
    queries = db.query(Query).order_by(Query.created_at.desc()).all()
    
    query_list = []
    for query in queries:
        # Convert timestamp to IST
        created_at_ist = None
        if query.created_at:
            utc_time = query.created_at.replace(tzinfo=timezone.utc)
            created_at_ist = utc_time.astimezone(IST).strftime("%d %b %Y, %I:%M %p")
        
        query_list.append({
            "id": query.id,
            "user_id": query.user_id,
            "message": query.message,
            "response": query.response,
            "language": query.language,
            "created_at": created_at_ist
        })
    
    return query_list

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
        
        # Convert timestamp to IST
        enrolled_at_ist = None
        if enrollment.enrolled_at:
            utc_time = enrollment.enrolled_at.replace(tzinfo=timezone.utc)
            enrolled_at_ist = utc_time.astimezone(IST).strftime("%d %b %Y, %I:%M %p")
        
        result.append({
            "id": enrollment.id,
            "user_id": enrollment.user_id,
            "user_name": user.name if user else "Unknown",
            "course_id": enrollment.course_id,
            "course_title": course.title if course else "Unknown",
            "progress": enrollment.progress,
            "completed": enrollment.completed,
            "enrolled_at": enrolled_at_ist
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

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    admin: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Delete a user account"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if trying to delete yourself or another admin
    if user.email == admin.email:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.get("/feedback")
async def get_all_feedback(
    admin: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get all user feedback submissions"""
    feedbacks = db.query(Feedback).order_by(Feedback.created_at.desc()).all()
    return feedbacks

@router.get("/resources")
async def get_all_resources(
    admin: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get all resources"""
    return db.query(Resource).all()

@router.delete("/resources/{resource_id}")
async def delete_resource(
    resource_id: int,
    admin: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Delete a resource"""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    db.delete(resource)
    db.commit()
    return {"message": "Resource deleted successfully"}

@router.get("/learning-platforms")
async def get_all_learning_platforms(
    admin: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get all learning platforms"""
    return db.query(LearningPlatform).all()

@router.delete("/platforms/{platform_id}")
async def delete_platform(
    platform_id: int,
    admin: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Delete a platform"""
    platform = db.query(LearningPlatform).filter(LearningPlatform.id == platform_id).first()
    if not platform:
        raise HTTPException(status_code=404, detail="Platform not found")
    db.delete(platform)
    db.commit()
    return {"message": "Platform deleted successfully"}

@router.post("/scan-market")
async def trigger_market_scan(
    admin: User = Depends(verify_admin)
):
    """Manually trigger the market scanner to search for new schemes/learning"""
    new_items = await market_scanner.scan_and_update()
    return {
        "message": f"Scan completed. {len(new_items)} new items added.",
        "items": new_items
    }

@router.get("/forum/discussions")
async def get_all_discussions(
    admin: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get all forum discussions for admin management"""
    discussions = db.query(ForumDiscussion).order_by(ForumDiscussion.created_at.desc()).all()
    
    result = []
    for disc in discussions:
        user = db.query(User).filter(User.id == disc.user_id).first()
        category = db.query(ForumCategory).filter(ForumCategory.id == disc.category_id).first()
        reply_count = db.query(ForumReply).filter(ForumReply.discussion_id == disc.id).count()
        
        result.append({
            "id": disc.id,
            "title": disc.title,
            "content": disc.content,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "N/A",
            "category_name": category.name if category else "General",
            "views": disc.views,
            "likes": disc.likes,
            "reply_count": reply_count,
            "is_featured": disc.is_featured,
            "created_at": disc.created_at.replace(tzinfo=timezone.utc).astimezone(IST).strftime("%d %b %Y, %I:%M %p") if disc.created_at else "N/A"
        })
    return result

@router.delete("/forum/discussions/{discussion_id}")
async def delete_discussion(
    discussion_id: int,
    admin: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Admin delete a forum discussion"""
    discussion = db.query(ForumDiscussion).filter(ForumDiscussion.id == discussion_id).first()
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    # Replies are usually handled by cascade delete if configured, or manually
    db.query(ForumReply).filter(ForumReply.discussion_id == discussion_id).delete()
    db.delete(discussion)
    db.commit()
    return {"message": "Discussion deleted successfully"}

@router.post("/forum/discussions/{discussion_id}/feature")
async def toggle_feature_discussion(
    discussion_id: int,
    admin: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Admin toggle featured status of a discussion"""
    discussion = db.query(ForumDiscussion).filter(ForumDiscussion.id == discussion_id).first()
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")
    
    discussion.is_featured = not discussion.is_featured
    db.commit()
    return {"message": "Featured status updated", "is_featured": discussion.is_featured}

@router.get("/activities")
async def get_user_activities(
    admin: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Get comprehensive user activity logs"""
    activities = db.query(UserActivity).order_by(UserActivity.created_at.desc()).limit(100).all()
    
    result = []
    for act in activities:
        user = db.query(User).filter(User.id == act.user_id).first()
        
        created_at_ist = None
        if act.created_at:
            created_at_ist = act.created_at.replace(tzinfo=timezone.utc).astimezone(IST).strftime("%d %b %Y, %I:%M %p")
            
        result.append({
            "id": act.id,
            "user_id": act.user_id,
            "user_name": user.name if user else "Unknown",
            "type": act.activity_type,
            "title": act.activity_title,
            "description": act.activity_description,
            "created_at": created_at_ist
        })
    
    return result

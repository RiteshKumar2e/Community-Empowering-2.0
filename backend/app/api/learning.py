from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Course, Enrollment, User, LearningPlatform
from app.api.users import get_current_user

router = APIRouter()

@router.get("/courses")
async def get_courses(db: Session = Depends(get_db)):
    """Get all available courses"""
    courses = db.query(Course).all()
    
    return [{
        "id": c.id,
        "title": c.title,
        "description": c.description,
        "level": c.level,
        "duration": c.duration,
        "lessons": c.lessons,
        "thumbnail": c.thumbnail
    } for c in courses]

@router.get("/enrolled")
async def get_enrolled_courses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's enrolled courses"""
    enrollments = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id
    ).all()
    
    enrolled_courses = []
    for enrollment in enrollments:
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()
        if course:
            enrolled_courses.append({
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "level": course.level,
                "duration": course.duration,
                "lessons": course.lessons,
                "thumbnail": course.thumbnail,
                "progress": enrollment.progress
            })
    
    return enrolled_courses

@router.get("/platforms")
async def get_platforms(db: Session = Depends(get_db)):
    """Get all external learning platforms"""
    import json
    platforms = db.query(LearningPlatform).all()
    
    return [{
        "id": p.id,
        "title": p.title,
        "description": p.description,
        "category": p.category,
        "provider": p.provider,
        "duration": p.duration,
        "students": p.students,
        "level": p.level,
        "link": p.link,
        "features": json.loads(p.features) if p.features else [],
        "isOfficial": p.is_official
    } for p in platforms]

@router.post("/enroll/{course_id}")
async def enroll_in_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enroll in a course"""
    from app.services.activity_tracker import ActivityTracker
    
    # Check if course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if already enrolled
    existing_enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()
    
    if existing_enrollment:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")
    
    # Create enrollment
    enrollment = Enrollment(
        user_id=current_user.id,
        course_id=course_id,
        progress=0
    )
    
    db.add(enrollment)
    db.commit()
    
    # Log activity for dashboard
    ActivityTracker.log_course_enrollment(
        db=db,
        user_id=current_user.id,
        course_title=course.title
    )
    
    return {"message": "Successfully enrolled in course"}

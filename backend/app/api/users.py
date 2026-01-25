from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import os
import shutil
from datetime import datetime
from app.core.database import get_db
from app.models.models import User
from app.api.auth import oauth2_scheme
from app.core.security import decode_access_token

router = APIRouter()

# Directory for profile images
UPLOAD_DIR = "uploads/profiles"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class StatsResponse(BaseModel):
    queriesCount: int
    coursesEnrolled: int
    resourcesViewed: int
    achievementsEarned: int

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    language: Optional[str] = None
    communityType: Optional[str] = None

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current authenticated user"""
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.get("/stats", response_model=StatsResponse)
async def get_user_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user statistics"""
    from app.models.models import Query, Enrollment
    
    queries_count = db.query(Query).filter(Query.user_id == current_user.id).count()
    courses_enrolled = db.query(Enrollment).filter(Enrollment.user_id == current_user.id).count()
    
    return {
        "queriesCount": queries_count,
        "coursesEnrolled": courses_enrolled,
        "resourcesViewed": 0,  # Implement tracking
        "achievementsEarned": 0  # Implement achievements system
    }

@router.get("/activity")
async def get_user_activity(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user recent activity"""
    from app.models.models import Query
    
    recent_queries = db.query(Query).filter(
        Query.user_id == current_user.id
    ).order_by(Query.created_at.desc()).limit(10).all()
    
    activity = []
    for query in recent_queries:
        activity.append({
            "description": f"Asked: {query.message[:50]}...",
            "timestamp": query.created_at.strftime("%Y-%m-%d %H:%M")
        })
    
    return activity

@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "location": current_user.location,
        "language": current_user.language,
        "communityType": current_user.community_type,
        "profileImage": current_user.profile_image
    }

@router.put("/me")
async def update_user_info(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user information"""
    try:
        if user_data.name is not None:
            current_user.name = user_data.name
            
        if user_data.email is not None:
            # Check if email is already taken
            if user_data.email != current_user.email:
                existing_user = db.query(User).filter(User.email == user_data.email).first()
                if existing_user:
                    raise HTTPException(status_code=400, detail="Email already registered")
                current_user.email = user_data.email
                
        if user_data.phone is not None:
            current_user.phone = user_data.phone
            
        if user_data.location is not None:
            current_user.location = user_data.location
            
        if user_data.language is not None:
            current_user.language = user_data.language
            
        if user_data.communityType is not None:
            current_user.community_type = user_data.communityType
            
        db.commit()
        db.refresh(current_user)
        
        return {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "phone": current_user.phone,
            "location": current_user.location,
            "language": current_user.language,
            "communityType": current_user.community_type,
            "profileImage": current_user.profile_image
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f"Error updating profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@router.post("/me/photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload profile photo"""
    # Check file extension
    allowed_extensions = [".jpg", ".jpeg", ".png", ".gif"]
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Create unique filename
    filename = f"user_{current_user.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Update user profile_image path
        # In a real app, you might serve this via a dedicated static route or CDN
        relative_path = f"/uploads/profiles/{filename}"
        current_user.profile_image = relative_path
        db.commit()
        db.refresh(current_user)
        
        return {"profileImage": relative_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

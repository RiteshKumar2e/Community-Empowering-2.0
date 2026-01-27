from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import User
from app.api.users import get_current_user
from app.services.email_service import email_service

router = APIRouter()

class FeedbackRequest(BaseModel):
    category: str
    rating: int
    message: str

@router.post("")
async def submit_feedback(
    feedback: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit user feedback and send it to admin email"""
    try:
        # Send email to admin
        success = email_service.send_feedback_to_admin(
            user_name=current_user.name,
            user_email=current_user.email,
            category=feedback.category,
            rating=feedback.rating,
            message=feedback.message
        )
        
        if not success:
            # We still return 200 but log the error
            print(f"⚠️ Feedback email failed for {current_user.email}")
            
        return {"status": "success", "message": "Feedback submitted successfully"}
    except Exception as e:
        print(f"❌ Feedback submission error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process feedback")

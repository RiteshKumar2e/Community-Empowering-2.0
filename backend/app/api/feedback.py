from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from app.core.database import get_db
from app.models.models import Feedback, User
from app.api.users import get_current_user
from app.services.email_service import email_service
from app.core.rate_limit import feedback_limiter

router = APIRouter()

class FeedbackRequest(BaseModel):
    category: str = Field(..., max_length=40)
    rating: int = Field(..., ge=1, le=5)
    message: str = Field(..., min_length=1, max_length=3000)

@router.post("", dependencies=[Depends(feedback_limiter)])
async def submit_feedback(
    feedback: FeedbackRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save user feedback for the admin panel, then email it to the admin.
    Saving decides success; a failed email doesn't lose the feedback."""
    db.add(Feedback(
        user_id=current_user.id,
        rating=feedback.rating,
        comment=feedback.message,
        category=feedback.category,
    ))
    db.commit()
    background_tasks.add_task(
        email_service.send_feedback_to_admin,
        user_name=current_user.name,
        user_email=current_user.email,
        category=feedback.category,
        rating=feedback.rating,
        message=feedback.message,
    )
    return {"status": "success", "message": "Feedback submitted successfully"}

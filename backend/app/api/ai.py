from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional
from app.core.database import get_db
from app.models.models import Query, User
from app.api.users import get_current_user
from app.services.ai_service import AIService
from app.core.rate_limit import ai_limiter, AI_MAX_MESSAGE_CHARS

router = APIRouter()
ai_service = AIService()

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=AI_MAX_MESSAGE_CHARS)
    language: str = "en"
    context: Optional[dict] = None

class ChatResponse(BaseModel):
    message: str
    language: str

class RecommendationResponse(BaseModel):
    icon: str
    title: str
    description: str
    category: str

@router.post("/chat", response_model=ChatResponse, dependencies=[Depends(ai_limiter)])
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Chat with AI assistant"""
    # Save query to database
    query = Query(
        user_id=current_user.id,
        message=request.message,
        language=request.language
    )

    # Get AI response
    response_text = await ai_service.get_chat_response(
        message=request.message,
        language=request.language,
        context=request.context
    )

    query.response = response_text
    db.add(query)
    db.commit()

    return {
        "message": response_text,
        "language": request.language
    }

@router.get("/recommendations")
async def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered recommendations"""
    recommendations = await ai_service.get_recommendations(
        user_profile={
            "community_type": current_user.community_type,
            "location": current_user.location,
            "language": current_user.language
        }
    )

    return recommendations

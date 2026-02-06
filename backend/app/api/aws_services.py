"""
AI Services API Endpoints
Provides REST API endpoints for Amazon Q, Groq, and Gemini AI services.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict, List
from app.services.enhanced_ai_service import EnhancedAIService

router = APIRouter(prefix="/api/aws", tags=["AI Services"])

# Initialize enhanced AI service
enhanced_ai_service = EnhancedAIService()


# Request/Response Models
class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    context: Optional[Dict] = None
    model: Optional[str] = None
    use_amazon_q: bool = True


class ChatResponse(BaseModel):
    response: str
    provider: str
    language: str


class SentimentRequest(BaseModel):
    text: str


class SentimentResponse(BaseModel):
    sentiment: str
    confidence: float
    key_emotions: List[str]


class EmbeddingsRequest(BaseModel):
    text: str


class EmbeddingsResponse(BaseModel):
    embeddings: List[float]
    dimension: int


class QueryAnalysisRequest(BaseModel):
    query: str
    context: Optional[Dict] = None


class LearningPathRequest(BaseModel):
    goals: List[str]
    current_skills: List[str]
    context: Optional[Dict] = None


class BusinessInsightsRequest(BaseModel):
    metrics: Dict
    time_period: str = "last_month"


class SchemeRecommendationRequest(BaseModel):
    location: str
    community_type: str
    additional_filters: Optional[Dict] = None


# API Endpoints

@router.post("/chat", response_model=ChatResponse)
async def enhanced_chat(request: ChatRequest):
    """
    Enhanced chat endpoint with multi-provider support
    """
    try:
        response = await enhanced_ai_service.get_chat_response(
            message=request.message,
            language=request.language,
            context=request.context,
            model=request.model,
            use_q=request.use_amazon_q
        )
        
        provider = enhanced_ai_service._get_primary_provider()
        
        return ChatResponse(
            response=response,
            provider=provider,
            language=request.language
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat service error: {str(e)}"
        )


@router.get("/status")
async def get_service_status():
    """
    Get status of all AI services
    """
    try:
        return enhanced_ai_service.get_service_status()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Status check error: {str(e)}"
        )


@router.get("/models")
async def get_available_models():
    """
    Get list of all available AI models
    """
    try:
        models = enhanced_ai_service.get_available_models()
        return {
            "providers": list(models.keys()),
            "models": models,
            "total_count": sum(len(v) for v in models.values())
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Models list error: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "services": enhanced_ai_service.services_available
    }


# Amazon Q Endpoints

@router.post("/q/ask")
async def ask_amazon_q(request: ChatRequest):
    """
    Ask a question to Amazon Q directly
    """
    try:
        if not enhanced_ai_service.services_available["amazon_q"]:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Amazon Q service not available"
            )
        
        result = await enhanced_ai_service.q_service.ask_question(
            question=request.message,
            context=request.context,
            user_id=request.context.get('user_id') if request.context else None
        )
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Amazon Q error: {str(e)}"
        )


@router.post("/q/analyze-query")
async def analyze_query(request: QueryAnalysisRequest):
    """
    Analyze user query to understand intent
    """
    try:
        result = await enhanced_ai_service.analyze_query(
            query=request.query,
            context=request.context
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Query analysis error: {str(e)}"
        )


@router.post("/q/learning-path")
async def generate_learning_path(request: LearningPathRequest):
    """
    Generate personalized learning path
    """
    try:
        result = await enhanced_ai_service.get_learning_path(
            goals=request.goals,
            current_skills=request.current_skills,
            context=request.context
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Learning path generation error: {str(e)}"
        )


@router.post("/q/business-insights")
async def get_business_insights(request: BusinessInsightsRequest):
    """
    Get business insights and analytics
    """
    try:
        result = await enhanced_ai_service.get_business_insights(
            metrics=request.metrics,
            time_period=request.time_period
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Business insights error: {str(e)}"
        )


@router.post("/q/scheme-recommendations")
async def recommend_schemes(request: SchemeRecommendationRequest):
    """
    Get government scheme recommendations
    """
    try:
        result = await enhanced_ai_service.get_recommendations(
            location=request.location,
            community_type=request.community_type,
            additional_filters=request.additional_filters
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scheme recommendation error: {str(e)}"
        )


@router.post("/q/detect-language")
async def detect_language(text: str):
    """
    Detect language of text
    """
    try:
        if not enhanced_ai_service.services_available["amazon_q"]:
            # Simple fallback detection
            if any(ord(char) > 2304 and ord(char) < 2431 for char in text):
                return {"text": text, "detected_language": "hi"}
            return {"text": text, "detected_language": "en"}
        
        language = await enhanced_ai_service.q_service.detect_language(text)
        
        return {
            "text": text,
            "detected_language": language
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Language detection error: {str(e)}"
        )

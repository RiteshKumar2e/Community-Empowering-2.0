from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.core.database import get_db
from app.models.models import User
from app.api.users import get_current_user
from app.services.ai_service import AIService
import json

router = APIRouter()
ai_service = AIService()

class AgentChatRequest(BaseModel):
    message: str
    language: str = "en"
    context: Optional[dict] = None

class AgentChatResponse(BaseModel):
    response: str
    meta: Dict[str, Any]

@router.post("/chat", response_model=AgentChatResponse)
async def agent_chat(
    request: AgentChatRequest,
    db: Session = Depends(get_db)
):
    """
    Advanced agent chat endpoint that returns response and metadata.
    This can be used without auth for guest users as well, 
    but can take current_user as optional if needed.
    """
    
    # In a real scenario, we would use a more advanced prompt to get JSON output
    # For now, we'll use the ai_service and manually structure the meta
    # or improve the ai_service to support agent features.
    
    prompt = f"""
    The following is a message from a user on our Community Empowering platform.
    Analyze the message and provide:
    1. A helpful response.
    2. Categorize it (complaint, inquiry, feedback, or greeting).
    3. Identify the specific category (education, health, finance, etc.).
    4. Determine the priority (high, medium, low).

    User Message: {request.message}

    Format your output EXACTLY as a JSON object:
    {{
        "response": "your helpful response message here",
        "meta": {{
            "type": "the type here",
            "category": "the category here",
            "priority": "the priority here"
        }}
    }}
    """
    
    try:
        raw_response = await ai_service.get_chat_response(prompt, language=request.language)
        
        # More robust JSON extraction using regex
        import re
        json_match = re.search(r'(\{.+\})', raw_response, re.DOTALL)
        if json_match:
            clean_response = json_match.group(1)
            data = json.loads(clean_response)
        else:
            # Fallback if no JSON found
            data = {"response": raw_response, "meta": {"type": "inquiry", "category": "general", "priority": "low"}}
            
        return AgentChatResponse(
            response=data.get("response", "I'm here to help."),
            meta=data.get("meta", {"type": "inquiry", "category": "general", "priority": "low"})
        )
    except Exception as e:
        # Fallback if AI fails to return proper JSON
        print(f"Agent Chat Error: {e}")
        return AgentChatResponse(
            response=await ai_service.get_chat_response(request.message, language=request.language),
            meta={"type": "inquiry", "category": "general", "priority": "low"}
        )

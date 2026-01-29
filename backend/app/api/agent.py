from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.core.database import get_db
from app.api.auth import oauth2_scheme
from app.models.models import User
from app.api.users import get_current_user
from app.services.ai_service import AIService
from app.services.search_service import search_service
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
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    Advanced agent chat endpoint that returns response and metadata.
    Logs activity if user is authenticated.
    """
    
    # Try to get current user if token is provided
    current_user = None
    if token:
        from app.api.users import get_current_user
        try:
            current_user = await get_current_user(token, db)
        except:
            pass

    # NEW: Search Integration
    search_triggers = ["search", "google", "latest", "find", "current", "news", "scheme", "update", "browser", "chrome"]
    needs_search = any(trigger in request.message.lower() for trigger in search_triggers)
    
    search_results = ""
    if needs_search:
        print(f"🌐 Triggering Web Search for: {request.message}")
        search_results = search_service.search(request.message)

    prompt = f"""
    The following is a message from a user on our Community Empowering platform.
    
    {f"REAL-TIME WEB SEARCH RESULTS (Use this to answer if relevant):\n{search_results}" if search_results else ""}

    Analyze the message and provide:
    1. A helpful response. (If search results were provided, use them to give accurate info).
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
            
        final_response = data.get("response", "I'm here to help.")
        final_meta = data.get("meta", {"type": "inquiry", "category": "general", "priority": "low"})

        # Log to database if user is authenticated
        if current_user:
            from app.models.models import Query
            from app.services.activity_tracker import ActivityTracker
            
            # Save to Query table
            query = Query(
                user_id=current_user.id,
                message=request.message,
                response=final_response,
                language=request.language
            )
            db.add(query)
            
            # Log activity
            ActivityTracker.log_ai_query(
                db=db,
                user_id=current_user.id,
                query_text=request.message,
                language=request.language
            )
            
            db.commit()

        return AgentChatResponse(
            response=final_response,
            meta=final_meta
        )
    except Exception as e:
        # Fallback if AI fails
        print(f"Agent Chat Error: {e}")
        fallback_text = await ai_service.get_chat_response(request.message, language=request.language)
        
        if current_user:
            from app.models.models import Query
            query = Query(user_id=current_user.id, message=request.message, response=fallback_text, language=request.language)
            db.add(query)
            db.commit()

        return AgentChatResponse(
            response=fallback_text,
            meta={"type": "inquiry", "category": "general", "priority": "low"}
        )

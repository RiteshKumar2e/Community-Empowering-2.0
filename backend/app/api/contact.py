"""Public contact form: questions, corrections to scheme pages, partnerships.

No login needed. Messages are saved first (so nothing is lost if email is
down) and then emailed to the admin in the background. Spam protection: a
per-IP rate limit and a hidden "website" field that people never fill in.
"""
from typing import Literal, Optional

from fastapi import APIRouter, BackgroundTasks, Depends
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.privacy import mask_email
from app.core.rate_limit import contact_limiter
from app.models.models import ContactMessage
from app.services.email_service import email_service

router = APIRouter()


class ContactIn(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    topic: Literal['general', 'correction', 'partnership', 'privacy'] = 'general'
    message: str = Field(..., min_length=10, max_length=3000)
    # The page a correction is about, e.g. "/schemes/pm-kisan".
    page: Optional[str] = Field(None, max_length=300)
    # Honeypot: hidden from people, filled in by most bots.
    website: Optional[str] = Field(None, max_length=200)

    @field_validator('name', 'message')
    @classmethod
    def strip_text(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError('This field is too short')
        return value

    @field_validator('page')
    @classmethod
    def internal_page_only(cls, value: Optional[str]) -> Optional[str]:
        if value and not value.startswith('/'):
            return None
        return value


OK = {"success": True, "message": "Thank you. We have received your message and will reply by email."}


@router.post("", dependencies=[Depends(contact_limiter)])
async def submit_contact(body: ContactIn, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if body.website:
        # A bot filled the hidden field: answer like a success, store nothing.
        print(f"[contact] honeypot hit from {mask_email(body.email)}")
        return OK
    db.add(ContactMessage(
        name=body.name,
        email=body.email,
        topic=body.topic,
        message=body.message,
        page=body.page,
    ))
    db.commit()
    background_tasks.add_task(
        email_service.send_contact_to_admin,
        name=body.name, email=body.email, topic=body.topic, message=body.message, page=body.page,
    )
    return OK

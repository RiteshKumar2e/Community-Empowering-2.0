"""Private, per-user data for the signup funnel: saved schemes and saved
eligibility results.

Every route depends on get_current_user and every query is filtered by
current_user.id, so a user can only ever read or change their own records.
"""
import json
import re
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.users import get_current_user
from app.core.database import get_db
from datetime import date, datetime, timezone

from app.models.models import (
    ChatMessage, EligibilityResult, EmailVerification, Enrollment, Feedback, ForumDiscussion, ForumLike,
    ForumReply, ForumReplyLike, ForumReplyView, ForumView, PasswordResetCode, Query, Reminder, SavedScheme,
    User, UserActivity,
)

router = APIRouter()

SLUG_PATTERN = r"^[a-z0-9]+(?:-[a-z0-9]+)*$"
Slug = Field(..., min_length=2, max_length=80, pattern=SLUG_PATTERN)
MAX_SAVED_SCHEMES = 100
MAX_RESULTS_KEPT = 10


# --- Saved schemes ---------------------------------------------------------

class SaveSchemeIn(BaseModel):
    slug: str = Slug


def _saved_out(row: SavedScheme) -> dict:
    return {"slug": row.scheme_slug, "savedAt": row.created_at.isoformat() if row.created_at else None}


@router.get("/saved-schemes")
async def list_saved_schemes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(SavedScheme)
        .filter(SavedScheme.user_id == current_user.id)
        .order_by(SavedScheme.created_at.desc())
        .all()
    )
    return [_saved_out(r) for r in rows]


@router.post("/saved-schemes", status_code=status.HTTP_201_CREATED)
async def save_scheme(body: SaveSchemeIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = (
        db.query(SavedScheme)
        .filter(SavedScheme.user_id == current_user.id, SavedScheme.scheme_slug == body.slug)
        .first()
    )
    if existing:
        return _saved_out(existing)  # idempotent

    count = db.query(SavedScheme).filter(SavedScheme.user_id == current_user.id).count()
    if count >= MAX_SAVED_SCHEMES:
        raise HTTPException(status_code=400, detail=f"You can save up to {MAX_SAVED_SCHEMES} schemes.")

    row = SavedScheme(user_id=current_user.id, scheme_slug=body.slug)
    db.add(row)
    db.commit()
    db.refresh(row)
    return _saved_out(row)


@router.delete("/saved-schemes/{slug}")
async def unsave_scheme(slug: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    deleted = (
        db.query(SavedScheme)
        .filter(SavedScheme.user_id == current_user.id, SavedScheme.scheme_slug == slug)
        .delete()
    )
    db.commit()
    return {"removed": bool(deleted)}


# --- Eligibility results ---------------------------------------------------

class EligibilityAnswers(BaseModel):
    """Only what is needed to re-run the check. Social category is
    deliberately NOT accepted or stored."""
    age: int = Field(..., ge=1, le=120)
    gender: Literal["female", "male", "other"]
    occupation: Literal["student", "farmer", "worker", "business", "unemployed", "homemaker", "retired"]
    state: Literal["Jharkhand", "other"]
    taxPayer: Literal["no", "yes", "unsure"]
    income: Literal["below", "above", "unsure"]
    daughter: Literal["yes", "no"]


class EligibilityResultIn(BaseModel):
    answers: EligibilityAnswers
    schemes: List[str] = Field(default_factory=list, max_length=50)


def _result_out(row: EligibilityResult) -> dict:
    return {
        "id": row.id,
        "answers": json.loads(row.answers_json),
        "schemes": json.loads(row.scheme_slugs_json),
        "createdAt": row.created_at.isoformat() if row.created_at else None,
    }


@router.post("/eligibility-results", status_code=status.HTTP_201_CREATED)
async def save_eligibility_result(
    body: EligibilityResultIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    slugs = [s for s in dict.fromkeys(body.schemes) if re.fullmatch(SLUG_PATTERN, s) and len(s) <= 80]
    row = EligibilityResult(
        user_id=current_user.id,
        answers_json=json.dumps(body.answers.model_dump()),
        scheme_slugs_json=json.dumps(slugs),
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    # Keep only the most recent results per user.
    stale = (
        db.query(EligibilityResult.id)
        .filter(EligibilityResult.user_id == current_user.id)
        .order_by(EligibilityResult.created_at.desc(), EligibilityResult.id.desc())
        .offset(MAX_RESULTS_KEPT)
        .all()
    )
    if stale:
        db.query(EligibilityResult).filter(EligibilityResult.id.in_([s.id for s in stale])).delete(synchronize_session=False)
        db.commit()

    return _result_out(row)


@router.get("/eligibility-results")
async def list_eligibility_results(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(EligibilityResult)
        .filter(EligibilityResult.user_id == current_user.id)
        .order_by(EligibilityResult.created_at.desc(), EligibilityResult.id.desc())
        .limit(5)
        .all()
    )
    return [_result_out(r) for r in rows]



# --- Reminders ---------------------------------------------------------------
# Dates the user sets for themselves. They are never shown as official deadlines.

MAX_REMINDERS = 50


class ReminderIn(BaseModel):
    title: str = Field(..., min_length=2, max_length=120)
    remindOn: date
    schemeSlug: Optional[str] = Field(None, max_length=80, pattern=SLUG_PATTERN)


def _reminder_out(r: Reminder) -> dict:
    return {"id": r.id, "title": r.title, "remindOn": r.remind_on, "schemeSlug": r.scheme_slug, "done": bool(r.done)}


@router.get("/reminders")
async def list_reminders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(Reminder).filter(Reminder.user_id == current_user.id).order_by(Reminder.remind_on.asc()).all()
    return [_reminder_out(r) for r in rows]


@router.post("/reminders", status_code=status.HTTP_201_CREATED)
async def create_reminder(body: ReminderIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if body.remindOn < date.today():
        raise HTTPException(status_code=422, detail="Pick today or a future date.")
    if db.query(Reminder).filter(Reminder.user_id == current_user.id).count() >= MAX_REMINDERS:
        raise HTTPException(status_code=400, detail=f"You can keep up to {MAX_REMINDERS} reminders.")
    row = Reminder(user_id=current_user.id, title=body.title.strip(), remind_on=body.remindOn.isoformat(), scheme_slug=body.schemeSlug)
    db.add(row)
    db.commit()
    db.refresh(row)
    return _reminder_out(row)


@router.patch("/reminders/{reminder_id}")
async def toggle_reminder(reminder_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    row = db.query(Reminder).filter(Reminder.id == reminder_id, Reminder.user_id == current_user.id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Reminder not found")
    row.done = not row.done
    db.commit()
    return _reminder_out(row)


@router.delete("/reminders/{reminder_id}")
async def delete_reminder(reminder_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    deleted = db.query(Reminder).filter(Reminder.id == reminder_id, Reminder.user_id == current_user.id).delete()
    db.commit()
    return {"removed": bool(deleted)}


# --- Your data: export and account deletion -------------------------------------

def _iso(dt):
    return dt.isoformat() if dt else None


@router.get("/export")
async def export_my_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Everything this app stores about the signed-in user, as JSON."""
    uid = current_user.id
    return {
        "exportedAt": _iso(datetime.now(timezone.utc)),
        "profile": {
            "name": current_user.name, "email": current_user.email, "phone": current_user.phone,
            "location": current_user.location, "language": current_user.language,
            "communityType": current_user.community_type, "createdAt": _iso(current_user.created_at),
            "lastLogin": _iso(current_user.last_login),
        },
        "savedSchemes": [_saved_out(r) for r in db.query(SavedScheme).filter(SavedScheme.user_id == uid).all()],
        "eligibilityResults": [_result_out(r) for r in db.query(EligibilityResult).filter(EligibilityResult.user_id == uid).all()],
        "reminders": [_reminder_out(r) for r in db.query(Reminder).filter(Reminder.user_id == uid).all()],
        "aiQuestions": [{"message": q.message, "response": q.response, "createdAt": _iso(q.created_at)} for q in db.query(Query).filter(Query.user_id == uid).all()],
        "feedback": [{"rating": f.rating, "comment": f.comment, "category": f.category, "createdAt": _iso(f.created_at)} for f in db.query(Feedback).filter(Feedback.user_id == uid).all()],
        "activity": [{"type": a.activity_type, "title": a.activity_title, "createdAt": _iso(a.created_at)} for a in db.query(UserActivity).filter(UserActivity.user_id == uid).all()],
        "forumDiscussions": [{"title": d.title, "content": d.content, "createdAt": _iso(d.created_at)} for d in db.query(ForumDiscussion).filter(ForumDiscussion.user_id == uid).all()],
        "forumReplies": [{"content": r.content, "createdAt": _iso(r.created_at)} for r in db.query(ForumReply).filter(ForumReply.user_id == uid).all()],
    }


class DeleteAccountIn(BaseModel):
    confirm: Literal["DELETE"]


@router.delete("/account")
async def delete_my_account(body: DeleteAccountIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Permanently delete the signed-in user's account and all their data."""
    uid = current_user.id
    if current_user.is_admin:
        raise HTTPException(status_code=400, detail="Admin accounts can't be deleted from here.")

    own_discussions = [d.id for d in db.query(ForumDiscussion.id).filter(ForumDiscussion.user_id == uid)]
    reply_ids = [r.id for r in db.query(ForumReply.id).filter(
        (ForumReply.user_id == uid) | (ForumReply.discussion_id.in_(own_discussions or [-1]))
    )]
    if reply_ids:
        db.query(ForumReplyLike).filter(ForumReplyLike.reply_id.in_(reply_ids)).delete(synchronize_session=False)
        db.query(ForumReplyView).filter(ForumReplyView.reply_id.in_(reply_ids)).delete(synchronize_session=False)
        db.query(ForumReply).filter(ForumReply.id.in_(reply_ids)).delete(synchronize_session=False)
    if own_discussions:
        db.query(ForumLike).filter(ForumLike.discussion_id.in_(own_discussions)).delete(synchronize_session=False)
        db.query(ForumView).filter(ForumView.discussion_id.in_(own_discussions)).delete(synchronize_session=False)
        db.query(ForumDiscussion).filter(ForumDiscussion.id.in_(own_discussions)).delete(synchronize_session=False)

    for model in (ForumLike, ForumView, ForumReplyLike, ForumReplyView, Enrollment, Query, Feedback, UserActivity,
                  SavedScheme, EligibilityResult, Reminder, PasswordResetCode, EmailVerification):
        db.query(model).filter(model.user_id == uid).delete(synchronize_session=False)
    db.query(ChatMessage).filter((ChatMessage.sender_id == uid) | (ChatMessage.receiver_id == uid)).delete(synchronize_session=False)

    db.query(User).filter(User.id == uid).delete(synchronize_session=False)
    db.commit()
    return {"success": True, "message": "Your account and data have been deleted."}

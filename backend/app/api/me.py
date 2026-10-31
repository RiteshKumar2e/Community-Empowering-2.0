"""Private, per-user data for the signup funnel: saved schemes and saved
eligibility results.

Every route depends on get_current_user and every query is filtered by
current_user.id, so a user can only ever read or change their own records.
"""
import json
import re
from typing import List, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.users import get_current_user
from app.core.database import get_db
from app.models.models import EligibilityResult, SavedScheme, User

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

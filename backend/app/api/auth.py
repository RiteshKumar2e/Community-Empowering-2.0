from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional
from datetime import datetime, timezone, timedelta
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.config import settings
from app.core.database import get_db
from fastapi.concurrency import run_in_threadpool
from app.core.security import verify_password, get_password_hash, create_access_token, hash_code, verify_code
from app.models.models import User, PasswordResetCode, EmailVerification
from app.core.rate_limit import (
    login_limiter, register_limiter, password_reset_limiter, verification_limiter,
    otp_verify_limiter, otp_resend_limiter, otp_failures,
)
from app.services.email_service import email_service
import os
import secrets
from app.core.privacy import mask_email

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Reuse the request object for better performance (caches Google's certificates)
google_request = requests.Request()

class UserRegister(BaseModel):
    # Same rules as the signup form, enforced here so they can't be bypassed.
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r"^(\+91|0)?[\s-]*[6-9](?:[\s-]*\d){9}$")
    # bcrypt only uses the first 72 bytes of a password.
    password: str = Field(..., min_length=6, max_length=72)
    location: str = Field(..., min_length=2, max_length=120)
    language: str = Field("en", max_length=10)
    communityType: str = Field("general", max_length=30)

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., max_length=128)


class ForgotPasswordIn(BaseModel):
    email: EmailStr


class ResetPasswordIn(BaseModel):
    email: EmailStr
    code: str = Field(..., pattern=r"^\d{6}$")
    new_password: str = Field(..., min_length=6, max_length=72)

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    location: str
    language: str
    communityType: str
    profileImage: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class GoogleLogin(BaseModel):
    credential: str

class GoogleOTPVerify(BaseModel):
    email: EmailStr
    otp: str



# --- Email verification ------------------------------------------------------
# Soft verification: accounts work immediately; the dashboard asks the user to
# confirm their email with a 6-digit code. Google accounts are verified by Google.

VERIFY_CODE_TTL = timedelta(minutes=30)
VERIFY_RESEND_COOLDOWN = timedelta(seconds=60)
VERIFY_MAX_ATTEMPTS = 5


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Same check as app.api.users.get_current_user (users.py imports from this
    module, so importing it here would be circular)."""
    from app.core.security import decode_access_token
    payload = decode_access_token(token)
    user = db.query(User).filter(User.email == payload.get("sub")).first() if payload else None
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    return user


def _verified_without_query(user: User) -> bool:
    return bool(user.google_email_verified or user.password_hash == "google_authenticated_user")


def is_email_verified(user: User, db: Session) -> bool:
    if _verified_without_query(user):
        return True
    row = db.query(EmailVerification).filter(EmailVerification.user_id == user.id).first()
    return bool(row and row.verified_at)


def _aware(dt):
    return dt if dt is None or dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _issue_verification_code(user: User, db: Session, background_tasks: BackgroundTasks,
                             row: Optional[EmailVerification] = None, commit: bool = True) -> None:
    """Create or refresh the user's code. Pass the already-loaded row (or a new
    user's empty one) to save a database round trip."""
    if row is None:
        row = db.query(EmailVerification).filter(EmailVerification.user_id == user.id).first()
    if row is None:
        row = EmailVerification(user_id=user.id)
        db.add(row)
    code = email_service.generate_otp()
    now = datetime.now(timezone.utc)
    row.code_hash = hash_code(code)
    row.expires_at = now + VERIFY_CODE_TTL
    row.sent_at = now
    row.attempts = 0
    if commit:
        db.commit()
    background_tasks.add_task(email_service.send_otp, user.email, code, "email_verification")


class VerifyEmailIn(BaseModel):
    code: str = Field(..., pattern=r"^\d{6}$")


@router.post("/email/send-verification", dependencies=[Depends(verification_limiter)])
async def send_verification(background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    row = db.query(EmailVerification).filter(EmailVerification.user_id == current_user.id).first()
    if _verified_without_query(current_user) or (row and row.verified_at):
        return {"success": True, "alreadyVerified": True}
    if row and row.sent_at and datetime.now(timezone.utc) - _aware(row.sent_at) < VERIFY_RESEND_COOLDOWN:
        raise HTTPException(status_code=429, detail="Please wait a minute before requesting another code.")
    _issue_verification_code(current_user, db, background_tasks, row=row)
    return {"success": True, "message": "We've emailed you a 6-digit code. It expires in 30 minutes."}


@router.post("/email/verify", dependencies=[Depends(verification_limiter)])
async def verify_email(body: VerifyEmailIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    row = db.query(EmailVerification).filter(EmailVerification.user_id == current_user.id).first()
    if _verified_without_query(current_user) or (row and row.verified_at):
        return {"success": True, "emailVerified": True}
    invalid = HTTPException(status_code=400, detail="That code is invalid or has expired. Request a new one.")
    if not row or not row.code_hash or not row.expires_at:
        raise invalid
    if _aware(row.expires_at) < datetime.now(timezone.utc) or (row.attempts or 0) >= VERIFY_MAX_ATTEMPTS:
        raise invalid
    if not verify_code(body.code, row.code_hash):
        row.attempts = (row.attempts or 0) + 1
        db.commit()
        raise invalid
    row.verified_at = datetime.now(timezone.utc)
    row.code_hash = None
    db.commit()
    return {"success": True, "emailVerified": True}

@router.post("/register", response_model=dict, dependencies=[Depends(register_limiter)])
async def register(user_data: UserRegister, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # bcrypt is deliberately slow (~0.5-2 s); run it in a worker thread so it
    # doesn't stall every other request on the server meanwhile.
    password_hash = await run_in_threadpool(get_password_hash, user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=password_hash,
        location=user_data.location,
        language=user_data.language,
        community_type=user_data.communityType
    )

    # User and verification code are saved in one transaction (each round
    # trip to the remote database costs time).
    db.add(new_user)
    db.flush()  # assigns new_user.id
    verification = EmailVerification(user_id=new_user.id)
    db.add(verification)
    _issue_verification_code(new_user, db, background_tasks, row=verification, commit=False)
    # Read the response fields before commit: afterwards SQLAlchemy would
    # reload the object from the database just to read them back.
    user_out = {
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "phone": new_user.phone,
        "location": new_user.location,
        "language": new_user.language,
        "communityType": new_user.community_type,
        "profileImage": new_user.profile_image,
        "emailVerified": False,
    }
    db.commit()

    return {"token": create_access_token(data={"sub": user_out["email"]}), "user": user_out}

@router.post("/login", response_model=dict, dependencies=[Depends(login_limiter)])
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    user = db.query(User).filter(User.email == user_data.email).first()

    if not user or not await run_in_threadpool(verify_password, user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    # Build the response before commit (afterwards SQLAlchemy reloads the row).
    user_out = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "location": user.location,
        "language": user.language,
        "communityType": user.community_type,
        "profileImage": user.profile_image,
        "emailVerified": is_email_verified(user, db)
    }
    user.last_login = datetime.now(timezone.utc)
    db.commit()

    return {"token": create_access_token(data={"sub": user_out["email"]}), "user": user_out}

@router.post("/google-login", response_model=dict)
async def google_login(google_data: GoogleLogin, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Step 1: Verify Google token and send OTP to user's email
    Returns: Success message indicating OTP has been sent
    """
    # Only the token check returns 401. Database or email problems below are
    # server errors and must not look like "Invalid Google token".
    try:
        idinfo = id_token.verify_oauth2_token(
            google_data.credential,
            google_request,
            audience=settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10,  # small clock differences between Google and Render
        )
    except ValueError as e:
        print(f"❌ Google token verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token. Please try again."
        )

    try:
        # Get user info from Google token
        email = idinfo.get('email')
        name = idinfo.get('name', '')
        picture = idinfo.get('picture', '')

        print(f"✅ Google token verified for email: {mask_email(email)}")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by Google"
            )

        # Check if user exists
        user = db.query(User).filter(User.email == email).first()

        if not user:
            # Create new user with Google account (not yet verified)
            print(f"📝 Creating new user for: {mask_email(email)}")
            user = User(
                name=name,
                email=email,
                phone="",
                password_hash="google_authenticated_user",
                location="",
                language="en",
                community_type="general",
                profile_image=picture,
                google_email_verified=False
            )
            db.add(user)

        # Generate OTP
        otp = email_service.generate_otp()
        otp_expiry = email_service.get_otp_expiry()

        # Update user with OTP in one go
        user.google_otp = otp
        user.google_otp_expiry = otp_expiry

        # Single commit for all changes
        db.commit()

        # INSTANT FIRE-AND-FORGET EMAIL via BackgroundTasks
        background_tasks.add_task(email_service.send_otp, email, otp)

        print(f"📧 OTP Dispatch Queued for {mask_email(email)}")

        return {
            "success": True,
            "message": "OTP sent!",
            "email": email,
            "requires_otp": True
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Google authentication error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google authentication failed. Please try again."
        )


@router.post("/verify-google-otp", response_model=dict, dependencies=[Depends(otp_verify_limiter)])
async def verify_google_otp(otp_data: GoogleOTPVerify, db: Session = Depends(get_db)):
    """
    Step 2: Verify OTP and complete Google login
    Returns: Access token and user data
    """
    try:
        # Find user by email
        user = db.query(User).filter(User.email == otp_data.email).first()

        # Same answer whether or not the account exists (no account enumeration).
        if not user or not user.google_otp:
            print(f"⚠️ Google OTP rejected for {mask_email(otp_data.email)}: no active code (never sent, already used or replaced)")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This code is invalid or has expired. Please sign in with Google again."
            )

        # Check if OTP has expired (Safe comparison for SQLite)
        now = datetime.now(timezone.utc)
        expiry = user.google_otp_expiry

        # Normalize to UTC aware if naive (SQLite common issue)
        if expiry and expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)

        if not expiry or expiry < now:
            print(f"⚠️ Google OTP rejected for {mask_email(user.email)}: code expired")
            # Clear expired OTP
            user.google_otp = None
            user.google_otp_expiry = None
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This code has expired. Please close this window and sign in with Google again."
            )

        # Verify OTP. After OTP_MAX_FAILURES wrong guesses the code is destroyed,
        # so a 6-digit code can't be brute-forced.
        if not secrets.compare_digest(str(user.google_otp), str(otp_data.otp)):
            failures = otp_failures.get(user.id, 0) + 1
            otp_failures[user.id] = failures
            if failures >= OTP_MAX_FAILURES:
                print(f"⚠️ Google OTP locked for {mask_email(user.email)}: too many wrong codes")
                user.google_otp = None
                user.google_otp_expiry = None
                db.commit()
                otp_failures.pop(user.id, None)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Too many wrong codes. Please sign in with Google again to get a new code."
                )
            left = OTP_MAX_FAILURES - failures
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Wrong code. {left} attempt{'s' if left != 1 else ''} left. Use the latest code we emailed you."
            )
        otp_failures.pop(user.id, None)

        # OTP verified successfully
        print(f"✅ OTP verified for {mask_email(user.email)}")

        # Mark email as verified, clear OTP and update login time
        user.google_email_verified = True
        user.google_otp = None
        user.google_otp_expiry = None
        user.last_login = datetime.now(timezone.utc)
        db.commit()

        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )

        # Create access token
        access_token = create_access_token(data={"sub": user.email})

        print(f"🎉 Google login successful for: {mask_email(user.email)}")

        # Build user data dict manually to avoid db.refresh or relationship loading delays
        user_data_resp = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone or "",
            "location": user.location or "",
            "language": user.language or "en",
            "communityType": user.community_type or "general",
            "profileImage": user.profile_image,
            "emailVerified": is_email_verified(user, db)
        }

        return {
            "token": access_token,
            "user": user_data_resp
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ OTP verification error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OTP verification failed. Please try again."
        )


class ResendOtpIn(BaseModel):
    email: EmailStr


RESEND_GENERIC = "If a Google sign-in is in progress for this email, a new code has been sent."


@router.post("/resend-google-otp", response_model=dict, dependencies=[Depends(otp_resend_limiter)])
async def resend_google_otp(email_data: ResendOtpIn, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Resend OTP for Google login
    """
    try:
        email = email_data.email

        # Only re-send for a Google sign-in that is already in progress (started
        # by /google-login, which requires a valid Google token for this email).
        # Previously anyone could create an OTP for ANY account here and then
        # guess it. Same response either way, so emails can't be probed.
        user = db.query(User).filter(User.email == email).first()
        expiry = user.google_otp_expiry if user else None
        if expiry is not None and expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
        if not user or not user.google_otp or not expiry or expiry < datetime.now(timezone.utc):
            return {"success": True, "message": RESEND_GENERIC}

        # Generate new OTP
        otp = email_service.generate_otp()
        otp_expiry = email_service.get_otp_expiry()

        # Update OTP in database
        user.google_otp = otp
        user.google_otp_expiry = otp_expiry
        db.commit()

        # Send OTP email via BackgroundTasks
        background_tasks.add_task(email_service.send_otp, email, otp)

        print(f"🔄 OTP resend queued for {mask_email(email)}")

        otp_failures.pop(user.id, None)
        return {"success": True, "message": RESEND_GENERIC}

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Resend OTP error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to resend OTP. Please try again."
        )




# --- Password reset ----------------------------------------------------------
# A 6-digit code is emailed; only its keyed hash (security.hash_code) is stored. Codes expire after
# 15 minutes, allow 5 attempts, and are single-use. The request endpoint always
# returns the same message so it can't be used to find out who has an account.

RESET_CODE_TTL = timedelta(minutes=15)
OTP_MAX_FAILURES = 5
RESET_MAX_ATTEMPTS = 5
RESET_GENERIC_MESSAGE = "If an account exists for that email, we've sent a 6-digit reset code. It expires in 15 minutes."


@router.post("/forgot-password", dependencies=[Depends(password_reset_limiter)])
async def forgot_password(body: ForgotPasswordIn, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if user and user.is_active:
        # Invalidate any earlier unused codes.
        db.query(PasswordResetCode).filter(
            PasswordResetCode.user_id == user.id, PasswordResetCode.used == False  # noqa: E712
        ).update({"used": True})
        code = email_service.generate_otp()
        db.add(PasswordResetCode(
            user_id=user.id,
            code_hash=hash_code(code),
            expires_at=datetime.now(timezone.utc) + RESET_CODE_TTL,
        ))
        db.commit()
        background_tasks.add_task(email_service.send_otp, user.email, code, "password_reset")
    return {"success": True, "message": RESET_GENERIC_MESSAGE}


@router.post("/reset-password", dependencies=[Depends(password_reset_limiter)])
async def reset_password(body: ResetPasswordIn, db: Session = Depends(get_db)):
    invalid = HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="That code is invalid or has expired. Request a new one.")
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise invalid

    record = (
        db.query(PasswordResetCode)
        .filter(PasswordResetCode.user_id == user.id, PasswordResetCode.used == False)  # noqa: E712
        .order_by(PasswordResetCode.created_at.desc(), PasswordResetCode.id.desc())
        .first()
    )
    if not record:
        raise invalid

    expires_at = record.expires_at
    if expires_at.tzinfo is None:  # SQLite returns naive datetimes
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc) or (record.attempts or 0) >= RESET_MAX_ATTEMPTS:
        record.used = True
        db.commit()
        raise invalid

    if not verify_code(body.code, record.code_hash):
        record.attempts = (record.attempts or 0) + 1
        db.commit()
        raise invalid

    record.used = True
    user.password_hash = await run_in_threadpool(get_password_hash, body.new_password)
    db.commit()
    return {"success": True, "message": "Your password has been changed. You can now sign in."}

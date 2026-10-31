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
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.models import User, PasswordResetCode
from app.core.rate_limit import login_limiter, register_limiter, password_reset_limiter
from app.services.email_service import email_service
import os
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


@router.post("/register", response_model=dict, dependencies=[Depends(register_limiter)])
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=get_password_hash(user_data.password),
        location=user_data.location,
        language=user_data.language,
        community_type=user_data.communityType
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": new_user.email})
    
    return {
        "token": access_token,
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "phone": new_user.phone,
            "location": new_user.location,
            "language": new_user.language,
            "communityType": new_user.community_type,
            "profileImage": new_user.profile_image
        }
    }

@router.post("/login", response_model=dict, dependencies=[Depends(login_limiter)])
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Update last login
    user.last_login = datetime.now(timezone.utc)
    db.commit()
    
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "location": user.location,
            "language": user.language,
            "communityType": user.community_type,
            "profileImage": user.profile_image
        }
    }

@router.post("/google-login", response_model=dict)
async def google_login(google_data: GoogleLogin, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Step 1: Verify Google token and send OTP to user's email
    Returns: Success message indicating OTP has been sent
    """
    try:
        # Verify the Google token with audience check using reused request object
        idinfo = id_token.verify_oauth2_token(
            google_data.credential, 
            google_request,
            audience=settings.GOOGLE_CLIENT_ID
        )
        
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
        
    except ValueError as e:
        print(f"❌ Google token verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Google authentication error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google authentication failed: {str(e)}"
        )


@router.post("/verify-google-otp", response_model=dict)
async def verify_google_otp(otp_data: GoogleOTPVerify, db: Session = Depends(get_db)):
    """
    Step 2: Verify OTP and complete Google login
    Returns: Access token and user data
    """
    try:
        # Find user by email
        user = db.query(User).filter(User.email == otp_data.email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found. Please initiate Google login first."
            )
        
        # Check if OTP exists
        if not user.google_otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No OTP found. Please request a new OTP."
            )
        
        # Check if OTP has expired (Safe comparison for SQLite)
        now = datetime.now(timezone.utc)
        expiry = user.google_otp_expiry
        
        # Normalize to UTC aware if naive (SQLite common issue)
        if expiry and expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
            
        if not expiry or expiry < now:
            # Clear expired OTP
            user.google_otp = None
            user.google_otp_expiry = None
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP has expired. Please request a new one."
            )
        
        # Verify OTP
        if user.google_otp != otp_data.otp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid OTP. Please check and try again."
            )
        
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
            "profileImage": user.profile_image
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
            detail=f"OTP verification failed: {str(e)}"
        )


@router.post("/resend-google-otp", response_model=dict)
async def resend_google_otp(email_data: dict, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Resend OTP for Google login
    """
    try:
        email = email_data.get("email")
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required"
            )
        
        # Find user
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
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
        
        return {
            "success": True,
            "message": "New OTP sent to your email"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Resend OTP error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resend OTP: {str(e)}"
        )




# --- Password reset ----------------------------------------------------------
# A 6-digit code is emailed; only its bcrypt hash is stored. Codes expire after
# 15 minutes, allow 5 attempts, and are single-use. The request endpoint always
# returns the same message so it can't be used to find out who has an account.

RESET_CODE_TTL = timedelta(minutes=15)
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
            code_hash=get_password_hash(code),
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

    if not verify_password(body.code, record.code_hash):
        record.attempts = (record.attempts or 0) + 1
        db.commit()
        raise invalid

    record.used = True
    user.password_hash = get_password_hash(body.new_password)
    db.commit()
    return {"success": True, "message": "Your password has been changed. You can now sign in."}

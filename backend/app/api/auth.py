from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.models import User
from app.services.email_service import email_service
import os

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Reuse the request object for better performance (caches Google's certificates)
google_request = requests.Request()

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    location: str
    language: str = "en"
    communityType: str = "general"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

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
    
    class Config:
        from_attributes = True

class GoogleLogin(BaseModel):
    credential: str

class GoogleOTPVerify(BaseModel):
    email: EmailStr
    otp: str


@router.post("/register", response_model=dict)
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

@router.post("/login", response_model=dict)
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
async def google_login(google_data: GoogleLogin, db: Session = Depends(get_db)):
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
        
        print(f"✅ Google token verified for email: {email}")
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by Google"
            )
        
        # Check if user exists, if not create a temporary user record
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Create new user with Google account (not yet verified)
            print(f"📝 Creating new user for: {email}")
            # Use os.urandom for a raw string instead of hex if possible, or just a shorter random string
            # to make hashing slightly faster, though bcrypt handles arbitrary length.
            # More importantly, ensure the DB operation is efficient.
            user = User(
                name=name,
                email=email,
                phone="", 
                password_hash="google_authenticated_user", # Don't need slow bcrypt for oauth-only users
                location="",
                language="en",
                community_type="general",
                profile_image=picture,
                google_email_verified=False
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Generate OTP
        otp = email_service.generate_otp()
        otp_expiry = email_service.get_otp_expiry()
        
        # Store OTP in database
        user.google_otp = otp
        user.google_otp_expiry = otp_expiry
        db.commit()
        
        # INSTANT FIRE-AND-FORGET EMAIL
        # We start the thread BEFORE returning to ensure no delay, 
        # but we don't wait for any API response from Brevo.
        email_service.send_otp(email, otp)
        
        print(f"📧 OTP Dispatch Initiated for {email}")
        
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
        print(f"✅ OTP verified for {user.email}")
        
        # Mark email as verified, clear OTP and update login time
        user.google_email_verified = True
        user.google_otp = None
        user.google_otp_expiry = None
        user.last_login = datetime.now(timezone.utc)
        db.commit()
        db.refresh(user)
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        # Create access token
        access_token = create_access_token(data={"sub": user.email})
        
        print(f"🎉 Google login successful for: {user.email}")
        
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
async def resend_google_otp(email_data: dict, db: Session = Depends(get_db)):
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
        
        # Send OTP email
        email_service.send_otp(email, otp)
        
        print(f"🔄 OTP resent to {email}")
        
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



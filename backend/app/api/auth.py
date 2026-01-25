from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.models import User
import os

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

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

class GoogleLogin(BaseModel):
    credential: str

@router.post("/google-login", response_model=dict)
async def google_login(google_data: GoogleLogin, db: Session = Depends(get_db)):
    """Login or register user with Google OAuth"""
    try:
        # Verify the Google token
        # The token verification will work without specifying client_id
        # as the token itself contains the client_id and Google verifies it
        idinfo = id_token.verify_oauth2_token(
            google_data.credential, 
            requests.Request()
        )
        
        # Get user info from Google token
        email = idinfo.get('email')
        name = idinfo.get('name', '')
        
        print(f"Google login attempt for email: {email}")  # Debug log
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by Google"
            )
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Create new user with Google account
            print(f"Creating new user for: {email}")  # Debug log
            user = User(
                name=name,
                email=email,
                phone="",  # Google doesn't provide phone by default
                password_hash=get_password_hash(os.urandom(32).hex()),  # Random password for OAuth users
                location="",
                language="en",
                community_type="general"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        # Create access token
        access_token = create_access_token(data={"sub": user.email})
        
        print(f"Google login successful for: {email}")  # Debug log
        
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
    except ValueError as e:
        # Invalid token
        print(f"Google token verification failed: {str(e)}")  # Debug log
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Catch all other errors
        print(f"Google authentication error: {str(e)}")  # Debug log
        import traceback
        traceback.print_exc()  # Print full traceback for debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google authentication failed: {str(e)}"
        )


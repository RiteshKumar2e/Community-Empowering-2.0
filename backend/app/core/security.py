import hashlib
import hmac
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash. Returns False (never raises) for
    accounts without a real hash, e.g. Google-only accounts whose
    password_hash is a placeholder."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except (ValueError, TypeError):
        return False

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

# One-time codes (email verification, password reset) are short-lived and
# attempt-limited, so they don't need bcrypt's deliberate slowness: an HMAC
# keyed with SECRET_KEY is just as unreadable from a leaked database and takes
# microseconds instead of ~0.5-2 s per hash on a small server.
_CODE_PREFIX = "hmac$"

def hash_code(code: str) -> str:
    digest = hmac.new(settings.SECRET_KEY.encode(), code.encode(), hashlib.sha256).hexdigest()
    return _CODE_PREFIX + digest

def verify_code(code: str, stored: Optional[str]) -> bool:
    if not stored:
        return False
    if stored.startswith(_CODE_PREFIX):
        return hmac.compare_digest(hash_code(code), stored)
    return verify_password(code, stored)  # codes issued before this change (bcrypt)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

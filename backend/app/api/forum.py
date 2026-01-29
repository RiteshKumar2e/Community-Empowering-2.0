from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import json

from app.core.database import get_db
from app.models.models import ForumCategory, ForumDiscussion, ForumReply, User, ForumLike
from app.api.users import get_current_user, get_current_user_optional

router = APIRouter(prefix="/api/forum", tags=["forum"])

# Pydantic Schemas
class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    icon: Optional[str]
    color: Optional[str]
    discussion_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

class DiscussionCreate(BaseModel):
    title: str
    content: str
    category_id: int
    tags: Optional[List[str]] = []

class LatestReplySchema(BaseModel):
    content: str
    user_name: str
    created_at: datetime

class DiscussionResponse(BaseModel):
    id: int
    title: str
    content: str
    category_id: int
    user_id: int
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    tags: List[str] = []
    views: int
    likes: int
    reply_count: int = 0
    is_featured: bool
    is_pinned: bool
    status: str
    created_at: datetime
    updated_at: Optional[datetime]
    latest_reply: Optional[LatestReplySchema] = None
    is_liked: bool = False

    class Config:
        from_attributes = True

class ReplyCreate(BaseModel):
    content: str

class ReplyResponse(BaseModel):
    id: int
    discussion_id: int
    user_id: int
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    content: str
    likes: int
    is_solution: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class ForumStats(BaseModel):
    total_discussions: int
    total_replies: int
    total_users: int
    total_views: int
    active_discussions: int

# Helper function to check if user is admin
def is_admin(user: User) -> bool:
    return user.is_admin or user.email == "riteshkumar90359@gmail.com"

# Categories Endpoints
@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(
    db: Session = Depends(get_db)
):
    """Get all forum categories"""
    categories = db.query(ForumCategory).all()
    result = []
    for cat in categories:
        discussion_count = db.query(ForumDiscussion).filter(
            ForumDiscussion.category_id == cat.id
        ).count()
        result.append({
            **cat.__dict__,
            "discussion_count": discussion_count
        })
    return result

@router.post("/categories", response_model=CategoryResponse)
async def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new category (Admin only)"""
    if not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create categories"
        )
    
    new_category = ForumCategory(**category.dict())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return {**new_category.__dict__, "discussion_count": 0}

# Discussions Endpoints
@router.get("/discussions", response_model=List[DiscussionResponse])
async def get_discussions(
    category_id: Optional[int] = None,
    tags: Optional[str] = None,
    filter_type: Optional[str] = "all",  # all, latest, popular, unanswered, featured
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get all discussions with optional filtering"""
    query = db.query(ForumDiscussion)
    
    if category_id:
        query = query.filter(ForumDiscussion.category_id == category_id)
    
    if tags:
        tag_list = tags.split(',')
        for t in tag_list:
            query = query.filter(ForumDiscussion.tags.like(f'%"{t}"%'))
    
    if filter_type == "featured":
        query = query.filter(ForumDiscussion.is_featured == True)
    elif filter_type == "unanswered":
        # Get discussions with no replies
        query = query.outerjoin(ForumReply).group_by(ForumDiscussion.id).having(
            func.count(ForumReply.id) == 0
        )
    elif filter_type == "popular":
        query = query.order_by(ForumDiscussion.views.desc())
    else:  # latest
        query = query.order_by(ForumDiscussion.created_at.desc())
    
    discussions = query.offset(skip).limit(limit).all()
    
    result = []
    for disc in discussions:
        user = db.query(User).filter(User.id == disc.user_id).first()
        reply_count = db.query(ForumReply).filter(
            ForumReply.discussion_id == disc.id
        ).count()
        
        tags = []
        if disc.tags:
            try:
                tags = json.loads(disc.tags)
            except:
                tags = []
        
        # Check if current user liked
        is_liked = False
        if current_user:
            is_liked = db.query(ForumLike).filter(
                ForumLike.discussion_id == disc.id,
                ForumLike.user_id == current_user.id
            ).first() is not None
        
        # Fetch latest reply
        latest_reply = db.query(ForumReply).filter(
            ForumReply.discussion_id == disc.id
        ).order_by(ForumReply.created_at.desc()).first()
        
        latest_reply_info = None
        if latest_reply:
            reply_user = db.query(User).filter(User.id == latest_reply.user_id).first()
            latest_reply_info = {
                "content": latest_reply.content,
                "user_name": reply_user.name if reply_user else "Unknown",
                "created_at": latest_reply.created_at
            }
        
        result.append({
            **disc.__dict__,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "",
            "tags": tags,
            "reply_count": reply_count,
            "latest_reply": latest_reply_info,
            "is_liked": is_liked
        })
    
    return result

@router.get("/discussions/{discussion_id}", response_model=DiscussionResponse)
async def get_discussion(
    discussion_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get a specific discussion by ID"""
    discussion = db.query(ForumDiscussion).filter(
        ForumDiscussion.id == discussion_id
    ).first()
    
    if not discussion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Discussion not found"
        )
    
    # Increment view count
    discussion.views += 1
    db.commit()
    
    user = db.query(User).filter(User.id == discussion.user_id).first()
    reply_count = db.query(ForumReply).filter(
        ForumReply.discussion_id == discussion.id
    ).count()
    
    tags = []
    if discussion.tags:
        try:
            tags = json.loads(discussion.tags)
        except:
            tags = []
    
    return {
        **discussion.__dict__,
        "user_name": user.name if user else "Unknown",
        "user_email": user.email if user else "",
        "tags": tags,
        "reply_count": reply_count
    }

@router.post("/discussions", response_model=DiscussionResponse)
async def create_discussion(
    discussion: DiscussionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new discussion"""
    # Check if category exists
    category = db.query(ForumCategory).filter(
        ForumCategory.id == discussion.category_id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    tags_json = json.dumps(discussion.tags) if discussion.tags else "[]"
    
        user_id=current_user.id,
        tags=tags_json
    )
    
    db.add(new_discussion)
    db.commit()
    db.refresh(new_discussion)
    
    # Log activity
    try:
        from app.services.activity_tracker import ActivityTracker
        ActivityTracker.log_forum_post(db, current_user.id, new_discussion.title, new_discussion.id)
    except Exception as e:
        print(f"Error logging forum activity: {str(e)}")
        
    return {
        **new_discussion.__dict__,
        "user_name": current_user.name,
        "user_email": current_user.email,
        "tags": discussion.tags,
        "reply_count": 0,
        "is_liked": False
    }

# Replies Endpoints
@router.get("/discussions/{discussion_id}/replies", response_model=List[ReplyResponse])
async def get_replies(
    discussion_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get all replies for a discussion"""
    replies = db.query(ForumReply).filter(
        ForumReply.discussion_id == discussion_id
    ).order_by(ForumReply.created_at.asc()).all()
    
    result = []
    for reply in replies:
        user = db.query(User).filter(User.id == reply.user_id).first()
        result.append({
            **reply.__dict__,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else ""
        })
    
    return result

@router.post("/discussions/{discussion_id}/replies", response_model=ReplyResponse)
async def create_reply(
    discussion_id: int,
    reply: ReplyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new reply to a discussion"""
    # Check if discussion exists
    discussion = db.query(ForumDiscussion).filter(
        ForumDiscussion.id == discussion_id
    ).first()
    
    if not discussion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Discussion not found"
        )
    
    new_reply = ForumReply(
        discussion_id=discussion_id,
        user_id=current_user.id,
        content=reply.content
    )
    
    db.add(new_reply)
    db.commit()
    db.refresh(new_reply)
    
    return {
        **new_reply.__dict__,
        "user_name": current_user.name,
        "user_email": current_user.email
    }

# Admin Stats Endpoint
@router.get("/stats", response_model=ForumStats)
async def get_forum_stats(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get forum statistics (Admin only sees full stats, users see limited)"""
    total_discussions = db.query(ForumDiscussion).count()
    total_replies = db.query(ForumReply).count()
    active_discussions = db.query(ForumDiscussion).filter(
        ForumDiscussion.status == "active"
    ).count()
    total_views = db.query(func.sum(ForumDiscussion.views)).scalar() or 0
    
    stats = {
        "total_discussions": total_discussions,
        "total_replies": total_replies,
        "active_discussions": active_discussions,
        "total_views": total_views,
        "total_users": 0  # Default for non-admin
    }
    
    # Only admins can see total user count
    if current_user and is_admin(current_user):
        total_users = db.query(User).count()
        stats["total_users"] = total_users
    
    return stats

# Like/Unlike Discussion
@router.post("/discussions/{discussion_id}/like")
async def like_discussion(
    discussion_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Like a discussion"""
    discussion = db.query(ForumDiscussion).filter(
        ForumDiscussion.id == discussion_id
    ).first()
    
    if not discussion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Discussion not found"
        )
    
    # Check if user already liked
    existing_like = db.query(ForumLike).filter(
        ForumLike.discussion_id == discussion_id,
        ForumLike.user_id == current_user.id
    ).first()
    
    if existing_like:
        # Unlike
        db.delete(existing_like)
        discussion.likes = max(0, discussion.likes - 1)
        db.commit()
        return {"message": "Discussion unliked", "likes": discussion.likes, "is_liked": False}
    else:
        # Like
        new_like = ForumLike(discussion_id=discussion_id, user_id=current_user.id)
        db.add(new_like)
        discussion.likes += 1
        db.commit()
        return {"message": "Discussion liked", "likes": discussion.likes, "is_liked": True}

# Like/Unlike Reply
@router.post("/replies/{reply_id}/like")
async def like_reply(
    reply_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Like a reply"""
    reply = db.query(ForumReply).filter(ForumReply.id == reply_id).first()
    
    if not reply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reply not found"
        )
    
    reply.likes += 1
    db.commit()
    
    return {"message": "Reply liked", "likes": reply.likes}

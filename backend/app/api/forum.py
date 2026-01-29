from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import json

from app.core.database import get_db
from app.models.models import ForumCategory, ForumDiscussion, ForumReply, User, ForumLike, ForumView, ForumReplyLike, ForumReplyView
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
    views: int = 0
    is_solution: bool
    is_liked: bool = False
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

class ContributorResponse(BaseModel):
    user_id: int
    name: str
    points: int

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
            "id": disc.id,
            "title": disc.title,
            "content": disc.content,
            "category_id": disc.category_id,
            "user_id": disc.user_id,
            "views": disc.views,
            "likes": disc.likes,
            "is_featured": disc.is_featured,
            "is_pinned": disc.is_pinned,
            "status": disc.status,
            "created_at": disc.created_at,
            "updated_at": disc.updated_at,
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
    
    # Increment view count (Unique for logged-in users)
    if current_user:
        # Check if user already viewed
        existing_view = db.query(ForumView).filter(
            ForumView.discussion_id == discussion_id,
            ForumView.user_id == current_user.id
        ).first()
        
        if not existing_view:
            # Add view record
            new_view = ForumView(discussion_id=discussion_id, user_id=current_user.id)
            db.add(new_view)
            
            # Increment discussion view count
            discussion.views += 1
            db.commit()
    else:
        # For guests, we can blindly increment or choose not to. 
        # Requirement says "ek user ka ek he view count". 
        # To avoid inflation, let's NOT increment for guests, or increment blindly? 
        # Standard practice: Increment blindly for guests (cookies are better but harder).
        # But "one user one view" implies strictness. 
        # I will Increment for guests to keep traffic visible, but logged in is unique.
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

    is_liked = False
    if current_user:
        is_liked = db.query(ForumLike).filter(
            ForumLike.discussion_id == discussion_id,
            ForumLike.user_id == current_user.id
        ).first() is not None
    
    return {
        "id": discussion.id,
        "title": discussion.title,
        "content": discussion.content,
        "category_id": discussion.category_id,
        "user_id": discussion.user_id,
        "views": discussion.views,
        "likes": discussion.likes,
        "is_featured": discussion.is_featured,
        "is_pinned": discussion.is_pinned,
        "status": discussion.status,
        "created_at": discussion.created_at,
        "updated_at": discussion.updated_at,
        "user_name": user.name if user else "Unknown",
        "user_email": user.email if user else "",
        "tags": tags,
        "reply_count": reply_count,
        "is_liked": is_liked if current_user else False
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
    
    new_discussion = ForumDiscussion(
        title=discussion.title,
        content=discussion.content,
        category_id=discussion.category_id,
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
        "id": new_discussion.id,
        "title": new_discussion.title,
        "content": new_discussion.content,
        "category_id": new_discussion.category_id,
        "user_id": new_discussion.user_id,
        "views": new_discussion.views,
        "likes": new_discussion.likes,
        "is_featured": new_discussion.is_featured,
        "is_pinned": new_discussion.is_pinned,
        "status": new_discussion.status,
        "created_at": new_discussion.created_at,
        "updated_at": new_discussion.updated_at,
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
        
        # Track view for logged-in users (one user one view)
        if current_user:
            existing_view = db.query(ForumReplyView).filter(
                ForumReplyView.reply_id == reply.id,
                ForumReplyView.user_id == current_user.id
            ).first()
            
            if not existing_view:
                new_view = ForumReplyView(reply_id=reply.id, user_id=current_user.id)
                db.add(new_view)
                reply.views += 1
                db.commit()
        
        # Check if current user liked this reply
        is_liked = False
        if current_user:
            is_liked = db.query(ForumReplyLike).filter(
                ForumReplyLike.reply_id == reply.id,
                ForumReplyLike.user_id == current_user.id
            ).first() is not None
        
        result.append({
            "id": reply.id,
            "discussion_id": reply.discussion_id,
            "user_id": reply.user_id,
            "content": reply.content,
            "likes": reply.likes,
            "views": reply.views,
            "is_solution": reply.is_solution,
            "created_at": reply.created_at,
            "updated_at": reply.updated_at,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "",
            "is_liked": is_liked
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
        "id": new_reply.id,
        "discussion_id": new_reply.discussion_id,
        "user_id": new_reply.user_id,
        "content": new_reply.content,
        "likes": new_reply.likes,
        "views": new_reply.views,
        "is_solution": new_reply.is_solution,
        "created_at": new_reply.created_at,
        "updated_at": new_reply.updated_at,
        "user_name": current_user.name,
        "user_email": current_user.email,
        "is_liked": False
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

@router.get("/top-contributors", response_model=List[ContributorResponse])
async def get_top_contributors(db: Session = Depends(get_db)):
    """Get top 3 contributors based on activity and likes received"""
    users = db.query(User).all()
    results = []
    
    for user in users:
        # Points: Discussion (10), Reply (5), Like Received (2)
        disc_count = db.query(ForumDiscussion).filter(ForumDiscussion.user_id == user.id).count()
        reply_count = db.query(ForumReply).filter(ForumReply.user_id == user.id).count()
        
        # Likes received on discussions
        disc_likes = db.query(func.sum(ForumDiscussion.likes)).filter(ForumDiscussion.user_id == user.id).scalar() or 0
        # Likes received on replies
        reply_likes = db.query(func.sum(ForumReply.likes)).filter(ForumReply.user_id == user.id).scalar() or 0
        
        points = (disc_count * 10) + (reply_count * 5) + ((disc_likes + reply_likes) * 2)
        
        if points > 0:
            results.append({
                "user_id": user.id,
                "name": user.name,
                "points": points
            })
            
    # Sort by points desc and take top 3
    results.sort(key=lambda x: x["points"], reverse=True)
    return results[:3]

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
    """Like/Unlike a reply"""
    reply = db.query(ForumReply).filter(ForumReply.id == reply_id).first()
    
    if not reply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reply not found"
        )
    
    # Check if user already liked
    existing_like = db.query(ForumReplyLike).filter(
        ForumReplyLike.reply_id == reply_id,
        ForumReplyLike.user_id == current_user.id
    ).first()
    
    if existing_like:
        # Unlike
        db.delete(existing_like)
        reply.likes = max(0, reply.likes - 1)
        db.commit()
        return {"message": "Reply unliked", "likes": reply.likes, "is_liked": False}
    else:
        # Like
        new_like = ForumReplyLike(reply_id=reply_id, user_id=current_user.id)
        db.add(new_like)
        reply.likes += 1
        db.commit()
        return {"message": "Reply liked", "likes": reply.likes, "is_liked": True}

@router.post("/replies/{reply_id}/pin")
async def pin_reply(
    reply_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a reply as solution (pinned)"""
    reply = db.query(ForumReply).filter(ForumReply.id == reply_id).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
        
    discussion = db.query(ForumDiscussion).filter(ForumDiscussion.id == reply.discussion_id).first()
    
    # Authorized if admin or discussion author
    if not (is_admin(current_user) or discussion.user_id == current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to pin this reply")
        
    # Toggle solution status
    reply.is_solution = not reply.is_solution
    
    # Optional: If you only want ONE pinned reply per discussion, unpin others
    if reply.is_solution:
        db.query(ForumReply).filter(
            ForumReply.discussion_id == discussion.id,
            ForumReply.id != reply_id
        ).update({"is_solution": False})
        
    db.commit()
    return {"message": "Reply pin status updated", "is_pinned": reply.is_solution}


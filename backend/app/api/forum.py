from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
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

    model_config = ConfigDict(from_attributes=True)

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

    model_config = ConfigDict(from_attributes=True)

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

    model_config = ConfigDict(from_attributes=True)

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
    """Get all forum categories with discussion counts in one go"""
    # Optimized query using group_by to avoid N+1
    counts = db.query(
        ForumDiscussion.category_id, 
        func.count(ForumDiscussion.id).label('count')
    ).group_by(ForumDiscussion.category_id).all()
    
    count_map = {c_id: count for c_id, count in counts}
    categories = db.query(ForumCategory).all()
    
    result = []
    for cat in categories:
        result.append({
            "id": cat.id,
            "name": cat.name,
            "description": cat.description,
            "icon": cat.icon,
            "color": cat.color,
            "created_at": cat.created_at,
            "discussion_count": count_map.get(cat.id, 0)
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

@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a category and all its contents (Admin only)"""
    if not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete categories"
        )
    
    category = db.query(ForumCategory).filter(ForumCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Cascade delete discussions and replies
    discussions = db.query(ForumDiscussion).filter(ForumDiscussion.category_id == category_id).all()
    disc_ids = [d.id for d in discussions]
    
    # 1. Delete reply likes/views for these discussions
    if disc_ids:
        # Get reply IDs
        reply_ids = [r.id for r in db.query(ForumReply.id).filter(ForumReply.discussion_id.in_(disc_ids)).all()]
        if reply_ids:
            db.query(ForumReplyLike).filter(ForumReplyLike.reply_id.in_(reply_ids)).delete(synchronize_session=False)
            db.query(ForumReplyView).filter(ForumReplyView.reply_id.in_(reply_ids)).delete(synchronize_session=False)
            db.query(ForumReply).filter(ForumReply.discussion_id.in_(disc_ids)).delete(synchronize_session=False)

        # 2. Delete discussion likes/views
        db.query(ForumLike).filter(ForumLike.discussion_id.in_(disc_ids)).delete(synchronize_session=False)
        db.query(ForumView).filter(ForumView.discussion_id.in_(disc_ids)).delete(synchronize_session=False)
        
        # 3. Delete discussions
        db.query(ForumDiscussion).filter(ForumDiscussion.category_id == category_id).delete(synchronize_session=False)

    # 4. Finally delete the category
    db.delete(category)
    db.commit()
    
    return {"message": f"Category '{category.name}' and all its content deleted successfully"}

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
    """Optimized discussions fetch using batching and joinedload"""
    from sqlalchemy.orm import joinedload
    
    # Use joinedload to get user info in the same query
    query = db.query(ForumDiscussion).options(joinedload(ForumDiscussion.user))
    
    if category_id:
        query = query.filter(ForumDiscussion.category_id == category_id)
    
    if tags:
        tag_list = tags.split(',')
        for t in tag_list:
            query = query.filter(ForumDiscussion.tags.like(f'%"{t}"%'))
    
    if filter_type == "featured":
        query = query.filter(ForumDiscussion.is_featured == True)
    elif filter_type == "unanswered":
        query = query.outerjoin(ForumReply).group_by(ForumDiscussion.id).having(
            func.count(ForumReply.id) == 0
        )
    elif filter_type == "popular":
        query = query.order_by(ForumDiscussion.views.desc())
    else:  # latest
        query = query.order_by(ForumDiscussion.created_at.desc())
    
    discussions = query.offset(skip).limit(limit).all()
    
    if not discussions:
        return []

    disc_ids = [d.id for d in discussions]
    
    # Batch fetch reply counts
    reply_counts = db.query(
        ForumReply.discussion_id, 
        func.count(ForumReply.id).label('count')
    ).filter(ForumReply.discussion_id.in_(disc_ids)).group_by(ForumReply.discussion_id).all()
    reply_count_map = {d_id: count for d_id, count in reply_counts}
    
    # Batch fetch likes status
    liked_ids = set()
    if current_user:
        likes = db.query(ForumLike.discussion_id).filter(
            ForumLike.discussion_id.in_(disc_ids),
            ForumLike.user_id == current_user.id
        ).all()
        liked_ids = {l.discussion_id for l in likes}
        
    # Batch fetch latest replies in ONE query
    subq = db.query(
        ForumReply.discussion_id,
        func.max(ForumReply.created_at).label('max_created')
    ).filter(ForumReply.discussion_id.in_(disc_ids)).group_by(ForumReply.discussion_id).subquery()
    
    latest_replies = db.query(ForumReply).join(
        subq, (ForumReply.discussion_id == subq.c.discussion_id) & (ForumReply.created_at == subq.c.max_created)
    ).options(joinedload(ForumReply.user)).all()
    latest_reply_map = {r.discussion_id: r for r in latest_replies}

    result = []
    for disc in discussions:
        tag_list = []
        if disc.tags:
            try: tag_list = json.loads(disc.tags)
            except: tag_list = []
        
        reply = latest_reply_map.get(disc.id)
        latest_info = None
        if reply:
            latest_info = {
                "content": reply.content,
                "user_name": reply.user.name if reply.user else "Unknown",
                "created_at": reply.created_at
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
            "user_name": disc.user.name if disc.user else "Unknown",
            "user_email": disc.user.email if disc.user else "",
            "tags": tag_list,
            "reply_count": reply_count_map.get(disc.id, 0),
            "latest_reply": latest_info,
            "is_liked": disc.id in liked_ids
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
    """Get top 3 contributors using high-performance SQL aggregation"""
    # Points: Discussion (10), Reply (5), Like Received (2)
    
    # Discussions points
    disc_p = db.query(
        ForumDiscussion.user_id.label('u_id'),
        (func.count(ForumDiscussion.id) * 10).label('pts')
    ).group_by(ForumDiscussion.user_id).subquery()
     
    # Replies points
    reply_p = db.query(
        ForumReply.user_id.label('u_id'),
        (func.count(ForumReply.id) * 5).label('pts')
    ).group_by(ForumReply.user_id).subquery()

    # Likes received subqueries
    disc_l = db.query(
        ForumDiscussion.user_id.label('u_id'),
        (func.sum(ForumDiscussion.likes) * 2).label('pts')
    ).group_by(ForumDiscussion.user_id).subquery()
    
    reply_l = db.query(
        ForumReply.user_id.label('u_id'),
        (func.sum(ForumReply.likes) * 2).label('pts')
    ).group_by(ForumReply.user_id).subquery()

    # Get maps of users who have points
    d_map = dict(db.query(disc_p.c.u_id, disc_p.c.pts).all())
    r_map = dict(db.query(reply_p.c.u_id, reply_p.c.pts).all())
    dl_map = dict(db.query(disc_l.c.u_id, disc_l.c.pts).all())
    rl_map = dict(db.query(reply_l.c.u_id, reply_l.c.pts).all())

    # Get set of all user IDs who have any points to avoid looping over all users
    active_uids = set(d_map.keys()) | set(r_map.keys()) | set(dl_map.keys()) | set(rl_map.keys())
    
    if not active_uids:
        return []
        
    # Only fetch names for active users
    active_users = db.query(User.id, User.name).filter(User.id.in_(active_uids)).all()

    results = []
    for u_id, name in active_users:
        total = d_map.get(u_id, 0) + r_map.get(u_id, 0) + int(dl_map.get(u_id, 0) or 0) + int(rl_map.get(u_id, 0) or 0)
        results.append({"user_id": u_id, "name": name, "points": total})
            
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


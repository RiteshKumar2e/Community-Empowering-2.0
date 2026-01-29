from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    location = Column(String)
    language = Column(String, default="en")
    community_type = Column(String, default="general")
    profile_image = Column(String)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # OTP fields for Google OAuth verification
    google_otp = Column(String, nullable=True)
    google_otp_expiry = Column(DateTime(timezone=True), nullable=True)
    google_email_verified = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), index=True)
    
    # Relationships
    queries = relationship("Query", back_populates="user")
    enrollments = relationship("Enrollment", back_populates="user")

class Resource(Base):
    __tablename__ = "resources"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String, nullable=False)  # education, health, finance, etc.
    eligibility = Column(Text)
    provider = Column(String)
    link = Column(String)
    is_new = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), index=True)

class LearningPlatform(Base):
    __tablename__ = "learning_platforms"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String) # digital, professional, etc.
    provider = Column(String)
    duration = Column(String)
    students = Column(String)
    level = Column(String)
    link = Column(String)
    features = Column(Text) # JSON string of features
    is_official = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    level = Column(String, default="beginner")  # beginner, intermediate, advanced
    duration = Column(String)
    lessons = Column(Integer, default=0)
    thumbnail = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    enrollments = relationship("Enrollment", back_populates="course")

class Enrollment(Base):
    __tablename__ = "enrollments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    progress = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

class Query(Base):
    __tablename__ = "queries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text, nullable=False)
    response = Column(Text)
    language = Column(String, default="en")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="queries")

class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer)
    comment = Column(Text)
    category = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserActivity(Base):
    __tablename__ = "user_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    activity_type = Column(String, nullable=False)  # 'course_enroll', 'resource_view', 'ai_query', 'platform_visit'
    activity_title = Column(String)
    activity_description = Column(Text)
    extra_data = Column(Text)  # JSON string for additional data (renamed from metadata)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

class ForumCategory(Base):
    __tablename__ = "forum_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    icon = Column(String)  # Icon name or emoji
    color = Column(String)  # Color code for the category
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    discussions = relationship("ForumDiscussion", back_populates="category")

class ForumDiscussion(Base):
    __tablename__ = "forum_discussions"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("forum_categories.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    tags = Column(Text)  # JSON string of tags
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    is_pinned = Column(Boolean, default=False)
    status = Column(String, default="active")  # active, closed, archived
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), index=True)
    
    # Relationships
    category = relationship("ForumCategory", back_populates="discussions")
    replies = relationship("ForumReply", back_populates="discussion")
    user = relationship("User")

class ForumReply(Base):
    __tablename__ = "forum_replies"
    
    id = Column(Integer, primary_key=True, index=True)
    discussion_id = Column(Integer, ForeignKey("forum_discussions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    likes = Column(Integer, default=0)
    views = Column(Integer, default=0)
    is_solution = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), index=True)
    
    # Relationships
    discussion = relationship("ForumDiscussion", back_populates="replies")
    user = relationship("User")

class ForumLike(Base):
    __tablename__ = "forum_likes"
    
    id = Column(Integer, primary_key=True, index=True)
    discussion_id = Column(Integer, ForeignKey("forum_discussions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ForumView(Base):
    __tablename__ = "forum_views"
    
    id = Column(Integer, primary_key=True, index=True)
    discussion_id = Column(Integer, ForeignKey("forum_discussions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ForumReplyLike(Base):
    __tablename__ = "forum_reply_likes"
    
    id = Column(Integer, primary_key=True, index=True)
    reply_id = Column(Integer, ForeignKey("forum_replies.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ForumReplyView(Base):
    __tablename__ = "forum_reply_views"
    
    id = Column(Integer, primary_key=True, index=True)
    reply_id = Column(Integer, ForeignKey("forum_replies.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Null for public
    message = Column(Text, nullable=False)
    is_private = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Optional relationships for easier querying
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])


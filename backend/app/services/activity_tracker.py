from sqlalchemy.orm import Session
from app.models.models import UserActivity
from datetime import datetime
import json

class ActivityTracker:
    """Service to track user activities across the platform"""
    
    @staticmethod
    def log_activity(
        db: Session,
        user_id: int,
        activity_type: str,
        activity_title: str,
        activity_description: str,
        extra_data: dict = None
    ):
        """
        Log a user activity
        
        Args:
            db: Database session
            user_id: ID of the user
            activity_type: Type of activity ('course_enroll', 'resource_view', 'ai_query', 'platform_visit')
            activity_title: Title of the activity
            activity_description: Description of the activity
            extra_data: Additional metadata as dictionary
        """
        try:
            activity = UserActivity(
                user_id=user_id,
                activity_type=activity_type,
                activity_title=activity_title,
                activity_description=activity_description,
                extra_data=json.dumps(extra_data) if extra_data else None
            )
            db.add(activity)
            db.commit()
            return True
        except Exception as e:
            print(f"Error logging activity: {str(e)}")
            db.rollback()
            return False
    
    @staticmethod
    def log_course_enrollment(db: Session, user_id: int, course_title: str, platform: str = None):
        """Log when user enrolls in a course"""
        return ActivityTracker.log_activity(
            db=db,
            user_id=user_id,
            activity_type='course_enroll',
            activity_title=course_title,
            activity_description=f"Enrolled in course: {course_title}",
            extra_data={'platform': platform} if platform else None
        )
    
    @staticmethod
    def log_resource_view(db: Session, user_id: int, resource_title: str, category: str = None):
        """Log when user views a resource"""
        return ActivityTracker.log_activity(
            db=db,
            user_id=user_id,
            activity_type='resource_view',
            activity_title=resource_title,
            activity_description=f"Viewed resource: {resource_title}",
            extra_data={'category': category} if category else None
        )
    
    @staticmethod
    def log_ai_query(db: Session, user_id: int, query_text: str, language: str = 'en'):
        """Log when user asks AI assistant"""
        # Truncate query for description
        truncated = query_text[:50] + '...' if len(query_text) > 50 else query_text
        return ActivityTracker.log_activity(
            db=db,
            user_id=user_id,
            activity_type='ai_query',
            activity_title='AI Query',
            activity_description=f"Asked AI: {truncated}",
            extra_data={'language': language, 'full_query': query_text}
        )
    
    @staticmethod
    def log_platform_visit(db: Session, user_id: int, platform_name: str, platform_url: str = None):
        """Log when user visits a learning platform"""
        return ActivityTracker.log_activity(
            db=db,
            user_id=user_id,
            activity_type='platform_visit',
            activity_title=platform_name,
            activity_description=f"Visited learning platform: {platform_name}",
            extra_data={'url': platform_url} if platform_url else None
        )

    @staticmethod
    def log_forum_post(db: Session, user_id: int, discussion_title: str, discussion_id: int):
        """Log when user creates a forum discussion"""
        return ActivityTracker.log_activity(
            db=db,
            user_id=user_id,
            activity_type='forum_post',
            activity_title=discussion_title,
            activity_description=f"Posted discussion: {discussion_title}",
            extra_data={'discussion_id': discussion_id}
        )

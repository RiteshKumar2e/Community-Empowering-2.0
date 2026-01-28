import sys
import os
from datetime import datetime
import json

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.models import Base, ForumCategory, ForumDiscussion, ForumReply, User

def seed_forum_data():
    """Seed the database with initial forum data"""
    db = SessionLocal()
    
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        
        print("Clearing existing forum data for fresh re-seed...")
        db.query(ForumReply).delete()
        db.query(ForumDiscussion).delete()
        db.query(ForumCategory).delete()
        db.commit()
        
        print("Seeding forum data...")
        
        # Create categories related to the website/platform
        categories = [
            {
                "name": "Platform News",
                "description": "Official updates and announcements about Community Empowering",
                "icon": "📢",
                "color": "#3b82f6"
            },
            {
                "name": "Learning Hub",
                "description": "Discuss courses, tutorials, and educational resources",
                "icon": "📚",
                "color": "#8b5cf6"
            },
            {
                "name": "Technical Support",
                "description": "Get help with website features and technical issues",
                "icon": "🛠️",
                "color": "#10b981"
            },
            {
                "name": "Community Hub",
                "description": "Connect with fellow community members and discuss general topics",
                "icon": "🤝",
                "color": "#f59e0b"
            },
            {
                "name": "Success Stories",
                "description": "Share your achievements and how the platform helped you",
                "icon": "✨",
                "color": "#ef4444"
            },
            {
                "name": "Feature Requests",
                "description": "Suggest new features and improvements for the platform",
                "icon": "💡",
                "color": "#6366f1"
            }
        ]
        
        created_categories = []
        for cat_data in categories:
            category = ForumCategory(**cat_data)
            db.add(category)
            created_categories.append(category)
        
        db.commit()
        print(f"✅ Created {len(created_categories)} categories")
        
        # Get admin user (or first user)
        admin_user = db.query(User).filter(
            User.email == "riteshkumar90359@gmail.com"
        ).first()
        
        if not admin_user:
            admin_user = db.query(User).first()
        
        if admin_user:
            # Create sample discussions
            discussions = [
                {
                    "title": "Welcome to Community Empowering 2.0!",
                    "content": "We are excited to launch our improved community forum. Here you can connect with experts and fellow learners from around the world.",
                    "category_id": created_categories[0].id,
                    "user_id": admin_user.id,
                    "tags": json.dumps(["Welcome", "Announcement", "Community"]),
                    "views": 150,
                    "likes": 45,
                    "is_featured": True
                },
                {
                    "title": "How to make the most of the AI Assistant?",
                    "content": "I've been using the new AI assistant for my coding projects and it's amazing. What are some of your favorite prompts?",
                    "category_id": created_categories[1].id,
                    "user_id": admin_user.id,
                    "tags": json.dumps(["AI Assistant", "Learning", "Tips"]),
                    "views": 85,
                    "likes": 20,
                    "is_featured": False
                },
                {
                    "title": "Bug Report: Profile picture not updating",
                    "content": "I tried changing my profile picture several times but it keeps showing the old one. Is anyone else facing this?",
                    "category_id": created_categories[2].id,
                    "user_id": admin_user.id,
                    "tags": json.dumps(["Bug", "Technical Support", "Profile"]),
                    "views": 32,
                    "likes": 5,
                    "is_featured": False
                }
            ]
            
            for disc_data in discussions:
                discussion = ForumDiscussion(**disc_data)
                db.add(discussion)
            
            db.commit()
            print(f"✅ Created {len(discussions)} sample discussions")
        else:
            print("⚠️  No users found. Skipping sample discussions.")
        
        print("✅ Forum seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding forum data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_forum_data()

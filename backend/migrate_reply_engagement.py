"""
Migration script to add reply likes and views tracking
Run this script to update the database schema
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("Error: DATABASE_URL not found in environment variables")
    exit(1)

engine = create_engine(DATABASE_URL)

migrations = [
    # Add views column to forum_replies
    """
    ALTER TABLE forum_replies 
    ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
    """,
    
    # Create forum_reply_likes table
    """
    CREATE TABLE IF NOT EXISTS forum_reply_likes (
        id SERIAL PRIMARY KEY,
        reply_id INTEGER REFERENCES forum_replies(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(reply_id, user_id)
    );
    """,
    
    # Create forum_reply_views table
    """
    CREATE TABLE IF NOT EXISTS forum_reply_views (
        id SERIAL PRIMARY KEY,
        reply_id INTEGER REFERENCES forum_replies(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(reply_id, user_id)
    );
    """,
    
    # Create indexes for better performance
    """
    CREATE INDEX IF NOT EXISTS idx_forum_reply_likes_reply_id 
    ON forum_reply_likes(reply_id);
    """,
    
    """
    CREATE INDEX IF NOT EXISTS idx_forum_reply_likes_user_id 
    ON forum_reply_likes(user_id);
    """,
    
    """
    CREATE INDEX IF NOT EXISTS idx_forum_reply_views_reply_id 
    ON forum_reply_views(reply_id);
    """,
    
    """
    CREATE INDEX IF NOT EXISTS idx_forum_reply_views_user_id 
    ON forum_reply_views(user_id);
    """
]

def run_migrations():
    print("Starting database migrations...")
    
    with engine.connect() as conn:
        for i, migration in enumerate(migrations, 1):
            try:
                print(f"\nRunning migration {i}/{len(migrations)}...")
                conn.execute(text(migration))
                conn.commit()
                print(f"✓ Migration {i} completed successfully")
            except Exception as e:
                print(f"✗ Migration {i} failed: {str(e)}")
                conn.rollback()
    
    print("\n✓ All migrations completed!")

if __name__ == "__main__":
    run_migrations()

"""
Database migration script to add OTP fields for Google OAuth verification
Run this script to update your existing database with new columns
"""

from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

def migrate_database():
    """Add OTP-related columns to users table"""
    
    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL", "sqlite:///./community_ai.db")
    
    # Create engine
    engine = create_engine(database_url)
    
    print("[*] Starting database migration...")
    print(f"[*] Database: {database_url}")
    
    try:
        with engine.connect() as conn:
            # Check if columns already exist
            result = conn.execute(text("PRAGMA table_info(users)"))
            existing_columns = [row[1] for row in result.fetchall()]
            
            migrations = []
            
            # Add google_otp column if it doesn't exist
            if 'google_otp' not in existing_columns:
                migrations.append("ALTER TABLE users ADD COLUMN google_otp VARCHAR")
                print("  [+] Adding column: google_otp")
            else:
                print("  [OK] Column already exists: google_otp")
            
            # Add google_otp_expiry column if it doesn't exist
            if 'google_otp_expiry' not in existing_columns:
                migrations.append("ALTER TABLE users ADD COLUMN google_otp_expiry TIMESTAMP")
                print("  [+] Adding column: google_otp_expiry")
            else:
                print("  [OK] Column already exists: google_otp_expiry")
            
            # Add google_email_verified column if it doesn't exist
            if 'google_email_verified' not in existing_columns:
                migrations.append("ALTER TABLE users ADD COLUMN google_email_verified BOOLEAN DEFAULT 0")
                print("  [+] Adding column: google_email_verified")
            else:
                print("  [OK] Column already exists: google_email_verified")
            
            # Execute migrations
            if migrations:
                for migration_sql in migrations:
                    conn.execute(text(migration_sql))
                conn.commit()
                print(f"\n[SUCCESS] Migration completed! Added {len(migrations)} column(s).")
            else:
                print("\n[SUCCESS] Database is already up to date. No migrations needed.")
                
    except Exception as e:
        print(f"\n[ERROR] Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    print("\n" + "="*60)
    print("  DATABASE MIGRATION: Google OAuth OTP Fields")
    print("="*60 + "\n")
    
    success = migrate_database()
    
    if success:
        print("\n" + "="*60)
        print("  [SUCCESS] Migration completed successfully!")
        print("="*60 + "\n")
    else:
        print("\n" + "="*60)
        print("  [ERROR] Migration failed. Please check the errors above.")
        print("="*60 + "\n")


"""
Database migration script to add OTP fields for Google OAuth verification
Run this script to update your existing database with new columns
"""

from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

# Load environment variables
# Import correct engine from app core to ensure Turso compatibility
from app.core.database import engine

def migrate_database():
    """Add OTP-related columns to users table"""
    
    print("[*] Starting database migration...")
    
    try:
        with engine.connect() as conn:
            print("  [*] Checking/Adding columns to users table...")
            
            # Use try-except for each ALTER TABLE to make it idempotent
            # since Turso/SQLite doesn't support IF NOT EXISTS in ALTER TABLE.
            columns = [
                ("google_otp", "TEXT"),
                ("google_otp_expiry", "TEXT"), 
                ("google_email_verified", "BOOLEAN DEFAULT 0")
            ]
            
            for col_name, col_type in columns:
                try:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                    print(f"  [+] Added column: {col_name}")
                except Exception as e:
                    err = str(e).lower()
                    if "duplicate column name" in err or "already exists" in err:
                        print(f"  [OK] Column already exists: {col_name}")
                    else:
                        print(f"  [!] Warning on {col_name}: {e}")
            
            conn.commit()
            print("\n[SUCCESS] Migration check completed.")
                
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


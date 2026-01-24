import sqlite3
import os

db_path = "backend/community_ai.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Add columns to users table
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0")
        print("Column 'is_admin' added successfully.")
    except sqlite3.OperationalError:
        print("Column 'is_admin' already exists.")

    # Create learning_platforms table
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS learning_platforms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                category TEXT,
                provider TEXT,
                duration TEXT,
                students TEXT,
                level TEXT,
                link TEXT,
                features TEXT,
                is_official BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("Table 'learning_platforms' created successfully.")
    except sqlite3.OperationalError as e:
        print(f"Error creating learning_platforms table: {e}")

    # Fix resources table columns if needed (provider instead of location/deadline)
    try:
        cursor.execute("ALTER TABLE resources ADD COLUMN provider TEXT")
        print("Column 'provider' added to resources successfully.")
    except sqlite3.OperationalError:
        print("Column 'provider' already exists in resources.")

    conn.commit()
    conn.close()
else:
    print(f"Database {db_path} not found.")

import sqlite3
import os
import json

db_path = "backend/community_ai.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Admin user setup
    cursor.execute("UPDATE users SET is_admin = 1 WHERE email = 'riteshkumar90359@gmail.com'")
    print("Admin status updated for Ritesh.")

    # Seed Resources (Just a sample for brevity, in real case we would scrape or use the list)
    # Since I don't have the full lists here in a clean format easily, I'll just add a few.
    # Actually, I should probably fetch them from the JSX files if possible or just provide the tool.
    
    conn.commit()
    conn.close()
else:
    print(f"Database {db_path} not found.")

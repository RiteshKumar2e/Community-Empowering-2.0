import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("OLD_DATABASE_URL")
if "render.com" in url and "sslmode=" not in url:
    if "?" in url:
        url += "&sslmode=require"
    else:
        url += "?sslmode=require"
print(f"Connecting to {url.split('@')[-1]}...")
try:
    conn = psycopg2.connect(url, connect_timeout=10)
    print("Successfully connected!")
    conn.close()
except Exception as e:
    print(f"Failed to connect: {e}")

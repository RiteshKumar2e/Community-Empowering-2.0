from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# SQLite needs check_same_thread=False for FastAPI
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Handle engine configuration for different databases
engine_args = {"connect_args": connect_args}

# If using PostgreSQL, optimize connection pooling
if not settings.DATABASE_URL.startswith("sqlite"):
    engine_args.update({
        "pool_size": 20,           # Increase base pool from 5 to 20
        "max_overflow": 40,        # Allow up to 60 total connections
        "pool_timeout": 30,        # Wait up to 30s
        "pool_recycle": 1800,      # Recycle connections every 30m
        "pool_pre_ping": True      # Check if connection is alive before using
    })

engine = create_engine(settings.DATABASE_URL, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

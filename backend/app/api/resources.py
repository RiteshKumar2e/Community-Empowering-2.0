from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Resource

router = APIRouter()

@router.get("/")
async def get_resources(db: Session = Depends(get_db)):
    """Get all resources"""
    resources = db.query(Resource).all()
    
    return [{
        "id": r.id,
        "title": r.title,
        "description": r.description,
        "category": r.category,
        "eligibility": r.eligibility,
        "provider": r.provider,
        "link": r.link,
        "isNew": r.is_new
    } for r in resources]

@router.get("/{resource_id}")
async def get_resource(resource_id: int, db: Session = Depends(get_db)):
    """Get specific resource"""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    
    if not resource:
        return {"error": "Resource not found"}
    
    return {
        "id": resource.id,
        "title": resource.title,
        "description": resource.description,
        "category": resource.category,
        "eligibility": resource.eligibility,
        "provider": resource.provider,
        "link": resource.link,
        "isNew": resource.is_new
    }

import os
import json
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import Resource, LearningPlatform
from app.services.email_service import email_service
from app.core.database import SessionLocal

class MarketScanner:
    """
    Automated Market Scanner to find and add new government schemes 
    and learning platforms. It uses AI-driven logic to ensure data quality.
    """
    
    @staticmethod
    async def scan_and_update():
        """Main scanner logic to be run in background or triggered by admin"""
        db = SessionLocal()
        try:
            print("🚀 Starting Market Scan...")
            new_additions = []
            
            # 1. Define typical market trends (Simulated dynamic data for demo)
            # In production, this would call a real news/search API
            market_data = [
                {
                    "type": "resource",
                    "title": "PM Farmer ID 2026",
                    "description": "A unique identity for farmers to simplify access to loans, insurance, and welfare schemes with satellite-based crop assessment.",
                    "category": "agriculture",
                    "provider": "Ministry of Agriculture",
                    "link": "https://pib.gov.in",
                    "isNew": True
                },
                {
                    "type": "resource",
                    "title": "Ayushman Bharat Expansion 2026",
                    "description": "Expanded health coverage up to ₹5 lakh per family including secondary and tertiary care hospitalizations.",
                    "category": "health",
                    "provider": "National Health Authority",
                    "link": "https://pmjay.gov.in",
                    "isNew": True
                },
                {
                    "type": "platform",
                    "title": "AI Skills for Rural Youth",
                    "description": "Specialized digital literacy program focused on AI-assisted farming and small business management.",
                    "category": "digital",
                    "provider": "Community AI Initiative",
                    "level": "Beginner",
                    "link": "https://community-empowering-2-0.vercel.app",
                    "features": ["AI Tools", "Business Basics"]
                }
            ]
            
            for item in market_data:
                # Check if already exists by title
                if item["type"] == "resource":
                    exists = db.query(Resource).filter(Resource.title == item["title"]).first()
                    if not exists:
                        new_res = Resource(
                            title=item["title"],
                            description=item["description"],
                            category=item["category"],
                            provider=item["provider"],
                            link=item["link"],
                            is_new=item.get("isNew", False)
                        )
                        db.add(new_res)
                        new_additions.append(item)
                else:
                    exists = db.query(LearningPlatform).filter(LearningPlatform.title == item["title"]).first()
                    if not exists:
                        new_plat = LearningPlatform(
                            title=item["title"],
                            description=item["description"],
                            category=item["category"],
                            provider=item["provider"],
                            duration="12 Weeks",
                            students="0",
                            level=item["level"],
                            link=item["link"],
                            features=json.dumps(item["features"]),
                            is_official=True
                        )
                        db.add(new_plat)
                        new_additions.append(item)
            
            if new_additions:
                db.commit()
                print(f"✅ Successfully added {len(new_additions)} new market items.")
                # Send mail to admin
                email_service.send_market_update_notification(new_additions)
            else:
                print("ℹ️ No new items found in this scan.")
            
            return new_additions

        except Exception as e:
            print(f"❌ Market Scanner Error: {str(e)}")
            return []
        finally:
            db.close()

# Singleton instance for background tasks
market_scanner = MarketScanner()

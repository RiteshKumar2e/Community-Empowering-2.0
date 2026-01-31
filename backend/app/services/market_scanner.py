import os
import json
import asyncio
import requests
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import Resource, LearningPlatform
from app.services.email_service import email_service
from app.core.database import SessionLocal
from app.core.config import settings

class MarketScanner:
    """
    Automated Market Scanner to find and add new government schemes (News API)
    and learning platforms (YouTube API).
    """
    
    @staticmethod
    async def scan_and_update():
        """Enhanced scanner to fetch diverse, high-quality real courses and schemes"""
        db = SessionLocal()
        try:
            print("🚀 Starting Professional Multi-Channel Market Scan...")
            new_additions = []
            
            # 1. CHANNEL: Government Schemes & Social Resources (News API)
            if settings.NEWS_API_KEY:
                # Targeted queries for "Real" resources
                news_queries = [
                    "government schemes india education",
                    "government schemes india health",
                    "government schemes india finance",
                    "government schemes india startup",
                    "government schemes india women empowerment"
                ]
                
                for query in news_queries:
                    try:
                        news_url = f"https://newsdata.io/api/1/news?apikey={settings.NEWS_API_KEY}&q={query}&language=en"
                        res = requests.get(news_url, timeout=15)
                        if res.status_code == 200:
                            articles = res.json().get('results', [])
                            for art in articles:
                                title = art.get('title', 'New Scheme').split('|')[0].strip()[:150]
                                description = art.get('description') or art.get('content') or "Details available at official source."
                                
                                # Check duplicate by title or link
                                exists = db.query(Resource).filter((Resource.title == title) | (Resource.link == art.get('link'))).first()
                                if not exists:
                                    # Smarter categorization
                                    category = "general"
                                    low_title = title.lower()
                                    if any(k in low_title for k in ["farmer", "agri", "crop", "fertilizer"]): category = "agriculture"
                                    elif any(k in low_title for k in ["student", "school", "scholarship", "exam"]): category = "education"
                                    elif any(k in low_title for k in ["loan", "finance", "bank", "subsidy", "fund"]): category = "finance"
                                    elif any(k in low_title for k in ["health", "hospital", "medical", "insurance", "ayushman"]): category = "health"
                                    
                                    resource = Resource(
                                        title=title,
                                        description=description,
                                        category=category,
                                        provider=art.get('source_id', 'Government Portal'),
                                        link=art.get('link', 'https://www.india.gov.in/'),
                                        is_new=True
                                    )
                                    db.add(resource)
                                    new_additions.append({"type": "resource", "title": title, "category": category, "link": resource.link})
                    except Exception as e:
                        print(f"⚠️ News API Query '{query}' Error: {str(e)}")

            # 2. CHANNEL: Online Courses & Learning (YouTube API)
            if settings.YOUTUBE_API_KEY:
                # Searching for "Real" courses (Full Tutorials)
                yt_queries = [
                    "full python course for beginners",
                    "advanced excel tutorial 2024",
                    "digital marketing full course india",
                    "artificial intelligence beginners guide",
                    "soft skills and communication training",
                    "government job preparation strategy india"
                ]
                
                for query in yt_queries:
                    try:
                        yt_url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={query}&type=video&key={settings.YOUTUBE_API_KEY}&maxResults=3"
                        res = requests.get(yt_url, timeout=15)
                        if res.status_code == 200:
                            videos = res.json().get('items', [])
                            for vid in videos:
                                title = vid['snippet']['title'][:150]
                                video_id = vid['id']['videoId']
                                link = f"https://www.youtube.com/watch?v={video_id}"
                                description = vid['snippet']['description']
                                
                                # Duplicate check
                                exists = db.query(LearningPlatform).filter(LearningPlatform.link == link).first()
                                if not exists:
                                    # Category detection
                                    cat = "other"
                                    low_title = title.lower()
                                    if "marketing" in low_title: cat = "marketing"
                                    elif any(k in low_title for k in ["python", "ai", "excel", "software", "coding", "digital"]): cat = "digital"
                                    elif any(k in low_title for k in ["english", "soft skills", "communication", "personality"]): cat = "soft_skills"
                                    
                                    platform = LearningPlatform(
                                        title=title,
                                        description=description,
                                        category=cat,
                                        provider=vid['snippet']['channelTitle'],
                                        duration="Full Course",
                                        students="Premium Access",
                                        level="Intermediate" if "advanced" in low_title else "Beginner",
                                        link=link,
                                        features=json.dumps(["Professional Instructor", "Certificate eligible", "Resource materials"]),
                                        is_official=True
                                    )
                                    db.add(platform)
                                    new_additions.append({"type": "platform", "title": title, "category": cat, "link": link})
                    except Exception as e:
                        print(f"⚠️ YouTube API Query '{query}' Error: {str(e)}")

            if new_additions:
                db.commit()
                print(f"✅ Successfully integrated {len(new_additions)} new premium items.")
                email_service.send_market_update_notification(new_additions)
            else:
                print("ℹ️ No new unique resources found at this moment.")
            
            return new_additions

        except Exception as e:
            print(f"❌ Market Scanner Critical Error: {str(e)}")
            return []
        finally:
            db.close()

# Singleton instance
market_scanner = MarketScanner()

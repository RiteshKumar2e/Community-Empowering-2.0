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
        """Main scanner logic to be run in background or triggered by admin"""
        db = SessionLocal()
        try:
            print("🚀 Starting Multi-Channel Live Market Scan...")
            new_additions = []
            
            # 1. CHANNEL: News (Government Schemes)
            if settings.NEWS_API_KEY:
                try:
                    print("📡 Fetching latest Government Schemes from News API...")
                    news_url = f"https://newsdata.io/api/1/news?apikey={settings.NEWS_API_KEY}&q=government%20scheme%20india&language=en"
                    res = requests.get(news_url, timeout=10)
                    if res.status_code == 200:
                        articles = res.json().get('results', [])
                        for art in articles:
                            title = art.get('title', 'New Scheme').split('|')[0].strip()[:150]
                            # Check duplicates
                            if not db.query(Resource).filter(Resource.title == title).first():
                                resource = Resource(
                                    title=title,
                                    description=art.get('description') or art.get('content') or "Details available at source.",
                                    category="agriculture" if "farmer" in title.lower() else "general",
                                    provider=art.get('source_id', 'Govt Source'),
                                    link=art.get('link', 'https://www.india.gov.in/'),
                                    is_new=True
                                )
                                db.add(resource)
                                new_additions.append({"type": "resource", "title": title, "category": resource.category, "link": resource.link})
                except Exception as e:
                    print(f"⚠️ News API Error: {str(e)}")

            # 2. CHANNEL: YouTube (Learning Content)
            if settings.YOUTUBE_API_KEY:
                try:
                    print("📺 Fetching latest Skill Development videos from YouTube...")
                    # Searching for official/high-quality learning content
                    query = "digital literacy india government skill development"
                    yt_url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={query}&type=video&key={settings.YOUTUBE_API_KEY}&maxResults=5"
                    res = requests.get(yt_url, timeout=10)
                    if res.status_code == 200:
                        videos = res.json().get('items', [])
                        for vid in videos:
                            title = vid['snippet']['title'][:150]
                            video_id = vid['id']['videoId']
                            link = f"https://www.youtube.com/watch?v={video_id}"
                            
                            # Check duplicates
                            if not db.query(LearningPlatform).filter(LearningPlatform.title == title).first():
                                platform = LearningPlatform(
                                    title=title,
                                    description=vid['snippet']['description'],
                                    category="digital",
                                    provider=vid['snippet']['channelTitle'],
                                    duration="Video",
                                    students="Live",
                                    level="Beginner",
                                    link=link,
                                    features=json.dumps(["Video Tutorial", "Self-Paced"]),
                                    is_official=True
                                )
                                db.add(platform)
                                new_additions.append({"type": "platform", "title": title, "category": "Learning", "link": link})
                except Exception as e:
                    print(f"⚠️ YouTube API Error: {str(e)}")

            if new_additions:
                db.commit()
                print(f"✅ Successfully added {len(new_additions)} new items from News & YouTube.")
                # Send mail to admin
                email_service.send_market_update_notification(new_additions)
            else:
                print("ℹ️ No new unique items found in this multi-channel scan.")
            
            return new_additions

        except Exception as e:
            print(f"❌ Market Scanner Error: {str(e)}")
            return []
        finally:
            db.close()

# Singleton instance
market_scanner = MarketScanner()

"""Fetch current public opportunities and add only new items to the catalogue."""

import asyncio
import json
import logging
from email.utils import parsedate_to_datetime
from xml.etree import ElementTree

import requests
from sqlalchemy import or_

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.models import LearningPlatform, Resource
from app.services.email_service import email_service

logger = logging.getLogger(__name__)


def _text(value: str | None, fallback: str = "") -> str:
    return " ".join((value or fallback).split()).strip()


def _category(title: str, description: str = "") -> str:
    text = f"{title} {description}".lower()
    if any(word in text for word in ("job", "recruit", "vacanc", "employment", "career", "apprentice")):
        return "jobs"
    if any(word in text for word in ("farmer", "agri", "crop", "fertilizer", "kisan")):
        return "agriculture"
    if any(word in text for word in ("student", "school", "scholarship", "exam", "education")):
        return "education"
    if any(word in text for word in ("loan", "finance", "bank", "subsidy", "fund", "startup")):
        return "finance"
    if any(word in text for word in ("health", "hospital", "medical", "insurance", "ayushman")):
        return "healthcare"
    if any(word in text for word in ("women", "child", "girl")):
        return "women"
    if any(word in text for word in ("housing", "house", "awas")):
        return "housing"
    return "schemes"


def _published_at(value: str | None) -> str | None:
    if not value:
        return None
    try:
        return parsedate_to_datetime(value).isoformat()
    except (TypeError, ValueError, OverflowError):
        return None


class MarketScanner:
    """Scan official announcements, current jobs and learning opportunities."""

    _news_queries = (
        "India government scheme OR yojana",
        "India government jobs OR recruitment OR apprenticeship",
        "India government scholarship OR skill training",
        "India startup subsidy OR MSME scheme",
    )
    _learning_queries = (
        "free government skill course India",
        "free Python data AI course India",
        "digital marketing communication skills course",
        "government job preparation course India",
    )

    @staticmethod
    async def _get(url: str, **kwargs):
        """Keep blocking requests off FastAPI's event loop."""
        return await asyncio.to_thread(requests.get, url, **kwargs)

    @staticmethod
    def _existing(db, model, title: str, link: str | None):
        filters = [model.title == title]
        if link:
            filters.append(model.link == link)
        return db.query(model).filter(or_(*filters)).first()

    @staticmethod
    def _add_resource(db, item: dict, additions: list[dict]) -> None:
        title = _text(item.get("title"), "New government opportunity")[:150]
        link = _text(item.get("link"), "https://www.india.gov.in/")[:500]
        description = _text(item.get("description"), "Check the official source for eligibility and application details.")[:2000]
        if MarketScanner._existing(db, Resource, title, link):
            return
        category = _category(title, description)
        db.add(Resource(
            title=title,
            description=description,
            category=category,
            eligibility="Check the official notification",
            provider=_text(item.get("provider"), "Government of India")[:150],
            link=link,
            is_new=True,
        ))
        additions.append({"type": "resource", "title": title, "category": category, "link": link})

    @staticmethod
    async def _scan_pib(db, additions: list[dict]) -> None:
        try:
            response = await MarketScanner._get(settings.PIB_RSS_URL, timeout=15)
            response.raise_for_status()
            root = ElementTree.fromstring(response.content)
            for entry in root.findall(".//item")[:30]:
                title = _text(entry.findtext("title"))
                description = _text(entry.findtext("description"))
                link = _text(entry.findtext("link"))
                text = f"{title} {description}".lower()
                if not any(word in text for word in (
                    "scheme", "yojana", "mission", "scholarship", "recruit", "employment",
                    "skill", "startup", "subsid", "benefit", "apprentice",
                )):
                    continue
                MarketScanner._add_resource(db, {
                    "title": title,
                    "description": description,
                    "link": link,
                    "provider": "Press Information Bureau",
                }, additions)
        except (requests.RequestException, ElementTree.ParseError) as exc:
            logger.warning("PIB market scan failed: %s", exc)

    @staticmethod
    async def _scan_news(db, additions: list[dict]) -> None:
        if not settings.NEWS_API_KEY:
            return
        for query in MarketScanner._news_queries:
            try:
                response = await MarketScanner._get(
                    "https://newsdata.io/api/1/news",
                    params={"apikey": settings.NEWS_API_KEY, "q": query, "language": "en", "country": "in"},
                    timeout=15,
                )
                response.raise_for_status()
                for article in response.json().get("results", [])[:10]:
                    MarketScanner._add_resource(db, {
                        "title": article.get("title"),
                        "description": article.get("description") or article.get("content"),
                        "link": article.get("link"),
                        "provider": article.get("source_id"),
                    }, additions)
            except (requests.RequestException, ValueError, TypeError) as exc:
                logger.warning("News API query %r failed: %s", query, exc)

    @staticmethod
    async def _scan_learning(db, additions: list[dict]) -> None:
        if not settings.YOUTUBE_API_KEY:
            return
        for query in MarketScanner._learning_queries:
            try:
                response = await MarketScanner._get(
                    "https://www.googleapis.com/youtube/v3/search",
                    params={
                        "part": "snippet",
                        "q": query,
                        "type": "video",
                        "key": settings.YOUTUBE_API_KEY,
                        "maxResults": 5,
                    },
                    timeout=15,
                )
                response.raise_for_status()
                for video in response.json().get("items", []):
                    snippet = video.get("snippet", {})
                    video_id = (video.get("id") or {}).get("videoId")
                    if not video_id:
                        continue
                    title = _text(snippet.get("title"), "New learning resource")[:150]
                    link = f"https://www.youtube.com/watch?v={video_id}"
                    if MarketScanner._existing(db, LearningPlatform, title, link):
                        continue
                    lower_title = title.lower()
                    category = "internship" if any(word in lower_title for word in ("job", "career", "recruit")) else "digital"
                    db.add(LearningPlatform(
                        title=title,
                        description=_text(snippet.get("description"), "New learning resource from YouTube.")[:2000],
                        category=category,
                        provider=_text(snippet.get("channelTitle"), "YouTube")[:150],
                        duration="Self-paced",
                        students="Open access",
                        level="Beginner",
                        link=link,
                        features=json.dumps(["Video lessons", "Self-paced learning"]),
                        is_official=False,
                    ))
                    additions.append({"type": "platform", "title": title, "category": category, "link": link})
            except (requests.RequestException, ValueError, TypeError) as exc:
                logger.warning("YouTube query %r failed: %s", query, exc)

    @staticmethod
    async def scan_and_update():
        db = SessionLocal()
        additions: list[dict] = []
        try:
            await MarketScanner._scan_pib(db, additions)
            await MarketScanner._scan_news(db, additions)
            await MarketScanner._scan_learning(db, additions)
            if additions:
                db.commit()
                try:
                    email_service.send_market_update_notification(additions)
                except Exception:
                    logger.exception("Could not send market update notification")
            return additions
        except Exception:
            db.rollback()
            logger.exception("Market scanner failed")
            return []
        finally:
            db.close()

    @staticmethod
    async def run_periodically() -> None:
        """Keep public catalogues fresh without requiring an admin action."""
        while True:
            await MarketScanner.scan_and_update()
            await asyncio.sleep(max(settings.MARKET_SCAN_INTERVAL_HOURS, 1) * 60 * 60)


market_scanner = MarketScanner()

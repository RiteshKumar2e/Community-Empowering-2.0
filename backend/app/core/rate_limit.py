"""Small in-memory rate limiter for sensitive endpoints (login, signup, reset).

Per-process memory: fine for a single Render instance. If the backend is ever
scaled to several instances, move this to Redis (already in requirements).
"""
import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status


class RateLimiter:
    def __init__(self, max_calls: int, period_seconds: int, scope: str):
        self.max_calls = max_calls
        self.period = period_seconds
        self.scope = scope
        self._hits = defaultdict(deque)
        self._lock = threading.Lock()

    @staticmethod
    def _client_ip(request: Request) -> str:
        # Render/Vercel put the real client first in X-Forwarded-For.
        forwarded = request.headers.get("x-forwarded-for", "")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def __call__(self, request: Request) -> None:
        key = f"{self.scope}:{self._client_ip(request)}"
        now = time.monotonic()
        with self._lock:
            hits = self._hits[key]
            while hits and now - hits[0] > self.period:
                hits.popleft()
            if len(hits) >= self.max_calls:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many attempts. Please wait a few minutes and try again.",
                )
            hits.append(now)


login_limiter = RateLimiter(max_calls=10, period_seconds=60, scope="login")
register_limiter = RateLimiter(max_calls=5, period_seconds=600, scope="register")
password_reset_limiter = RateLimiter(max_calls=5, period_seconds=900, scope="password-reset")
verification_limiter = RateLimiter(max_calls=10, period_seconds=900, scope="email-verification")

"""Small in-memory rate limiter for sensitive endpoints (login, signup, reset).

Per-process memory: fine for a single Render instance. If the backend is ever
scaled to several instances, move this to Redis (already in requirements).
"""
import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status
import os

# Number of reverse proxies in front of the app that append to X-Forwarded-For
# (Render: 1). Set to 0 when running without a proxy.
TRUSTED_PROXY_HOPS = int(os.environ.get("TRUSTED_PROXY_HOPS", "1"))


class RateLimiter:
    def __init__(self, max_calls: int, period_seconds: int, scope: str):
        self.max_calls = max_calls
        self.period = period_seconds
        self.scope = scope
        self._hits = defaultdict(deque)
        self._lock = threading.Lock()

    @staticmethod
    def _client_ip(request: Request) -> str:
        # X-Forwarded-For is "client-supplied, ..., added-by-our-proxy". Only the
        # entries appended by our own proxies can be trusted: anything to their
        # left can be forged by the caller to dodge the limit. Render adds one
        # hop, so we read the TRUSTED_PROXY_HOPS-th entry from the right.
        hops = TRUSTED_PROXY_HOPS
        forwarded = [p.strip() for p in request.headers.get("x-forwarded-for", "").split(",") if p.strip()]
        if hops > 0 and len(forwarded) >= hops:
            return forwarded[-hops]
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
# Google-login OTP: per-IP limits plus a per-account wrong-guess counter
# (see auth.verify_google_otp). otp_failures maps user id -> wrong guesses.
otp_verify_limiter = RateLimiter(max_calls=10, period_seconds=600, scope="otp-verify")
otp_resend_limiter = RateLimiter(max_calls=3, period_seconds=600, scope="otp-resend")
otp_failures: dict = {}

# AI endpoints call paid LLM APIs: cap per-IP usage to stop cost abuse.
ai_limiter = RateLimiter(max_calls=20, period_seconds=60, scope="ai")
# Spam protection for things other people read or that email the admin.
forum_post_limiter = RateLimiter(max_calls=20, period_seconds=600, scope="forum-post")
feedback_limiter = RateLimiter(max_calls=5, period_seconds=600, scope="feedback")
contact_limiter = RateLimiter(max_calls=5, period_seconds=600, scope="contact")

# Longest message accepted by any AI endpoint (characters).
AI_MAX_MESSAGE_CHARS = 2000

"""Security regression tests (run on a throwaway SQLite DB; see test_signup_funnel.py)."""
from test_signup_funnel import client, register, auth, SENT_CODES  # noqa: F401  (shares app + fixtures)
from test_signup_funnel import _no_real_email_and_fresh_limits  # noqa: F401
from app.core import database
from app.models.models import User


def _otp_for(email):
    db = database.SessionLocal()
    try:
        return db.query(User).filter(User.email == email).first().google_otp
    finally:
        db.close()


def test_c2_resend_google_otp_cannot_be_used_to_take_over_an_account():
    # Victim has a normal email/password account and never started a Google login.
    register("victim@example.com")
    r = client.post("/api/auth/resend-google-otp", json={"email": "victim@example.com"})
    assert r.status_code == 200                  # same answer as for unknown emails (no enumeration)
    assert _otp_for("victim@example.com") is None  # ...but no OTP is created for the attacker to guess
    unknown = client.post("/api/auth/resend-google-otp", json={"email": "nobody@example.com"})
    assert unknown.status_code == 200 and unknown.json()["message"] == r.json()["message"]


def test_c2_google_otp_is_locked_after_five_wrong_guesses():
    register("otpuser@example.com")
    db = database.SessionLocal()
    from datetime import datetime, timedelta, timezone
    u = db.query(User).filter(User.email == "otpuser@example.com").first()
    u.google_otp, u.google_otp_expiry = "123456", datetime.now(timezone.utc) + timedelta(minutes=10)
    db.commit(); db.close()

    for guess in ["000001", "000002", "000003", "000004", "000005"]:
        assert client.post("/api/auth/verify-google-otp", json={"email": "otpuser@example.com", "otp": guess}).status_code in (400, 401)
    # The real code no longer works: the OTP was invalidated.
    r = client.post("/api/auth/verify-google-otp", json={"email": "otpuser@example.com", "otp": "123456"})
    assert r.status_code in (400, 401, 429) and "token" not in r.json()


def test_unknown_email_on_verify_does_not_reveal_accounts():
    r = client.post("/api/auth/verify-google-otp", json={"email": "ghost@example.com", "otp": "123456"})
    assert r.status_code == 400


# --- H1: paid AI endpoints need login --------------------------------------
def test_aws_ai_endpoints_require_login():
    assert client.post("/api/aws/chat", json={"message": "hi"}).status_code == 401
    assert client.post("/api/aws/q/ask", json={"message": "hi"}).status_code == 401


def test_ai_message_length_is_capped():
    token = register("aiuser@example.com").json()["token"]
    r = client.post("/api/ai/chat", json={"message": "x" * 2001}, headers=auth(token))
    assert r.status_code == 422
    assert client.post("/api/agent/chat", json={"message": "x" * 2001}).status_code == 422


# --- H3: forged X-Forwarded-For can't bypass rate limits ---------------------
def test_rate_limit_ignores_spoofed_forwarded_for():
    codes = []
    for i in range(12):
        # Attacker rotates the left-most (client-controlled) value; the proxy-added
        # right-most value stays the same, so the limit still applies.
        h = {"X-Forwarded-For": f"10.0.0.{i}, 203.0.113.7"}
        codes.append(client.post("/api/auth/login", json={"email": "x@example.com", "password": "nope-nope"}, headers=h).status_code)
    assert 429 in codes


# --- Email change -------------------------------------------------------------
def test_email_change_validates_and_resets_verification():
    reg = register("changer@example.com").json()
    token = reg["token"]
    assert client.put("/api/users/me", json={"email": "not-an-email"}, headers=auth(token)).status_code == 422
    assert client.put("/api/users/me", json={"email": "riteshkumar90359@gmail.com"}, headers=auth(token)).status_code == 400
    r = client.put("/api/users/me", json={"email": "changed@example.com"}, headers=auth(token)).json()
    assert r["emailVerified"] is False and r["token"]
    # The new token works; the old one no longer maps to an account.
    assert client.get("/api/users/me", headers=auth(r["token"])).status_code == 200
    assert client.get("/api/users/me", headers=auth(token)).status_code == 401
    assert client.put("/api/users/me", json={"name": "<b>" * 100}, headers=auth(r["token"])).status_code == 422


# --- Injection: input is treated as data ------------------------------------
def test_sql_metacharacters_are_treated_as_data():
    payload = "x' OR '1'='1"
    assert client.post("/api/auth/login", json={"email": "a@example.com", "password": payload}).status_code == 401
    token = register("sqli@example.com").json()["token"]
    r = client.get("/api/forum/discussions", params={"search": "'; DROP TABLE users; --"})
    assert r.status_code in (200, 401)
    assert client.get("/api/users/me", headers=auth(token)).status_code == 200  # users table intact
    assert client.post("/api/me/saved-schemes", json={"slug": "pm-kisan' --"}, headers=auth(token)).status_code == 422


# --- Uploads ---------------------------------------------------------------
def test_upload_rejects_disguised_and_oversized_files():
    token = register("uploader@example.com").json()["token"]
    html = ("evil.png", b"<html><script>alert(1)</script></html>", "image/png")
    assert client.post("/api/users/me/photo", files={"file": html}, headers=auth(token)).status_code == 400
    big = ("big.png", b"\x89PNG\r\n\x1a\n" + b"0" * (2 * 1024 * 1024 + 10), "image/png")
    assert client.post("/api/users/me/photo", files={"file": big}, headers=auth(token)).status_code == 413
    ok = ("ok.png", b"\x89PNG\r\n\x1a\n" + b"0" * 100, "image/png")
    r = client.post("/api/users/me/photo", files={"file": ok}, headers=auth(token))
    assert r.status_code == 200 and r.json()["profileImage"].endswith(".png")


# --- Headers, body size, error leakage, docs -------------------------------
def test_security_headers_and_no_cache_on_api():
    r = client.get("/api/resources/")
    assert r.headers["X-Content-Type-Options"] == "nosniff"
    assert r.headers["X-Frame-Options"] == "DENY"
    assert r.headers["Cache-Control"] == "no-store"


def test_oversized_body_rejected():
    r = client.post("/api/auth/login", content=b"{" + b" " * (1024 * 1024 + 10) + b"}",
                    headers={"Content-Type": "application/json"})
    assert r.status_code == 413


def test_api_docs_hidden_when_not_debug():
    assert client.get("/docs").status_code == 404
    assert client.get("/openapi.json").status_code == 404


def test_google_only_account_password_login_is_401_not_500():
    from app.models.models import User
    db = database.SessionLocal()
    db.add(User(name="G User", email="guser@example.com", phone="", password_hash="google_authenticated_user"))
    db.commit(); db.close()
    r = client.post("/api/auth/login", json={"email": "guser@example.com", "password": "google_authenticated_user"})
    assert r.status_code == 401


def test_cross_user_access_is_blocked():
    a = register("alice2@example.com").json()["token"]
    b = register("bob2@example.com").json()["token"]
    rid = client.post("/api/me/reminders", json={"title": "Mine", "remindOn": "2099-01-01"}, headers=auth(a)).json()["id"]
    assert client.delete(f"/api/me/reminders/{rid}", headers=auth(b)).json()["removed"] is False
    assert client.get("/api/admin/users", headers=auth(b)).status_code == 403
    assert client.get("/api/admin/growth", headers=auth(b)).status_code == 403


# --- H4: forum must not leak authors' emails ---------------------------------
def test_forum_hides_author_emails_from_others():
    author = register("author@example.com").json()["token"]
    other = register("reader@example.com").json()["token"]
    from app.models.models import ForumCategory
    db = database.SessionLocal()
    cat = ForumCategory(name="General")
    db.add(cat); db.commit(); cid = cat.id; db.close()
    r = client.post("/api/forum/discussions", json={"title": "Hello there", "content": "First post", "category_id": cid}, headers=auth(author))
    assert r.status_code in (200, 201), r.text
    assert client.get("/api/forum/discussions").status_code == 401  # login required to read
    listing = client.get("/api/forum/discussions", headers=auth(other)).json()
    assert listing and all(d.get("user_email") in (None, "") for d in listing)
    mine = client.get("/api/forum/discussions", headers=auth(author)).json()
    assert any(d.get("user_email") == "author@example.com" for d in mine)


def test_forum_pagination_is_bounded():
    token = register("pager@example.com").json()["token"]
    r = client.get("/api/forum/discussions", params={"limit": 1000000, "skip": -5}, headers=auth(token))
    assert r.status_code == 200 and len(r.json()) <= 100


def test_cors_rejects_unknown_origins():
    r = client.options("/api/auth/login", headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"})
    assert r.headers.get("access-control-allow-origin") not in ("*", "https://evil.example")

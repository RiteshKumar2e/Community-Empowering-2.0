"""Tests for signup, saved schemes, eligibility results, password reset,
admin growth stats and the chat authorization fixes.

Runs against a throwaway SQLite file. The environment is set BEFORE the app is
imported so the real (production) database from .env is never used, and email
sending is replaced with a stub so no real emails go out.

    cd backend && python -m pytest tests -q
"""
import os
import sys
import tempfile

_DB_FILE = os.path.join(tempfile.mkdtemp(), "test.db")
os.environ["TURSO_DATABASE_URL"] = ""
os.environ["TURSO_AUTH_TOKEN"] = ""
os.environ["DATABASE_URL"] = f"sqlite:///{_DB_FILE}"
os.environ["DEBUG"] = "false"  # behave like production
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from starlette.websockets import WebSocketDisconnect  # noqa: E402

from app.core import database  # noqa: E402

assert str(database.engine.url).startswith("sqlite:///"), "tests must never run against a remote database"

from app.core.database import Base, engine  # noqa: E402
from app.core import rate_limit  # noqa: E402
from app.services.email_service import email_service  # noqa: E402
import main  # noqa: E402

Base.metadata.create_all(bind=engine)
client = TestClient(main.app)  # no `with`: skips startup seeding/market scan

SENT_CODES = {}


@pytest.fixture(autouse=True)
def _no_real_email_and_fresh_limits(monkeypatch):
    monkeypatch.setattr(email_service, "send_otp", lambda email, code, purpose="google_login": SENT_CODES.__setitem__(email, code) or True)
    for limiter in (rate_limit.login_limiter, rate_limit.register_limiter, rate_limit.password_reset_limiter):
        limiter._hits.clear()
    yield


def register(email, password="secret123", **overrides):
    body = {
        "name": "Test User", "email": email, "phone": "9876543210", "password": password,
        "location": "Ranchi, Jharkhand", "language": "en", "communityType": "farmer",
    }
    body.update(overrides)
    return client.post("/api/auth/register", json=body)


def auth(token):
    return {"Authorization": f"Bearer {token}"}


ANSWERS = {"age": 35, "gender": "female", "occupation": "farmer", "state": "Jharkhand",
           "taxPayer": "no", "income": "below", "daughter": "yes"}


def test_register_validates_input_on_server():
    assert register("short@example.com", password="123").status_code == 422
    assert register("phone@example.com", phone="12345").status_code == 422
    assert register("name@example.com", name="A").status_code == 422
    assert register("ok@example.com").status_code == 200
    assert register("ok@example.com").status_code == 400  # duplicate


def test_login_success_and_failure():
    register("login@example.com")
    assert client.post("/api/auth/login", json={"email": "login@example.com", "password": "wrong-pass"}).status_code == 401
    r = client.post("/api/auth/login", json={"email": "login@example.com", "password": "secret123"})
    assert r.status_code == 200 and r.json()["token"]


def test_private_routes_require_login():
    assert client.get("/api/me/saved-schemes").status_code == 401
    assert client.post("/api/me/saved-schemes", json={"slug": "pm-kisan"}).status_code == 401
    assert client.get("/api/me/eligibility-results").status_code == 401
    assert client.get("/api/chat/users").status_code == 401


def test_saved_schemes_are_per_user():
    a = register("alice@example.com").json()["token"]
    b = register("bob@example.com").json()["token"]

    assert client.post("/api/me/saved-schemes", json={"slug": "pm-kisan"}, headers=auth(a)).status_code == 201
    assert client.post("/api/me/saved-schemes", json={"slug": "pm-kisan"}, headers=auth(a)).status_code == 201  # idempotent
    assert client.post("/api/me/saved-schemes", json={"slug": "Bad Slug!"}, headers=auth(a)).status_code == 422

    assert [s["slug"] for s in client.get("/api/me/saved-schemes", headers=auth(a)).json()] == ["pm-kisan"]
    assert client.get("/api/me/saved-schemes", headers=auth(b)).json() == []

    # Bob cannot delete Alice's bookmark.
    assert client.delete("/api/me/saved-schemes/pm-kisan", headers=auth(b)).json()["removed"] is False
    assert len(client.get("/api/me/saved-schemes", headers=auth(a)).json()) == 1
    assert client.delete("/api/me/saved-schemes/pm-kisan", headers=auth(a)).json()["removed"] is True


def test_eligibility_results_saved_without_sensitive_fields():
    token = register("carol@example.com").json()["token"]
    bad = client.post("/api/me/eligibility-results", json={"answers": {**ANSWERS, "age": 500}, "schemes": []}, headers=auth(token))
    assert bad.status_code == 422

    payload = {"answers": {**ANSWERS, "category": "sc"}, "schemes": ["pm-kisan", "pm-kisan", "../etc", "sukanya-samriddhi-yojana"]}
    r = client.post("/api/me/eligibility-results", json=payload, headers=auth(token))
    assert r.status_code == 201
    saved = r.json()
    assert "category" not in saved["answers"]
    assert saved["schemes"] == ["pm-kisan", "sukanya-samriddhi-yojana"]

    for _ in range(12):
        client.post("/api/me/eligibility-results", json={"answers": ANSWERS, "schemes": []}, headers=auth(token))
    assert len(client.get("/api/me/eligibility-results", headers=auth(token)).json()) == 5


def test_password_reset_flow():
    register("dave@example.com")
    unknown = client.post("/api/auth/forgot-password", json={"email": "nobody@example.com"})
    known = client.post("/api/auth/forgot-password", json={"email": "dave@example.com"})
    assert unknown.json()["message"] == known.json()["message"]  # no account enumeration
    code = SENT_CODES["dave@example.com"]
    wrong = "000000" if code != "000000" else "111111"

    assert client.post("/api/auth/reset-password", json={"email": "dave@example.com", "code": wrong, "new_password": "newpass123"}).status_code == 400
    assert client.post("/api/auth/reset-password", json={"email": "dave@example.com", "code": code, "new_password": "newpass123"}).status_code == 200
    # Single use
    assert client.post("/api/auth/reset-password", json={"email": "dave@example.com", "code": code, "new_password": "another123"}).status_code == 400
    assert client.post("/api/auth/login", json={"email": "dave@example.com", "password": "newpass123"}).status_code == 200


def test_login_is_rate_limited():
    codes = [client.post("/api/auth/login", json={"email": "x@example.com", "password": "nope-nope"}).status_code for _ in range(12)]
    assert 429 in codes


def test_admin_growth_requires_admin():
    token = register("eve@example.com").json()["token"]
    assert client.get("/api/admin/growth").status_code == 401
    assert client.get("/api/admin/growth", headers=auth(token)).status_code == 403

    from app.models.models import User
    db = database.SessionLocal()
    db.query(User).filter(User.email == "eve@example.com").update({"is_admin": True})
    db.commit()
    db.close()
    r = client.get("/api/admin/growth?days=7", headers=auth(token))
    assert r.status_code == 200
    body = r.json()
    assert body["accounts"]["total"] >= 1 and len(body["accounts"]["registrationsByDay"]) == 7
    assert "activeRule" in body["engagement"]


def test_chat_websocket_rejects_impersonation():
    a = register("frank@example.com").json()
    b = register("grace@example.com").json()
    with pytest.raises(WebSocketDisconnect):
        with client.websocket_connect(f"/ws/chat/{b['user']['id']}?token={a['token']}") as ws:
            ws.receive_text()
    with pytest.raises(WebSocketDisconnect):
        with client.websocket_connect(f"/ws/chat/{a['user']['id']}") as ws:
            ws.receive_text()


def test_email_verification_flow():
    reg = register("henry@example.com").json()
    assert reg["user"]["emailVerified"] is False
    token = reg["token"]
    code = SENT_CODES["henry@example.com"]  # sent automatically on signup
    assert client.post("/api/auth/email/verify", json={"code": "12345"}, headers=auth(token)).status_code == 422
    wrong = "000000" if code != "000000" else "111111"
    assert client.post("/api/auth/email/verify", json={"code": wrong}, headers=auth(token)).status_code == 400
    assert client.post("/api/auth/email/verify", json={"code": code}, headers=auth(token)).json()["emailVerified"] is True
    login = client.post("/api/auth/login", json={"email": "henry@example.com", "password": "secret123"}).json()
    assert login["user"]["emailVerified"] is True
    assert client.post("/api/auth/email/verify", json={"code": code}).status_code == 401


def test_one_time_codes_are_fast_keyed_hashes_and_old_bcrypt_codes_still_work():
    from app.core.security import get_password_hash, hash_code, verify_code
    from app.models.models import EmailVerification, User

    reg = register("olga@example.com").json()
    db = database.SessionLocal()
    try:
        row = db.query(EmailVerification).filter(EmailVerification.user_id == reg["user"]["id"]).one()
        assert row.code_hash.startswith("hmac$") and SENT_CODES["olga@example.com"] not in row.code_hash
        assert db.query(User).filter(User.email == "olga@example.com").one().password_hash.startswith("$2")
        # A code that was emailed (and bcrypt-hashed) before this change.
        row.code_hash = get_password_hash("424242")
        db.commit()
    finally:
        db.close()
    assert verify_code("424242", hash_code("424242")) and not verify_code("424243", hash_code("424242"))
    assert not verify_code("424242", None)
    ok = client.post("/api/auth/email/verify", json={"code": "424242"}, headers=auth(reg["token"]))
    assert ok.json()["emailVerified"] is True


def test_register_uses_a_single_commit(monkeypatch):
    from sqlalchemy.orm import Session
    commits = []
    original = Session.commit
    monkeypatch.setattr(Session, "commit", lambda self: commits.append(1) or original(self))
    assert register("pete@example.com").status_code == 200
    assert len(commits) == 1


def test_verification_resend_has_cooldown():
    token = register("ivy@example.com").json()["token"]
    assert client.post("/api/auth/email/send-verification", headers=auth(token)).status_code == 429


def test_reminders_are_private_and_validated():
    a = register("jack@example.com").json()["token"]
    b = register("kate@example.com").json()["token"]
    assert client.post("/api/me/reminders", json={"title": "Old", "remindOn": "2020-01-01"}, headers=auth(a)).status_code == 422
    r = client.post("/api/me/reminders", json={"title": "Apply for PM-KISAN", "remindOn": "2099-06-01", "schemeSlug": "pm-kisan"}, headers=auth(a))
    assert r.status_code == 201
    rid = r.json()["id"]
    assert client.get("/api/me/reminders", headers=auth(b)).json() == []
    assert client.patch(f"/api/me/reminders/{rid}", headers=auth(b)).status_code == 404
    assert client.delete(f"/api/me/reminders/{rid}", headers=auth(b)).json()["removed"] is False
    assert client.patch(f"/api/me/reminders/{rid}", headers=auth(a)).json()["done"] is True


def test_export_and_delete_account():
    token = register("leo@example.com").json()["token"]
    client.post("/api/me/saved-schemes", json={"slug": "pm-kisan"}, headers=auth(token))
    client.post("/api/me/reminders", json={"title": "Renew", "remindOn": "2099-01-01"}, headers=auth(token))
    data = client.get("/api/me/export", headers=auth(token)).json()
    assert data["profile"]["email"] == "leo@example.com"
    assert data["savedSchemes"][0]["slug"] == "pm-kisan" and len(data["reminders"]) == 1

    assert client.request("DELETE", "/api/me/account", json={"confirm": "yes"}, headers=auth(token)).status_code == 422
    assert client.request("DELETE", "/api/me/account", json={"confirm": "DELETE"}, headers=auth(token)).status_code == 200
    assert client.post("/api/auth/login", json={"email": "leo@example.com", "password": "secret123"}).status_code == 401
    from app.models.models import SavedScheme, Reminder
    db = database.SessionLocal()
    assert db.query(SavedScheme).count() == db.query(SavedScheme).filter(SavedScheme.scheme_slug != "__none__").count()
    assert all(r.title != "Renew" for r in db.query(Reminder).all())
    db.close()


def test_logs_mask_emails(capsys):
    register("maskme@example.com")
    client.post("/api/auth/forgot-password", json={"email": "maskme@example.com"})
    from app.core.privacy import mask_email
    assert mask_email("maskme@example.com") == "ma***@example.com"


def test_health_answers_get_and_head_for_uptime_monitors():
    assert client.get("/health").json() == {"status": "healthy"}
    assert client.head("/health").status_code == 200


def test_idle_database_connection_is_replaced_not_reused():
    # Turso drops idle streams ("stream not found"); the guard must hand out a
    # fresh connection after idling instead of the dead one. Separate SQLite
    # engine: never the real database.
    import time
    from sqlalchemy import create_engine, text
    from sqlalchemy.pool import StaticPool
    from app.core.database import install_stale_connection_guard, is_stale_stream_error

    eng = create_engine("sqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False})
    install_stale_connection_guard(eng, max_idle_seconds=0.05)
    with eng.connect() as c:
        first = c.connection.dbapi_connection
        c.execute(text("SELECT 1"))
    with eng.connect() as c:  # used again right away: same connection
        assert c.connection.dbapi_connection is first
    time.sleep(0.1)
    with eng.connect() as c:  # after idling: replaced, and it works
        assert c.connection.dbapi_connection is not first
        assert c.execute(text("SELECT 1")).scalar() == 1

    assert is_stale_stream_error(ValueError('Hrana: `api error: `status=404 Not Found, body={"error":"stream not found: c4c583cd:6bd6522"}``'))
    assert not is_stale_stream_error(ValueError("Wrong number of segments in token"))


def test_google_login_database_error_is_500_not_invalid_token(monkeypatch):
    from app.api import auth as auth_module
    monkeypatch.setattr(auth_module.id_token, "verify_oauth2_token",
                        lambda *a, **k: {"email": "gina@example.com", "name": "Gina"})

    def broken_query(*a, **k):
        raise ValueError('Hrana: api error: status=404 Not Found, body={"error":"stream not found: x"}')
    monkeypatch.setattr(auth_module.Session, "query", broken_query)
    res = client.post("/api/auth/google-login", json={"credential": "anything"})
    assert res.status_code == 500
    assert "Invalid Google token" not in res.text


def test_wrong_google_otp_says_how_many_attempts_are_left(monkeypatch):
    from app.api import auth as auth_module
    monkeypatch.setattr(auth_module.id_token, "verify_oauth2_token",
                        lambda *a, **k: {"email": "hana@example.com", "name": "Hana"})
    assert client.post("/api/auth/google-login", json={"credential": "t"}).status_code == 200
    code = SENT_CODES["hana@example.com"]
    wrong = "000000" if code != "000000" else "111111"
    res = client.post("/api/auth/verify-google-otp", json={"email": "hana@example.com", "otp": wrong})
    assert res.status_code == 401 and "4 attempts left" in res.json()["detail"]
    ok = client.post("/api/auth/verify-google-otp", json={"email": "hana@example.com", "otp": code})
    assert ok.status_code == 200 and ok.json()["token"]
    again = client.post("/api/auth/verify-google-otp", json={"email": "hana@example.com", "otp": code})
    assert again.status_code == 400  # single use


def test_server_errors_keep_cors_headers_so_browsers_show_the_real_status():
    from fastapi.testclient import TestClient as _TC
    import main as _main

    @_main.app.get("/api/_test_boom")
    async def _boom():
        raise RuntimeError("boom")

    c = _TC(_main.app, raise_server_exceptions=False)
    ok = c.get("/api/_test_boom", headers={"Origin": "http://localhost:5173"})
    assert ok.status_code == 500 and ok.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert "boom" not in ok.text
    evil = c.get("/api/_test_boom", headers={"Origin": "https://evil.example"})
    assert "access-control-allow-origin" not in evil.headers


def test_forum_replies_and_stats_use_few_queries():
    from sqlalchemy import event
    from app.models.models import ForumCategory
    a = register("fiona@example.com").json()["token"]
    b = register("gus@example.com").json()["token"]
    db = database.SessionLocal(); cat = ForumCategory(name="Speed"); db.add(cat); db.commit(); cid = cat.id; db.close()
    did = client.post("/api/forum/discussions", json={"title": "Fast forum", "content": "Body text", "category_id": cid}, headers=auth(a)).json()["id"]
    for i in range(6):
        client.post(f"/api/forum/discussions/{did}/replies", json={"content": f"reply {i}"}, headers=auth(b if i % 2 else a))

    statements = []
    listener = lambda *args: statements.append(1)
    event.listen(database.engine, "before_cursor_execute", listener)
    try:
        first = client.get(f"/api/forum/discussions/{did}/replies", headers=auth(b))
    finally:
        event.remove(database.engine, "before_cursor_execute", listener)
    assert first.status_code == 200 and len(first.json()) == 6
    assert len(statements) <= 12, f"{len(statements)} queries for 6 replies"
    views_after_first = [r["views"] for r in first.json()]
    again = client.get(f"/api/forum/discussions/{did}/replies", headers=auth(b)).json()
    assert [r["views"] for r in again] == views_after_first  # one view per user

    stats = client.get("/api/forum/stats", headers=auth(a)).json()
    assert stats["total_discussions"] >= 1 and stats["total_replies"] >= 6


def test_admin_lists_use_a_fixed_number_of_queries():
    from sqlalchemy import event
    from app.models.models import User, UserActivity, ForumCategory
    from app.core.security import create_access_token
    admin = register("ivan.admin@example.com").json()["token"]
    db = database.SessionLocal()
    db.query(User).filter(User.email == "ivan.admin@example.com").update({"is_admin": True})
    members = []
    for i in range(5):  # created directly: the signup rate limit allows only a few per test
        u = User(name="Test User", email=f"member{i}@example.com", phone="", password_hash="x",
                 location="", language="en", community_type="general")
        db.add(u); db.flush()
        members.append({"user": {"id": u.id}, "token": create_access_token({"sub": u.email})})
        for k in range(4):
            db.add(UserActivity(user_id=u.id, activity_type="resource_view", activity_title=f"View {k}"))
    cat = ForumCategory(name="Admin speed"); db.add(cat); db.commit(); cid = cat.id; db.close()
    for m in members:
        client.post("/api/forum/discussions", json={"title": "Question here", "content": "Body", "category_id": cid}, headers=auth(m["token"]))

    for path, check in (
        ("/api/admin/activities", lambda b: len(b) >= 20 and all(a["user_name"] == "Test User" for a in b[:20])),
        ("/api/admin/forum/discussions", lambda b: len(b) >= 5 and any(d["category_name"] == "Admin speed" for d in b)),
        ("/api/admin/stats", lambda b: b["totalUsers"] >= 6 and b["activeUsers"] >= 6),
        ("/api/admin/enrollments", lambda b: isinstance(b, list)),
        ("/api/admin/queries", lambda b: isinstance(b, list)),
    ):
        statements = []
        listener = lambda *args: statements.append(1)
        event.listen(database.engine, "before_cursor_execute", listener)
        try:
            res = client.get(path, headers=auth(admin))
        finally:
            event.remove(database.engine, "before_cursor_execute", listener)
        assert res.status_code == 200, (path, res.text)
        assert check(res.json()), path
        assert len(statements) <= 6, f"{path}: {len(statements)} queries"


def test_driver_panic_becomes_json_500_with_cors():
    # pyo3's PanicException (raised when the Rust Turso driver panics) derives
    # from BaseException, not Exception, so it used to skip every handler.
    from fastapi.testclient import TestClient as _TC
    import main as _main

    class FakePanic(BaseException):
        pass

    @_main.app.get("/api/_test_panic")
    async def _panic():
        raise FakePanic("already borrowed")

    c = _TC(_main.app, raise_server_exceptions=False)
    r = c.get("/api/_test_panic", headers={"Origin": "https://communityai.co.in"})
    assert r.status_code == 500
    assert r.json()["detail"].startswith("Something went wrong")
    assert r.headers.get("access-control-allow-origin") == "https://communityai.co.in"
    assert "already borrowed" not in r.text
    assert c.get("/health").status_code == 200  # app keeps working afterwards


def test_admin_overview_is_one_request_cached_and_cleared_by_writes():
    from sqlalchemy import event
    from app.api import admin as admin_api
    from app.models.models import User
    token = register("olive.admin@example.com").json()["token"]
    assert client.get("/api/admin/overview", headers=auth(token)).status_code == 403
    db = database.SessionLocal()
    db.query(User).filter(User.email == "olive.admin@example.com").update({"is_admin": True})
    db.commit(); db.close()

    def statements_for(url):
        statements = []
        listener = lambda *args: statements.append(1)
        event.listen(database.engine, "before_cursor_execute", listener)
        try:
            res = client.get(url, headers=auth(token))
        finally:
            event.remove(database.engine, "before_cursor_execute", listener)
        assert res.status_code == 200, res.text
        return res.json(), len(statements)

    admin_api._overview_cache["data"] = None
    body, first = statements_for("/api/admin/overview")
    assert set(body) == {"stats", "users", "queries", "feedback", "resources", "platforms", "discussions", "activities", "categories"}
    assert body["stats"]["totalUsers"] >= 1 and len(body["users"]) >= 1
    assert first <= 16, f"{first} queries"
    _, cached = statements_for("/api/admin/overview")
    assert cached <= 1  # only the login check
    _, fresh = statements_for("/api/admin/overview?refresh=true")
    assert fresh > cached

    client.post("/api/admin/queries/bulk-delete", json={"ids": []}, headers=auth(token))
    assert admin_api._overview_cache["data"] is None  # any admin write clears it

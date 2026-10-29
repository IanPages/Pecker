import httpx
import pytest
from types import SimpleNamespace
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from supabase_auth.errors import AuthApiError

from app.core.auth import get_current_user

CREDENTIALS = HTTPAuthorizationCredentials(scheme="Bearer", credentials="token")
USER = SimpleNamespace(user=SimpleNamespace(id="user-1", email="test@pecker.dev", app_metadata={}))

class FakeAuth:
    "Returns (or raises) each queued result in order, one per get_user call"
    def __init__(self, *results):
        self.results = list(results)
        self.calls = 0

    def get_user(self, token):
        self.calls += 1
        result = self.results.pop(0)
        if isinstance(result, Exception):
            raise result
        return result

@pytest.fixture
def fake_auth(monkeypatch):
    def install(*results):
        auth = FakeAuth(*results)
        monkeypatch.setattr("app.core.auth.supabase", SimpleNamespace(auth=auth))
        return auth
    return install

def test_valid_token(fake_auth):
    fake_auth(USER)
    assert get_current_user(CREDENTIALS)["id"] == "user-1"

def test_dropped_connection_retries_once(fake_auth):
    auth = fake_auth(httpx.RemoteProtocolError("Server disconnected"), USER)

    assert get_current_user(CREDENTIALS)["id"] == "user-1"
    assert auth.calls == 2

def test_supabase_unreachable_is_503_not_401(fake_auth):
    fake_auth(httpx.ConnectError("down"), httpx.ConnectError("down"))

    with pytest.raises(HTTPException) as e:
        get_current_user(CREDENTIALS)
    assert e.value.status_code == 503

def test_invalid_token_is_401(fake_auth):
    auth = fake_auth(AuthApiError("invalid JWT", 401, None))

    with pytest.raises(HTTPException) as e:
        get_current_user(CREDENTIALS)
    assert e.value.status_code == 401
    #A rejected token is not retried
    assert auth.calls == 1

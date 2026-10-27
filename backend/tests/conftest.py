import os

os.environ.setdefault("SUPABASE_URL", "http://localhost:54321")
os.environ.setdefault("SUPABASE_KEY", "fake-key-donette")

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.auth import get_current_user

FAKE_USER = {"id": "user-1", "email": "test@pecker.dev"}

class FakeQuery:
    "Clone any Supabase query for correct testing"
    def __init__(self,table, data):
        self.table= table
        self.data = data
        self.calls = []

    def __getattr__(self,method):
        def chain(*args, **kwargs):
            self.calls.append((method,args))
            return self
        return chain
    def execute(self):
        return self
    
class FakeSupabase:
    def __init__(self):
        self.tables={}
        self.queries= []

    def table(self, name):
        query= FakeQuery(name, self.tables.get(name,[]))
        self.queries.append(query)
        return query
    

@pytest.fixture
def fake_db(monkeypatch):
    db = FakeSupabase()
    for router in ("goals","records","categories"):
        monkeypatch.setattr(f"app.routers.{router}.supabase",db)
    return db
@pytest.fixture
def client(fake_db):
    app.dependency_overrides[get_current_user]= lambda: FAKE_USER
    yield TestClient(app)
    app.dependency_overrides.clear()
    
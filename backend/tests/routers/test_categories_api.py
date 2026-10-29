from fastapi.testclient import TestClient
from app.main import app
from app.core.auth import get_current_user

ADMIN_USER = {"id": "admin-1", "email": "owner@pecker.dev", "role": "admin"}
NEW_CATEGORY = {"name": "Study", "color": "ff0000"}

def test_list_categories_without_token(fake_db):
    r = TestClient(app).get("/categories/")
    assert r.status_code == 401

def test_list_categories_logged_user(client, fake_db):
    fake_db.tables["categories"] = [{"id": "c1", "name": "Study"}]

    r = client.get("/categories/")

    assert r.status_code == 200
    assert r.json()[0]["name"] == "Study"

def test_create_category_non_admin_forbidden(client, fake_db):
    r = client.post("/categories/", json=NEW_CATEGORY)

    assert r.status_code == 403
    #Never reaches the DB
    assert fake_db.queries == []

def test_update_and_delete_non_admin_forbidden(client, fake_db):
    category_id = "00000000-0000-0000-0000-000000000001"

    assert client.put(f"/categories/{category_id}", json={"name": "X"}).status_code == 403
    assert client.delete(f"/categories/{category_id}").status_code == 403
    assert fake_db.queries == []

def test_create_category_admin(client, fake_db):
    app.dependency_overrides[get_current_user] = lambda: ADMIN_USER
    fake_db.tables["categories"] = [{"id": "c1", **NEW_CATEGORY}]

    r = client.post("/categories/", json=NEW_CATEGORY)

    assert r.status_code == 201
    assert r.json()["data"][0]["name"] == "Study"

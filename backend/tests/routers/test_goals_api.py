from fastapi.testclient import TestClient
from app.main import app

def test_list_goals_progress_sum(client, fake_db):
    #Fake query for the DB
    fake_db.tables["goals"]=[{"id": "g1", "name": "Read"}]
    fake_db.tables["records"]= [
        {"goal_id": "g1", "date": "2026-01-02", "duration_minutes": 30},
        {"goal_id": "g1", "date": "2026-01-05", "duration_minutes": 50},
    ]
    #Action
    r = client.get("/goals/")
    #Assert the results
    assert r.status_code == 200
    goal = r.json()[0]
    assert goal["logged_minutes"] == 80
    assert goal["last_record_date"] == "2026-01-05"
    #Security filter for userid
    assert ("eq", ("user_id", "user-1")) in fake_db.queries[0].calls

def test_list_goals_without_token(fake_db):
    r = TestClient(app).get("/goals/")
    assert r.status_code == 401
    assert r.json() == {'detail': 'Not authenticated'}

def test_list_goals_empty(client,fake_db):
    r = client.get("/goals/")

    assert ("eq", ("status", "active")) not in fake_db.queries[0].calls
    assert r.status_code == 200
    assert r.json() == []

def test_get_goals_status_filter(client,fake_db):

    r = client.get("/goals/?status=active")

    assert r.status_code == 200
    assert ("eq", ("status", "active")) in fake_db.queries[0].calls

def test_list_non_existent_goal(client):
    r = client.get("/goals/7c9e6679-7425-40de-944b-e07fc1f99a5a")

    assert r.status_code == 404
    assert r.json() == {"detail": "No goal found"}

def test_records_by_goals(client,fake_db):

    fake_db.tables["goals"]=[{"id": "g1", "name": "Read"}]
    fake_db.tables["records"]= [
        {"goal_id": "g1", "date": "2026-01-02", "duration_minutes": 30},
        {"goal_id": "g1", "date": "2026-01-05", "duration_minutes": 50},
    ]

    r = client.get("/goals/7c9e6679-7425-40de-944b-e07fc1f99a5a/records")

    assert r.status_code == 200
    assert ('eq', ('user_id', 'user-1')) in fake_db.queries[0].calls
    assert r.json() == fake_db.tables["records"]

def test_records_by_other_user_goal(client,fake_db):

    r = client.get("/goals/7c9e6679-7425-40de-944b-e07fc1f99a5a/records")

    assert r.status_code == 404
    assert ('eq' , ('user_id','user-1')) in fake_db.queries[0].calls
    assert r.json() == {'detail': 'No goal found'}


def test_create_goal(client,fake_db):

    fake_db.tables["goals"] = [{"id": "g1", "name": "Read"}]

    r = client.post("/goals/", json={
        "name": "Read",
        "target_minutes": 600,
        "start_date": "2026-01-01"
    })

    assert r.status_code == 201 
    assert r.json()["message"] == "Goal created successfully" 
    insert = fake_db.queries[0].calls[0]   # ("insert", (payload,))
    assert insert[0] == "insert"
    assert insert[1][0]["user_id"] == "user-1"

def test_empty_name_goal(client):

    r = client.post("/goals/", json={
        "name": "",
        "target_minutes": 600,
        "start_date": "2026-01-01"
    })

    assert r.status_code == 422
    error = r.json()["detail"][0]
    assert error["loc"] == ["body", "name"]
    assert error["type"] == "string_too_short"

def test_edit_empty_goal(client):
    r = client.put("/goals/7c9e6679-7425-40de-944b-e07fc1f99a5a", json={})

    
    assert r.status_code == 400
    assert r.json() == {"detail": "No valid data provided to update"}

def test_update_filters_by_user(client,fake_db):
    fake_db.tables["goals"] = [{"id": "g1", "name": "Read"}]

    r = client.put("/goals/7c9e6679-7425-40de-944b-e07fc1f99a5a", json={"name": "READ"})

    assert ("update", ({"name": "READ"},)) in fake_db.queries[0].calls
    assert r.status_code == 200
    assert r.json()["message"] == 'Goal updated successfully'
    assert ('eq', ('user_id', 'user-1')) in fake_db.queries[0].calls

def test_delete_user_id_verification(client,fake_db):
    fake_db.tables["goals"] = [{"id": "g1", "name": "Read"}]

    r = client.delete("/goals/7c9e6679-7425-40de-944b-e07fc1f99a5a")

    assert r.status_code == 200
    assert r.json()["message"] == 'Goal deleted successfully'
    assert ('eq', ('user_id', 'user-1')) in fake_db.queries[0].calls

def test_delete_non_existent_goal(client):

    r = client.delete("/goals/7c9e6679-7425-40de-944b-e07fc1f99a5a")

    assert r.status_code == 404
    assert r.json() == {"detail": "No goal found"}


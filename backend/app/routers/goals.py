from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.db.supabase import supabase
from app.schemas.goalsSchema import GoalCreate, GoalUpdate, GoalStatus
from app.core.auth import get_current_user

router = APIRouter(
    prefix="/goals",
    tags=["Goals"]
)

GOAL_SELECT = "*, categories(name, color)"

def with_progress(goals: list[dict]) -> list[dict]:
    """Adds logged_minutes, records_count and last_record_date to each goal from its linked records"""
    if not goals:
        return goals
    rows = (
        supabase.table("records").select("goal_id,date,duration_minutes")
        .in_("goal_id", [g["id"] for g in goals])
        .execute().data
    )
    progress = {g["id"]: {"logged_minutes": 0, "records_count": 0, "last_record_date": None} for g in goals}
    for r in rows:
        p = progress[r["goal_id"]]
        p["logged_minutes"] += r["duration_minutes"] or 0
        p["records_count"] += 1
        if not p["last_record_date"] or r["date"] > p["last_record_date"]:
            p["last_record_date"] = r["date"]
    return [{**g, **progress[g["id"]]} for g in goals]

def get_owned_goal(id: UUID, user_id: str) -> dict:
    response = supabase.table("goals").select(GOAL_SELECT).eq("id", id).eq("user_id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No goal found")
    return response.data[0]

@router.get("/", response_model=List[dict])
async def list_goals(status_filter: Optional[GoalStatus] = Query(None, alias="status"), user: dict = Depends(get_current_user)):
    query = supabase.table("goals").select(GOAL_SELECT).eq("user_id", user["id"]).order("created_at", desc=True)
    if status_filter:
        query = query.eq("status", status_filter)
    return with_progress(query.execute().data)  # an empty list is fine, the UI shows an empty state

@router.get("/{id}", response_model=dict)
async def get_goal(id: UUID, user: dict = Depends(get_current_user)):
    return with_progress([get_owned_goal(id, user["id"])])[0]

@router.get("/{id}/records", response_model=List[dict])
async def get_goal_records(id: UUID, user: dict = Depends(get_current_user)):
    get_owned_goal(id, user["id"])
    response = (
        supabase.table("records").select("*, categories(name, color)")
        .eq("goal_id", id).eq("user_id", user["id"])
        .order("start_hour", desc=True)
        .execute()
    )
    return response.data

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_goal(goal_data: GoalCreate, user: dict = Depends(get_current_user)):
    payload = goal_data.model_dump(mode="json", exclude_unset=True)
    payload["user_id"] = user["id"]
    payload["created_at"] = datetime.now().isoformat()

    response = supabase.table("goals").insert(payload).execute()

    if not response.data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not create the goal")
    return {"message": "Goal created successfully", "data": response.data}

@router.put("/{id}", response_model=dict)
async def update_goal(id: UUID, goal_data: GoalUpdate, user: dict = Depends(get_current_user)):
    json_schema = goal_data.model_dump(mode="json", exclude_unset=True)

    if not json_schema:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid data provided to update")

    response = supabase.table("goals").update(json_schema).eq("id", id).eq("user_id", user["id"]).execute()

    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No goal found")
    return {"message": "Goal updated successfully", "data": response.data}

@router.delete("/{id}", response_model=dict)
async def delete_goal(id: UUID, user: dict = Depends(get_current_user)):
    response = supabase.table("goals").delete().eq("id", id).eq("user_id", user["id"]).execute()

    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No goal found")
    return {"message": "Goal deleted successfully", "data": response.data}

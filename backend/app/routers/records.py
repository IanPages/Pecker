from h11._abnf import status_code
from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List
from uuid import UUID
from datetime import date, datetime, timedelta, timezone

from app.db.supabase import supabase
from app.schemas.recordsSchema import RecordCreate,RecordResponse,RecordUpdate
from app.core.auth import get_current_user

router = APIRouter(
    prefix="/records",
    tags=["Records"]
)

def ensure_goal_owned(goal_id: str | None, user_id: str):
    """The FK only checks the goal exists, not that it belongs to the user"""
    if goal_id and not supabase.table("goals").select("id").eq("id", goal_id).eq("user_id", user_id).execute().data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid goal")

def ensure_no_overlap(start: str, finish: str, user_id: str, exclude_id: UUID | None = None):
    """Strict comparisons so back-to-back records (one ends 11:00, next starts 11:00) are allowed"""
    query = (
        supabase.table("records").select("id").eq("user_id", user_id)
        .lt("start_hour", finish).gt("finish_hour", start)
    )
    if exclude_id:
        query = query.neq("id", str(exclude_id))
    if query.limit(1).execute().data:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="There is already a record in that time range")


@router.get("/user", response_model=List[dict])
async def get_user_records(user: dict = Depends(get_current_user)):

    query = supabase.table("records").select("*").eq("user_id", user["id"])

    response = query.execute()

    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No records found")
    return response.data

@router.get("/weekly/{start_date}/{end_date}", response_model=List[dict])
async def get_user_weekly_records(start_date: date, end_date: date, user: dict = Depends(get_current_user)):
    query = supabase.table("records").select("*, categories(name, color)").eq("user_id", user["id"]).gte("date", start_date).lte("date", end_date)
    response = query.execute()
    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No records found")
    return response.data



@router.get("/stats", response_model=dict)
async def get_stats(today: date, user: dict = Depends(get_current_user)):
    
    week_start = today - timedelta(days=today.weekday())
    last_week_start = week_start - timedelta(days=7)
    week_end = week_start + timedelta(days=6)

    rows = (
        supabase.table("records").select("date,duration_minutes,categories(name,color)")
        .eq("user_id", user["id"])
        .gte("date", last_week_start.isoformat()).lte("date", week_end.isoformat())
        .execute().data
    )

    minutes_by_day: dict[date, int] = {}
    by_category: dict[str, dict] = {}  # this week only, keyed by category name
    for r in rows:
        d = date.fromisoformat(r["date"])
        minutes = r["duration_minutes"] or 0
        minutes_by_day[d] = minutes_by_day.get(d, 0) + minutes
        if d >= week_start:
            cat = r["categories"] or {"name": "Uncategorised", "color": None}
            entry = by_category.setdefault(cat["name"], {"name": cat["name"], "color": cat["color"], "minutes": 0})
            entry["minutes"] += minutes

    days = [{"date": (week_start + timedelta(days=i)).isoformat(),
             "minutes": minutes_by_day.get(week_start + timedelta(days=i), 0)} for i in range(7)]
    week_minutes = sum(d["minutes"] for d in days)
    last_week_minutes = sum(minutes_by_day.get(last_week_start + timedelta(days=i), 0) for i in range(7))
    change_pct = round((week_minutes - last_week_minutes) / last_week_minutes * 100) if last_week_minutes else None

    best = max(days, key=lambda d: d["minutes"])
    elapsed = today.weekday() + 1  # days of this week up to and including today

    # shortcut: Supabase returns at most 1000 rows, so streaks beyond that many records are capped
    dates = (
        supabase.table("records").select("date").eq("user_id", user["id"])
        .lte("date", today.isoformat()).order("date", desc=True)
        .execute().data
    )
    tracked = {date.fromisoformat(r["date"]) for r in dates}
    # a streak is still alive if today has no record yet but yesterday does
    cursor = today if today in tracked else today - timedelta(days=1)
    streak = 0
    while cursor in tracked:
        streak += 1
        cursor -= timedelta(days=1)

    return {
        "streak": streak,
        "week_minutes": week_minutes,
        "last_week_minutes": last_week_minutes,
        "change_pct": change_pct,
        "daily_avg_minutes": round(sum(d["minutes"] for d in days[:elapsed]) / elapsed),
        "best_day": best["date"] if best["minutes"] else None,
        "days": days,
        "by_category": sorted(by_category.values(), key=lambda c: c["minutes"], reverse=True),
    }

@router.get("/recent", response_model=List[dict])
async def get_recent_records(limit: int = Query(5, ge=1, le=50), user: dict = Depends(get_current_user)):
    #Fetch from foreign table categories to retrieve its RGB # color
    response = (
        supabase.table("records").select("*, categories(name, color)")
        .eq("user_id", user["id"])
        .lte("start_hour", datetime.now(timezone.utc).isoformat())
        .order("start_hour", desc=True).limit(limit)
        .execute()
    )
    return response.data  # an empty list is fine here, unlike the 404s above

@router.get("/{id}", response_model=List[dict])
async def get_record_by_id(id: UUID, user: dict = Depends(get_current_user)):
    query = supabase.table("records").select("*").eq("id", id).eq("user_id", user["id"])
    response = query.execute()

    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No record found")

    return response.data

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_record(record_data: RecordCreate, user: dict = Depends(get_current_user)):

    # user_id and created_at are not part of RecordCreate, so they go into the payload, not the model
    payload = record_data.model_dump(mode="json", exclude_unset=True)
    payload["user_id"] = user["id"]
    payload["created_at"] = datetime.now().isoformat()
    ensure_goal_owned(payload.get("goal_id"), user["id"])
    ensure_no_overlap(payload["start_hour"], payload["finish_hour"], user["id"])

    response = supabase.table("records").insert(payload).execute()

    if not response.data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(response.error))

    return {"message": "Record created successfully", "data": response.data}

@router.put("/{id}", response_model=dict)
async def update_record(id: UUID, record_data: RecordUpdate, user: dict = Depends(get_current_user)):
    json_schema = record_data.model_dump(mode="json", exclude_unset=True)
    
    if not json_schema:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid data provided to update")
    ensure_goal_owned(json_schema.get("goal_id"), user["id"])

    if "start_hour" in json_schema or "finish_hour" in json_schema:
        # the update may carry only one of the two hours, so fill the other from the stored record
        current = supabase.table("records").select("start_hour,finish_hour").eq("id", id).eq("user_id", user["id"]).execute().data
        if not current:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No record found")
        start = json_schema.get("start_hour", current[0]["start_hour"])
        finish = json_schema.get("finish_hour", current[0]["finish_hour"])
        ensure_no_overlap(start, finish, user["id"], exclude_id=id)

    query = supabase.table("records").update(json_schema).eq("id", id).eq("user_id", user["id"])
    response = query.execute()

    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No record found")
    return {"message": "Record updated successfully", "data": response.data}

@router.delete("/{id}", response_model=dict)
async def delete_record(id: UUID, user: dict = Depends(get_current_user)):
    query = supabase.table("records").delete().eq("id", id).eq("user_id", user["id"])
    response = query.execute()

    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No record found")
    return {"message": "Record deleted successfully", "data": response.data}

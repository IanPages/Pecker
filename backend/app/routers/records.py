from h11._abnf import status_code
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from datetime import date, datetime

from app.db.supabase import supabase
from app.schemas.recordsSchema import RecordCreate,RecordResponse,RecordUpdate
from app.core.auth import get_current_user

router = APIRouter(
    prefix="/records",
    tags=["Records"]
)

@router.get("/user", response_model=List[dict])
async def get_user_records(user: dict = Depends(get_current_user)):

    query = supabase.table("records").select("*").eq("user_id", user["id"])

    response = query.execute()

    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No records found")
    return response.data

@router.get("/weekly/{start_date}/{end_date}", response_model=List[dict])
async def get_user_weekly_records(start_date: date, end_date: date, user: dict = Depends(get_current_user)):
    query = supabase.table("records").select("*").eq("user_id", user["id"]).gte("date", start_date).lte("date", end_date)
    response = query.execute()
    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No records found")
    return response.data


@router.get("/{id}", response_model=List[dict])
async def get_record_by_id(id: UUID):
    query = supabase.table("records").select("*").eq("id", id)
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

    response = supabase.table("records").insert(payload).execute()

    if not response.data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(response.error))

    return {"message": "Record created successfully", "data": response.data}

@router.put("/{id}", response_model=List[dict])
async def update_record(id: UUID, record_data: RecordUpdate):
    json_schema = record_data.model_dump(mode="json", exclude_unset=True)
    
    if not json_schema:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid data provided to update")

    query = supabase.table("records").update(json_schema).eq("id", id)
    response = query.execute()

    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No record found")
    return {"message": "Record updated successfully", "data": response.data}

@router.delete("/{id}", response_model=List[dict])
async def delete_record(id: UUID):
    query = supabase.table("records").delete().eq("id", id)
    response = query.execute()

    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No record found")
    return {"message": "Record deleted successfully", "data": response.data}

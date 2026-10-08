from h11._abnf import status_code
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID

from app.db.supabase import supabase
from app.schemas.recordsSchema import RecordCreate,RecordResponse,RecordUpdate
from app.core.auth import get_current_user

router = APIRouter(
    prefix="/records",
    tags=["Records"]
)

@router.get("/{id}", response_model=List[dict])
async def get_user_records(id: UUID):
    
    query = supabase.table("records").select("*").eq("user_id",id)

    response = query.execute()

    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No records found")
    return response.data

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_record(record_data: dict):
    """Crea un nuevo registro de tiempo asociado al usuario y a una categoría global."""
    return {"message": "Registro guardado", "data": record_data}

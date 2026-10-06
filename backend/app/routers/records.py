from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.core.auth import get_current_user

router = APIRouter(
    prefix="/records",
    tags=["Records"]
)

@router.get("/", response_model=List[dict])
async def get_user_records():
    """Obtiene los registros del usuario autenticado."""
    return []

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_record(record_data: dict):
    """Crea un nuevo registro de tiempo asociado al usuario y a una categoría global."""
    return {"message": "Registro guardado", "data": record_data}

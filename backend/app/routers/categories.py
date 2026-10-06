from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)

@router.get("/", response_model=List[dict])
async def list_categories():
    """Obtiene el catálogo general de categorías."""
    #TRIAL WITH MOCKED DATA
    return [{"id": 1, "name": "Trabajo"}, {"id": 2, "name": "Ocio"}]

# Opcional: Endpoint protegido o de admin para que puedas crearlas
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_category(category_data: dict):
    """Crea una nueva categoría en el catálogo global."""
    return {"message": "Categoría creada con éxito", "data": category_data}
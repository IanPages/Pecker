from datetime import datetime
from fastapi import responses
from pydantic import json_schema
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID

from app.db.supabase import supabase
from app.schemas.categoriesSchema import CategoryCreate,CategoryUpdate

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)

@router.get("/", response_model=List[dict])
async def list_categories():
    query = supabase.table("categories").select("*")   
    response = query.execute()
    
    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No categories found")
    return response.data 


@router.get("/{id}", response_model=List[dict])
async def list_category_by_id(id:UUID):
    query = supabase.table("categories").select("*").eq("id", id)
    response = query.execute()
    
    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No category found")
    return response.data

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_category(category_data: CategoryCreate):

    category_data.created_at = datetime.now()
    json_schema = category_data.model_dump(mode="json")

    query = supabase.table("categories").insert(json_schema)

    response = query.execute()
    
    if not response.data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(response.error))
    
    return {"message": "Category created successfully", "data": response.data}

@router.put("/{id}",response_model=dict)
async def update_category(id:UUID, category_data: CategoryUpdate):
    json_schema = category_data.model_dump(mode="json")
    query = supabase.table("categories").update(json_schema).eq("id", id)
    response = query.execute()
    
    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No category found")
    return {"message": "Category updated successfully", "data": response.data}


@router.delete("/{id}",response_model=dict)
async def delete_category(id:UUID):
    query = supabase.table("categories").delete().eq("id", id)
    response = query.execute()
    
    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No category found")
    return {"message": "Category deleted successfully", "data": response.data}
from pydantic import BaseModel, Field, field_validator
from datetime import date, datetime
from typing import Optional
from uuid import UUID

class CategoryCreate(BaseModel):
    name: str=Field(min_length=1,max_length=80)
    color: str=Field(min_length=6,max_length=6)
    created_at: Optional[datetime]=None

class CategoryResponse(CategoryCreate):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class CategoryOverview(BaseModel):
    category_id: Optional[UUID]
    category_name: Optional[str]
    color: Optional[str]
    total_hours: float
    total_records: int

class CategoryUpdate(BaseModel):
    name: Optional[str]=None
    color: Optional[str]=None


from pydantic import BaseModel, Field, field_validator
from datetime import date as Date, datetime
from typing import Optional
from uuid import UUID

class RecordCreate(BaseModel):
    name: str=Field(min_length=1,max_length=255)
    category_id: Optional[UUID]=None
    goal_id: Optional[UUID]=None
    date: Date
    start_hour: datetime
    finish_hour: datetime
    notes: Optional[str]=None

    #Validación de modelo de hora
    @field_validator("finish_hour")
    @classmethod
    def validate_hours(cls, finish_hour: datetime, info):
        """Garantiza que la hora de fin sea estrictamente posterior a la de inicio"""
        start_hour = info.data.get("start_hour")
        if start_hour and finish_hour <= start_hour:
            raise ValueError("finish_hour debe ser posterior a start_hour")
        return finish_hour

class RecordResponse(RecordCreate):
    id:UUID
    user_id:UUID
    duration_minutes:int
    created_at: datetime

    class Config:
        from_attributes = True

class RecordUpdate(BaseModel):
    name: Optional[str]=Field(default=None,min_length=1,max_length=120)
    category_id: Optional[UUID]= None
    goal_id: Optional[UUID]=None
    date: Optional[Date]= None
    start_hour: Optional[datetime]= None
    finish_hour: Optional[datetime]= None
    notes: Optional[str]= None

    @field_validator("finish_hour")
    @classmethod
    def validate_hours(cls, finish_hour: datetime, info):
        """Garantiza que la hora de fin sea estrictamente posterior a la de inicio"""
        start_hour = info.data.get("start_hour")
        if start_hour and finish_hour <= start_hour:
            raise ValueError("finish_hour debe ser posterior a start_hour")
        return finish_hour
      
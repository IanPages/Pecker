from pydantic import BaseModel, Field, model_validator
from datetime import date as Date
from typing import Literal, Optional
from uuid import UUID

GoalStatus = Literal["active", "completed", "archived"]

class GoalCreate(BaseModel):
    name: str=Field(min_length=1,max_length=120)
    description: Optional[str]=None
    target_minutes: int=Field(gt=0)
    category_id: Optional[UUID]=None
    start_date: Date
    deadline: Optional[Date]=None

    @model_validator(mode="after")
    def validate_dates(self):
        """Garantiza que el deadline no sea anterior a la fecha de inicio"""
        if self.deadline and self.deadline <= self.start_date:
            raise ValueError("deadline no puede ser anterior o igual a start_date")
        return self

class GoalUpdate(BaseModel):
    name: Optional[str]=Field(default=None,min_length=1,max_length=255)
    description: Optional[str]=None
    target_minutes: Optional[int]=Field(default=None,gt=0)
    category_id: Optional[UUID]=None
    start_date: Optional[Date]=None
    deadline: Optional[Date]=None
    status: Optional[GoalStatus]=None

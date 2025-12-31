from pydantic import BaseModel
from typing import Optional, List
from app.models.child import AgeGroup

class ChildBase(BaseModel):
    name: str
    age_group: str
    vision_status: str = "blind"

class ChildCreate(ChildBase):
    pass

class Child(ChildBase):
    id: int
    parent_id: int
    
    class Config:
        from_attributes = True

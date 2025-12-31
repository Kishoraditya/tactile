from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    # children: List[Child] = [] # Avoid circular import for now

    class Config:
        from_attributes = True

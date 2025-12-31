from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class SessionBase(BaseModel):
    duration_seconds: int
    completed: bool

class SessionCreate(SessionBase):
    pass

class Session(SessionBase):
    id: int
    child_id: int
    start_time: datetime
    date: date

    class Config:
        from_attributes = True

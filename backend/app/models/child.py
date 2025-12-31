from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class AgeGroup(str, enum.Enum):
    GROUP_A = "1-4"
    GROUP_B = "5-11"
    GROUP_C = "12-18"

class Child(Base):
    __tablename__ = "children"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    age_group = Column(String) # Stored as string, using AgeGroup enum in logic
    vision_status = Column(String, default="blind") # blind, low-vision, sighted
    parent_id = Column(Integer, ForeignKey("users.id"))

    parent = relationship("User", back_populates="children")
    sessions = relationship("BrushingSession", back_populates="child")

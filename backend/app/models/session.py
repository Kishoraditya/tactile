from sqlalchemy import Column, Integer, DateTime, ForeignKey, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class BrushingSession(Base):
    __tablename__ = "brushing_sessions"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"))
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    duration_seconds = Column(Integer)
    completed = Column(Boolean, default=False)
    date = Column(Date, server_default=func.current_date())

    child = relationship("Child", back_populates="sessions")

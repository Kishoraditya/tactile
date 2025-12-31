from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import crud, models, schemas
from app.database import get_db

router = APIRouter(
    prefix="/sessions",
    tags=["sessions"],
)

@router.post("/{child_id}", response_model=schemas.session.Session)
def create_session_for_child(
    child_id: int, session: schemas.session.SessionCreate, db: Session = Depends(get_db)
):
    return crud.create_session(db=db, session=session, child_id=child_id)

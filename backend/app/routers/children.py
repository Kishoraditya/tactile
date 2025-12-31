from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import crud, models, schemas
from app.database import get_db

router = APIRouter(
    prefix="/children",
    tags=["children"],
)

# TODO: Add authentication dependency
USER_ID_MOCK = 1

@router.post("/", response_model=schemas.child.Child)
def create_child_for_user(
    child: schemas.child.ChildCreate, db: Session = Depends(get_db)
):
    return crud.create_user_child(db=db, child=child, user_id=USER_ID_MOCK)

@router.get("/", response_model=List[schemas.child.Child])
def read_children(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    children = crud.get_children(db, user_id=USER_ID_MOCK, skip=skip, limit=limit)
    return children

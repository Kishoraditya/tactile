from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.database import get_db

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.post("/", response_model=schemas.user.User)
def create_user(user: schemas.user.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

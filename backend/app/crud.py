from sqlalchemy.orm import Session
from app.models import user, child, session
from app.schemas import user as user_schema
from app.schemas import child as child_schema
from app.schemas import session as session_schema
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_email(db: Session, email: str):
    return db.query(user.User).filter(user.User.email == email).first()

def create_user(db: Session, user: user_schema.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = user.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_children(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(child.Child).filter(child.Child.parent_id == user_id).offset(skip).limit(limit).all()

def create_user_child(db: Session, child: child_schema.ChildCreate, user_id: int):
    db_child = child.Child(**child.model_dump(), parent_id=user_id)
    db.add(db_child)
    db.commit()
    db.refresh(db_child)
    return db_child

def create_session(db: Session, session: session_schema.SessionCreate, child_id: int):
    db_session = session.BrushingSession(**session.model_dump(), child_id=child_id)
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

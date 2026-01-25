from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ToothBuddy API", description="Backend for ToothBuddy App", version="0.1.0")

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database creation
from app.database import engine
from app import models
models.user.Base.metadata.create_all(bind=engine)
models.child.Base.metadata.create_all(bind=engine)
models.session.Base.metadata.create_all(bind=engine)

# Routers
from app.routers import children, sessions, users, auth
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(children.router)
app.include_router(sessions.router)
from app.routers import tts
app.include_router(tts.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to ToothBuddy API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

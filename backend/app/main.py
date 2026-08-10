"""
FastAPI application entry point.
Run with:
    uvicorn app.main:app --reload
"""
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import ping_database
from app.routers import auth, user, chat, widgets


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Confirms MongoDB is reachable when the server starts.
    try:
        await asyncio.wait_for(ping_database(), timeout=5.0)
        print("Connected to MongoDB successfully")
    except Exception as e:
        print(f"Warning: Could not connect to MongoDB on startup ({e}). Ensure MongoDB is running.")
    yield
    # (optional) place any shutdown/cleanup logic here


app = FastAPI(
    title="AI Buddy API",
    description="Backend for the AI Buddy app (Auth, Chat, Profile).",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow React frontend on localhost and network IP addresses
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(chat.router)
app.include_router(widgets.router)


@app.get("/")
async def root():
    return {"message": "AI Buddy API is running", "docs": "/docs"}


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
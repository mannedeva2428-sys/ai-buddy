"""
FastAPI application entry point.

Run with:
uvicorn app.main:app --reload
"""

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import ping_database
from app.routers import auth, user, chat, widgets, agreement
from app.routers.auth import seed_default_user


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Confirm MongoDB is reachable when the server starts.
    try:
        await asyncio.wait_for(ping_database(), timeout=5.0)
        print("Connected to MongoDB successfully")
        await seed_default_user()
    except Exception as e:
        print(
            f"Warning: Could not connect to MongoDB on startup ({e}). "
            "Ensure MongoDB is running."
        )

    yield

    # Optional shutdown/cleanup logic can go here.


app = FastAPI(
    title="AI Buddy API",
    description="Backend for the AI Buddy app (Auth, Chat, Profile).",
    version="1.0.0",
    lifespan=lifespan,
)


import os
from app.config import settings

# CORS configuration
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5176",
    "http://127.0.0.1:5176",
]
if settings.FRONTEND_URL and settings.FRONTEND_URL not in allowed_origins:
    allowed_origins.append(settings.FRONTEND_URL)

extra_origins = os.getenv("ALLOWED_ORIGINS")
if extra_origins:
    allowed_origins.extend([o.strip() for o in extra_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)(:\d+)?|https://.*\.netlify\.app|https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(chat.router)
app.include_router(widgets.router)
app.include_router(agreement.router)



@app.get("/")
async def root():
    return {
        "message": "AI Buddy API is running",
        "docs": "/docs",
    }


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
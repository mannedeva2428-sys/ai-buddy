"""
FastAPI Router for Dashboard Widgets (Tasks, Weather, Analytics, Shortcuts, Suggestions).
"""
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status

from app.database import get_database
from app.schemas.widgets import (
    TaskCreate,
    TaskUpdate,
    TaskOut,
    WeatherOut,
    AIAnalyticsOut,
    WebShortcut,
    SuggestionItem,
)
from app.utils.deps import get_optional_user

router = APIRouter(prefix="/api/widgets", tags=["Widgets"])

# In-memory / MongoDB fallback storage for tasks
DEFAULT_TASKS = [
    {"id": "t-1", "title": "Project Meeting", "time": "11:30 AM", "completed": True},
    {"id": "t-2", "title": "Research AI Trends", "time": "01:00 PM", "completed": False},
    {"id": "t-3", "title": "Design Dashboard", "time": "03:00 PM", "completed": False},
    {"id": "t-4", "title": "Client Call", "time": "05:30 PM", "completed": False},
]

DEFAULT_SHORTCUTS = [
    {"name": "YouTube", "url": "https://www.youtube.com", "keywords": ["youtube", "yt"], "icon": "📺"},
    {"name": "Spotify", "url": "https://open.spotify.com", "keywords": ["spotify", "music"], "icon": "🎵"},
    {"name": "Google", "url": "https://www.google.com", "keywords": ["google"], "icon": "🔍"},
    {"name": "Gmail", "url": "https://mail.google.com", "keywords": ["gmail"], "icon": "✉️"},
    {"name": "WhatsApp", "url": "https://web.whatsapp.com", "keywords": ["whatsapp"], "icon": "💬"},
    {"name": "GitHub", "url": "https://github.com", "keywords": ["github"], "icon": "🐙"},
    {"name": "ChatGPT", "url": "https://chatgpt.com", "keywords": ["chatgpt"], "icon": "🤖"},
]

DEFAULT_SUGGESTIONS = [
    {"id": "s-1", "title": "Write an email", "prompt": "Write a professional follow-up email for a project proposal", "category": "email"},
    {"id": "s-2", "title": "Generate images", "prompt": "Describe a futuristic 3D cyberpunk city at twilight", "category": "image"},
    {"id": "s-3", "title": "Summarize document", "prompt": "Summarize key takeaways from AI voice assistant design", "category": "summary"},
    {"id": "s-4", "title": "Explain a concept", "prompt": "Explain Quantum Computing in simple terms", "category": "concept"},
]


# ─── Tasks Endpoints ──────────────────────────────────────────
@router.get("/tasks", response_model=List[TaskOut])
async def get_tasks(user=Depends(get_optional_user)):
    db = get_database()
    if db is not None and user is not None:
        user_id = str(user.get("_id", "anonymous"))
        cursor = db.tasks.find({"user_id": user_id})
        tasks = []
        async for doc in cursor:
            tasks.append(
                TaskOut(
                    id=str(doc.get("_id")),
                    title=doc.get("title", ""),
                    time=doc.get("time", ""),
                    completed=doc.get("completed", False),
                    created_at=doc.get("created_at"),
                )
            )
        if tasks:
            return tasks

    return [TaskOut(**t) for t in DEFAULT_TASKS]


@router.post("/tasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
async def create_task(payload: TaskCreate, user=Depends(get_optional_user)):
    task_id = f"t-{uuid.uuid4().hex[:8]}"
    db = get_database()
    new_task = {
        "id": task_id,
        "title": payload.title,
        "time": payload.time or "12:00 PM",
        "completed": False,
        "created_at": datetime.utcnow(),
    }

    if db is not None and user is not None:
        new_task["user_id"] = str(user.get("_id", "anonymous"))
        res = await db.tasks.insert_one(new_task)
        new_task["id"] = str(res.inserted_id)

    return TaskOut(**new_task)


@router.patch("/tasks/{task_id}", response_model=TaskOut)
async def update_task(task_id: str, payload: TaskUpdate, user=Depends(get_optional_user)):
    db = get_database()

    # Search in default tasks first as fallback
    for t in DEFAULT_TASKS:
        if t["id"] == task_id:
            if payload.completed is not None:
                t["completed"] = payload.completed
            if payload.title is not None:
                t["title"] = payload.title
            if payload.time is not None:
                t["time"] = payload.time
            return TaskOut(**t)

    if db is not None:
        update_data = {}
        if payload.completed is not None:
            update_data["completed"] = payload.completed
        if payload.title is not None:
            update_data["title"] = payload.title
        if payload.time is not None:
            update_data["time"] = payload.time

        if update_data:
            await db.tasks.update_one({"_id": task_id}, {"$set": update_data})
            doc = await db.tasks.find_one({"_id": task_id})
            if doc:
                return TaskOut(
                    id=str(doc.get("_id")),
                    title=doc.get("title", ""),
                    time=doc.get("time", ""),
                    completed=doc.get("completed", False),
                )

    raise HTTPException(status_code=404, detail="Task not found")


@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, user=Depends(get_optional_user)):
    global DEFAULT_TASKS
    DEFAULT_TASKS = [t for t in DEFAULT_TASKS if t["id"] != task_id]

    db = get_database()
    if db is not None:
        await db.tasks.delete_one({"_id": task_id})

    return {"message": "Task deleted successfully", "id": task_id}


# ─── Weather Endpoint ─────────────────────────────────────────
@router.get("/weather", response_model=WeatherOut)
async def get_weather(city: Optional[str] = "Bangalore"):
    return WeatherOut(
        city=city or "Bangalore",
        country="India",
        temp_celsius=26,
        condition="Mostly Cloudy",
        humidity_percent=64,
        high_temp=28,
        low_temp=21,
        forecast=[
          {"day": "Mon", "temp": 24, "condition": "Sun"},
          {"day": "Tue", "temp": 26, "condition": "Sun"},
          {"day": "Wed", "temp": 23, "condition": "Cloud"},
          {"day": "Thu", "temp": 25, "condition": "Sun"},
          {"day": "Fri", "temp": 22, "condition": "Cloud"},
        ],
    )


# ─── Analytics Endpoint ───────────────────────────────────────
@router.get("/analytics", response_model=AIAnalyticsOut)
async def get_analytics():
    return AIAnalyticsOut(
        total_queries=128,
        voice_commands=32,
        today_usage_percent=78,
        avg_duration="2m 36s",
        active_connections=1,
    )


# ─── Shortcuts Endpoint ───────────────────────────────────────
@router.get("/shortcuts", response_model=List[WebShortcut])
async def get_shortcuts():
    return [WebShortcut(**s) for s in DEFAULT_SHORTCUTS]


# ─── Suggestions Endpoint ─────────────────────────────────────
@router.get("/suggestions", response_model=List[SuggestionItem])
async def get_suggestions():
    return [SuggestionItem(**s) for s in DEFAULT_SUGGESTIONS]

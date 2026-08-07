"""
Pydantic schemas for dashboard widgets (Tasks, Weather, Analytics, Shortcuts, Suggestions).
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1)
    time: Optional[str] = "12:00 PM"


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    time: Optional[str] = None
    completed: Optional[bool] = None


class TaskOut(BaseModel):
    id: str
    title: str
    time: str
    completed: bool = False
    created_at: Optional[datetime] = None


class WeatherForecastItem(BaseModel):
    day: str
    temp: int
    condition: str


class WeatherOut(BaseModel):
    city: str
    country: str
    temp_celsius: int
    condition: str
    humidity_percent: int
    high_temp: int
    low_temp: int
    forecast: List[WeatherForecastItem]


class AIAnalyticsOut(BaseModel):
    total_queries: int
    voice_commands: int
    today_usage_percent: int
    avg_duration: str
    active_connections: int


class WebShortcut(BaseModel):
    name: str
    url: str
    keywords: List[str]
    icon: Optional[str] = "🌐"


class SuggestionItem(BaseModel):
    id: str
    title: str
    prompt: str
    category: str

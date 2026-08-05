"""
Pydantic schemas for chat messages / AI conversation.
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ChatMessageCreate(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_id: Optional[str] = None


class ChatMessageOut(BaseModel):
    id: str
    conversation_id: str
    role: str  # "user" or "assistant"
    content: str
    created_at: datetime


class ConversationSummary(BaseModel):
    conversation_id: str
    title: str
    last_message: str
    updated_at: datetime

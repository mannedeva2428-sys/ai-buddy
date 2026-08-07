"""
Chat routes: send a message to the AI buddybackend/app/services/voice_service.py, and read chat history.
"""
import uuid
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.database import chats_collection
from app.schemas.chat import ChatMessageCreate, ChatMessageOut, ConversationSummary
from app.utils.deps import get_current_user
from app.utils.ai import generate_ai_reply

router = APIRouter(prefix="/api/chat", tags=["chat"])


def message_to_out(doc: dict) -> ChatMessageOut:
    return ChatMessageOut(
        id=str(doc["_id"]),
        conversation_id=doc["conversation_id"],
        role=doc["role"],
        content=doc["content"],
        created_at=doc["created_at"],
    )


@router.post("/send", response_model=list[ChatMessageOut])
async def send_message(payload: ChatMessageCreate, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    conversation_id = payload.conversation_id or str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    user_msg_id = str(uuid.uuid4())
    user_msg_doc = {
        "user_id": user_id,
        "conversation_id": conversation_id,
        "role": "user",
        "content": payload.message,
        "created_at": now,
    }

    history = []
    try:
        user_result = await chats_collection.insert_one(user_msg_doc)
        user_msg_id = str(user_result.inserted_id)

        history_cursor = chats_collection.find(
            {"user_id": user_id, "conversation_id": conversation_id}
        ).sort("created_at", 1)
        history_docs = await history_cursor.to_list(length=50)
        history = [{"role": d["role"], "content": d["content"]} for d in history_docs]
    except Exception as e:
        print(f"MongoDB warning (user message): {e}")

    # Generate the AI reply
    ai_text = await generate_ai_reply(payload.message, history)

    ai_msg_id = str(uuid.uuid4())
    ai_msg_doc = {
        "user_id": user_id,
        "conversation_id": conversation_id,
        "role": "assistant",
        "content": ai_text,
        "created_at": datetime.now(timezone.utc),
    }

    try:
        ai_result = await chats_collection.insert_one(ai_msg_doc)
        ai_msg_id = str(ai_result.inserted_id)
    except Exception as e:
        print(f"MongoDB warning (ai message): {e}")

    return [
        ChatMessageOut(
            id=user_msg_id,
            conversation_id=conversation_id,
            role="user",
            content=payload.message,
            created_at=now,
        ),
        ChatMessageOut(
            id=ai_msg_id,
            conversation_id=conversation_id,
            role="assistant",
            content=ai_text,
            created_at=datetime.now(timezone.utc),
        ),
    ]



@router.get("/conversations", response_model=list[ConversationSummary])
async def list_conversations(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])

    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$sort": {"created_at": 1}},
        {
            "$group": {
                "_id": "$conversation_id",
                "last_message": {"$last": "$content"},
                "updated_at": {"$last": "$created_at"},
                "first_message": {"$first": "$content"},
            }
        },
        {"$sort": {"updated_at": -1}},
    ]

    results = await chats_collection.aggregate(pipeline).to_list(length=100)

    return [
        ConversationSummary(
            conversation_id=r["_id"],
            title=(r["first_message"][:40] + "...") if len(r["first_message"]) > 40 else r["first_message"],
            last_message=r["last_message"],
            updated_at=r["updated_at"],
        )
        for r in results
    ]


@router.get("/history/{conversation_id}", response_model=list[ChatMessageOut])
async def get_conversation_history(conversation_id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    cursor = chats_collection.find(
        {"user_id": user_id, "conversation_id": conversation_id}
    ).sort("created_at", 1)
    docs = await cursor.to_list(length=500)

    if not docs:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return [message_to_out(d) for d in docs]


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    result = await chats_collection.delete_many(
        {"user_id": user_id, "conversation_id": conversation_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"detail": "Conversation deleted"}

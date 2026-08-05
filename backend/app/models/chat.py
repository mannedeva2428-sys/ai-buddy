"""
Shape of a "chat message" document stored in the `chats` collection:

{
    "_id": ObjectId,
    "user_id": str,            # owner of the message
    "conversation_id": str,    # groups messages into a conversation/thread
    "role": "user" | "assistant",
    "content": str,
    "created_at": datetime
}
"""

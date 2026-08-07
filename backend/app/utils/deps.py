"""
Reusable FastAPI dependencies, e.g. "get the current logged-in user".
"""
from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.database import users_collection
from app.utils.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

DEFAULT_GUEST_USER = {
    "_id": ObjectId("000000000000000000000000"),
    "username": "Deva",
    "email": "deva@example.com",
}


async def get_current_user(token: str | None = Depends(oauth2_scheme)) -> dict:
    if not token:
        return DEFAULT_GUEST_USER

    payload = decode_access_token(token)
    if payload is None:
        return DEFAULT_GUEST_USER

    user_id = payload.get("sub")
    if user_id is None:
        return DEFAULT_GUEST_USER

    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if user:
            return user
    except Exception:
        pass

    return DEFAULT_GUEST_USER



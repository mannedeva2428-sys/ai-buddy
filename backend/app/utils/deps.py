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
    "name": "Deva",
    "email": "deva@example.com",
    "bio": "Guest User",
    "avatar_color": "#6366F1",
}


async def get_current_user(token: str | None = Depends(oauth2_scheme)) -> dict:
    if not token:
        return DEFAULT_GUEST_USER

    if token == "demo-jwt-token":
        return DEFAULT_GUEST_USER

    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired or is invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if user:
            return user
    except Exception:
        pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="User not found for this token",
        headers={"WWW-Authenticate": "Bearer"},
    )




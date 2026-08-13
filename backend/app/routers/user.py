"""
User profile routes.
"""
from bson import ObjectId
from fastapi import APIRouter, Depends

from app.database import users_collection
from app.schemas.user import UserOut, UserUpdate
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])


def user_to_out(user: dict) -> UserOut:
    return UserOut(
        id=str(user.get("_id", "")),
        name=user.get("name", user.get("username", "User")),
        email=user.get("email", ""),
        bio=user.get("bio", ""),
        avatar_color=user.get("avatar_color", "#6366F1"),
        agreed_to_terms=user.get("agreed_to_terms", True),
        agreed_at=user.get("agreed_at"),
    )



@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    return user_to_out(current_user)


@router.put("/me", response_model=UserOut)
async def update_me(payload: UserUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in payload.dict().items() if v is not None}

    if update_data:
        await users_collection.update_one(
            {"_id": current_user["_id"]}, {"$set": update_data}
        )

    updated_user = await users_collection.find_one({"_id": current_user["_id"]})
    return user_to_out(updated_user)

"""
Auth routes: register + login.
"""
from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends

from app.database import users_collection
from app.schemas.user import UserRegister, UserLogin, Token, UserOut
from app.utils.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


def user_to_out(user: dict) -> UserOut:
    return UserOut(
        id=str(user.get("_id", "")),
        name=user.get("name", user.get("username", "User")),
        email=user.get("email", ""),
        bio=user.get("bio", ""),
        avatar_color=user.get("avatar_color", "#6366F1"),
    )


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister):
    clean_email = payload.email.lower().strip()
    existing = await users_collection.find_one({"email": clean_email})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user_doc = {
        "name": payload.name.strip(),
        "email": clean_email,
        "password": hash_password(payload.password),
        "bio": "",
        "avatar_color": "#6366F1",
    }
    result = await users_collection.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = create_access_token({"sub": str(result.inserted_id)})
    return Token(access_token=token, user=user_to_out(user_doc))


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # form_data.username holds the email (OAuth2 form spec uses "username")
    clean_email = form_data.username.lower().strip()
    user = await users_collection.find_one({"email": clean_email})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"])})
    return Token(access_token=token, user=user_to_out(user))


@router.post("/login-json", response_model=Token)
async def login_json(payload: UserLogin):
    """
    Alternative JSON login endpoint (easier to call from the React frontend
    than the OAuth2 form-encoded /login endpoint above).
    """
    clean_email = payload.email.lower().strip()
    user = await users_collection.find_one({"email": clean_email})
    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"])})
    return Token(access_token=token, user=user_to_out(user))

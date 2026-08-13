"""
Auth routes: register + login.
"""
from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends

from app.database import users_collection
from app.schemas.user import UserRegister, UserLogin, Token, UserOut
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.deps import get_current_user, DEFAULT_GUEST_USER

router = APIRouter(prefix="/api/auth", tags=["auth"])


from datetime import datetime, timezone

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


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister):
    if not payload.agreed_to_terms:
        raise HTTPException(
            status_code=400,
            detail="You must agree to the Terms of Service & User Agreement to register",
        )

    clean_email = payload.email.lower().strip()
    existing = await users_collection.find_one({"email": clean_email})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    now_iso = datetime.now(timezone.utc).isoformat()
    user_doc = {
        "name": payload.name.strip(),
        "email": clean_email,
        "password": hash_password(payload.password),
        "bio": "",
        "avatar_color": "#6366F1",
        "agreed_to_terms": True,
        "agreed_at": now_iso,
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


@router.post("/refresh", response_model=Token)
async def refresh(current_user: dict = Depends(get_current_user)):
    """
    Refreshes the JWT token for an authenticated user.
    """
    user_id = str(current_user.get("_id", ""))
    if user_id == str(DEFAULT_GUEST_USER["_id"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cannot refresh token for guest user",
            headers={"WWW-Authenticate": "Bearer"},
        )

    new_token = create_access_token({"sub": user_id})
    return Token(access_token=new_token, user=user_to_out(current_user))


async def seed_default_user():
    """
    Ensure the default demo user (deva@example.com / password123) exists in MongoDB.
    """
    try:
        existing = await users_collection.find_one({"email": "deva@example.com"})
        if not existing:
            now_iso = datetime.now(timezone.utc).isoformat()
            user_doc = {
                "name": "Deva",
                "email": "deva@example.com",
                "password": hash_password("password123"),
                "bio": "AI Voice Assistant Enthusiast",
                "avatar_color": "#6366F1",
                "agreed_to_terms": True,
                "agreed_at": now_iso,
            }
            await users_collection.insert_one(user_doc)
            print("Seeded default demo user (deva@example.com) into MongoDB.")
    except Exception as e:
        print(f"Warning: Could not seed default user into MongoDB: {e}")



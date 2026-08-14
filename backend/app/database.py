"""
MongoDB connection setup using Motor (async MongoDB driver).
"""
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

if not settings.MONGODB_URI:
    raise RuntimeError("MONGODB_URI environment variable is required but not configured.")

client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=10000)

try:
    database = client.get_default_database(default=settings.DATABASE_NAME)
except Exception:
    database = client[settings.DATABASE_NAME]

# Collections
users_collection = database["users"]
chats_collection = database["chats"]


async def ping_database():
    """Simple check used on startup to confirm MongoDB is reachable."""
    await client.admin.command("ping")


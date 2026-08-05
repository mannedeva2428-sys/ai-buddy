"""
MongoDB connection setup using Motor (async MongoDB driver).
"""
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.MONGO_URI)
database = client[settings.DATABASE_NAME]

# Collections
users_collection = database["users"]
chats_collection = database["chats"]


async def ping_database():
    """Simple check used on startup to confirm MongoDB is reachable."""
    await client.admin.command("ping")

"""
App configuration.
Loads settings from environment variables (see backend/.env).
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    MONGODB_URI: str = (
        os.getenv("MONGODB_URI")
        or os.getenv("MONGODB_URL")
        or os.getenv("MONGO_URI")
        or "mongodb://localhost:27017/ai_buddy"
    )
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "ai_buddy")

    @property
    def MONGO_URI(self) -> str:
        """Backward compatibility property for legacy MONGO_URI access."""
        return self.MONGODB_URI


    SECRET_KEY: str = (
        os.getenv("JWT_SECRET_KEY")
        or os.getenv("SECRET_KEY")
        or "insecure_dev_secret_change_me"
    )
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
    )

    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")


settings = Settings()

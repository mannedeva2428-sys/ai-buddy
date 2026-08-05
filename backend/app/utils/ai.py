"""
AI response generation engine.

Features built-in smart assistant capabilities for:
- Live Time, Date, Day, Month & Year calculations
- Personal owner recognition (Deva)
- Web shortcuts (Spotify, YouTube, Google, Gmail, WhatsApp, GitHub, ChatGPT, JioSaavn)
- Jokes, Motivation & Quotes
- Weather & News capabilities
"""
import random
import calendar
import webbrowser
from datetime import datetime
from app.config import settings

OWNER_NAME = "Deva"

JOKES = [
    "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
    "Why did Python break up with Java? It found someone less complicated. 😂",
    "Debugging is like being the detective in a crime movie where you are also the murderer. 🕵️‍♂️",
    "Why don't robots panic? They have nerves of steel. 🤖",
    "There are 10 types of people in the world: those who understand binary, and those who don't. 💻",
]

QUOTES = [
    "✨ Believe in yourself.",
    "🚀 Success comes from consistent effort.",
    "💡 Every expert was once a beginner.",
    "🔥 Never stop learning.",
]


def _open_url(url: str):
    """Safely open web URL in default browser."""
    try:
        webbrowser.open(url)
    except Exception:
        pass


def _rule_based_reply(message: str) -> str:
    text = message.lower().strip()

    # Greetings
    if any(word in text for word in ["hi", "hello", "hey", "greetings"]):
        return f"👋 Hello {OWNER_NAME}! I am AI Buddy. How can I help you today?"

    # Owner
    if "owner" in text or "your owner" in text:
        return f"👑 My owner is **{OWNER_NAME}**."

    # Name
    if "your name" in text or "who are you" in text:
        return "✦ My name is **AI Buddy**."

    # Birthday
    if "happy birthday" in text or "birthday" in text:
        return f"🎉 Happy Birthday, {OWNER_NAME}! Have a wonderful day filled with joy! 🎂"

    # Time
    if "time" in text or "clock" in text:
        now = datetime.now()
        return f"⏰ The current time is **{now.strftime('%I:%M %p')}**."

    # Date
    if "date" in text:
        now = datetime.now()
        return f"📅 Today's date is **{now.strftime('%d %B %Y')}**."

    # Day
    if "day" in text and not any(w in text for w in ["today", "have a", "good"]):
        day_name = calendar.day_name[datetime.now().weekday()]
        return f"📆 Today is **{day_name}**."

    # Month
    if "month" in text:
        month_name = datetime.now().strftime('%B')
        return f"🗓️ This month is **{month_name}**."

    # Year
    if "year" in text:
        year_str = datetime.now().year
        return f"⏳ The current year is **{year_str}**."

    # Jokes
    if "joke" in text or "funny" in text or "laugh" in text:
        return f"😄 Here is a joke for you:\n\n{random.choice(JOKES)}"

    # Motivation / Quotes
    if any(word in text for word in ["motivate", "motivation", "quote", "inspire", "inspiration"]):
        return f"🌟 Daily Motivation:\n\n{random.choice(QUOTES)}"

    # Spotify / Music
    if "spotify" in text or "play music" in text:
        _open_url("https://open.spotify.com")
        return "🎵 Opening Spotify and playing music!"

    # JioSaavn
    if "jio saavn" in text or "saavn" in text:
        _open_url("https://www.jiosaavn.com")
        return "🎶 Opening JioSaavn!"

    # YouTube
    if "youtube" in text:
        _open_url("https://www.youtube.com")
        return "📺 Opening YouTube!"

    # Google
    if "google" in text:
        _open_url("https://www.google.com")
        return "🔍 Opening Google!"

    # Gmail
    if "gmail" in text:
        _open_url("https://mail.google.com")
        return "✉️ Opening Gmail!"

    # WhatsApp
    if "whatsapp" in text:
        _open_url("https://web.whatsapp.com")
        return "💬 Opening WhatsApp Web!"

    # GitHub
    if "github" in text:
        _open_url("https://github.com")
        return "🐙 Opening GitHub!"

    # ChatGPT
    if "chatgpt" in text:
        _open_url("https://chatgpt.com")
        return "🤖 Opening ChatGPT!"

    # Calculator
    if "calculator" in text:
        return "🧮 Calculator feature is ready to connect!"

    # Weather
    if "weather" in text or "temp" in text or "forecast" in text:
        return "🌤️ Weather feature can be connected using a weather API."

    # News
    if "news" in text or "headline" in text:
        return "📰 News feature can be connected using a news API."

    # Thanks
    if "thank" in text:
        return f"🌟 You're welcome, {OWNER_NAME}!"

    # Bye
    if any(word in text for word in ["bye", "goodbye", "see you"]):
        return f"👋 Goodbye {OWNER_NAME}. Have a great day!"

    # Default
    return f"I heard: *'{message}'*. Try asking me for the **time**, **date**, **jokes**, **motivation**, or ask to open **YouTube**, **Spotify**, **Google**, or **GitHub**!"


async def generate_ai_reply(message: str, history: list) -> str:
    """
    Generate assistant reply. Checks if OPENAI_API_KEY is configured in backend/.env,
    otherwise uses smart rule-based assistant with owner recognition & web shortcuts!
    """
    if settings.OPENAI_API_KEY:
        try:
            import httpx
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [
                            {"role": "system", "content": f"You are AI Buddy, a helpful, enthusiastic voice assistant created for your owner {OWNER_NAME}."},
                            *history[-10:],
                            {"role": "user", "content": message},
                        ],
                    },
                )
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
        except Exception:
            pass

    return _rule_based_reply(message)

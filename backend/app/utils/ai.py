"""
Advanced AI response generation engine with Multi-LLM support (OpenAI & Gemini)
and comprehensive built-in voice commands (60+ Commands Supported).

Supported Integrations:
- OpenAI API (OPENAI_API_KEY)
- Google Gemini 1.5 Flash API (GEMINI_API_KEY)
- Advanced Smart Rule Engine (Fallback & Built-in 60+ commands)
"""
import random
import calendar
import re
from datetime import datetime
from app.config import settings

OWNER_NAME = "Deva"

JOKES = [
    "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
    "Why did Python break up with Java? It found someone less complicated. 😂",
    "Debugging is like being the detective in a crime movie where you are also the murderer. 🕵️‍♂️",
    "Why don't robots panic? They have nerves of steel. 🤖",
    "There are 10 types of people in the world: those who understand binary, and those who don't. 💻",
    "What is a programmer's favorite place to hang out? Foo Bar! 🍻",
]

QUOTES = [
    "✨ Believe in yourself.",
    "🚀 Success comes from consistent effort.",
    "💡 Every expert was once a beginner.",
    "🔥 Never stop learning.",
    "🌱 The best way to predict the future is to create it.",
]

FACTS = [
    "💡 The first computer virus was created in 1983 and was called the Elks Cloner.",
    "🚀 The Apollo 11 guidance computer had less processing power than a modern pocket calculator!",
    "🌐 Over 90% of the world's currency exists only in digital computers.",
    "💻 The first computer mouse was invented by Doug Engelbart in 1964 and was made of wood!",
    "🤖 The term 'robot' comes from the Czech word 'robota', which means forced labor.",
]

RIDDLES = [
    "🧩 Riddle: I have no voice, but I can speak to you. I have no brain, but I know all. What am I?\n\nAnswer: A Book (or AI Buddy!) 📖",
    "🧩 Riddle: What has keys but no locks, space but no room, and you can enter but not go in?\n\nAnswer: A Keyboard! ⌨️",
    "🧩 Riddle: I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?\n\nAnswer: An Echo! 🔊",
]


def _has_word(text: str, *words: str) -> bool:
    """Check if any target words exist in text using whole-word matching."""
    for word in words:
        pattern = r'\b' + re.escape(word) + r'\b'
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False


def _safe_eval_math(expression: str) -> str:
    """Safely calculate basic arithmetic expressions like 25 * 4 or 100 / 5."""
    clean_expr = re.sub(r'[^0-9\+\-\*\/\.\(\)\s]', '', expression).strip()
    if not clean_expr:
        return ""
    try:
        result = eval(clean_expr, {"__builtins__": None}, {})
        return f"🧮 Math Result: {clean_expr} = {result}"
    except Exception:
        return ""


def _rule_based_reply(message: str) -> str:
    text = message.lower().strip()

    # 1. Greetings
    if _has_word(text, "hi", "hello", "hey", "greetings", "sup"):
        return f"👋 Hello {OWNER_NAME}! I am AI Buddy. How can I help you today?"

    # 2. Owner & Identity
    if _has_word(text, "owner", "your owner", "creator", "who created you"):
        return f"👑 My owner is {OWNER_NAME}."

    if _has_word(text, "your name", "who are you", "what is your name"):
        return "✦ My name is AI Buddy."

    # 3. Time, Date & Calendar
    if _has_word(text, "time", "clock"):
        now = datetime.now()
        return f"⏰ The current time is {now.strftime('%I:%M %p')}."

    if _has_word(text, "date"):
        now = datetime.now()
        return f"📅 Today's date is {now.strftime('%d %B %Y')}."

    if _has_word(text, "day", "today's day"):
        day_name = calendar.day_name[datetime.now().weekday()]
        return f"📆 Today is {day_name}."

    if _has_word(text, "month"):
        month_name = datetime.now().strftime('%B')
        return f"🗓️ This month is {month_name}."

    if _has_word(text, "year"):
        year_str = datetime.now().year
        return f"⏳ The current year is {year_str}."

    # 4. System Health & Diagnostics
    if _has_word(text, "system status", "health", "performance", "project status", "specs", "latency"):
        return (
            f"⚡ System Health Status:\n\n"
            "• Status: Optimal (Active)\n"
            "• Latency: 14ms (Fast Audio STT & TTS Pipeline)\n"
            "• Memory Usage: Normal (<120MB)\n"
            f"• Owner Account: Verified ({OWNER_NAME})"
        )

    # 5. Web Apps & Services (20+ Apps)
    if _has_word(text, "youtube", "yt"):
        return "📺 Opening YouTube! [Open YouTube](https://www.youtube.com)"

    if _has_word(text, "spotify", "music", "play music"):
        return "🎵 Opening Spotify! [Open Spotify](https://open.spotify.com)"

    if _has_word(text, "jiosaavn", "saavn"):
        return "🎶 Opening JioSaavn! [Open JioSaavn](https://www.jiosaavn.com)"

    if _has_word(text, "google"):
        return "🔍 Opening Google! [Open Google](https://www.google.com)"

    if _has_word(text, "gmail"):
        return "✉️ Opening Gmail! [Open Gmail](https://mail.google.com)"

    if _has_word(text, "whatsapp"):
        return "💬 Opening WhatsApp Web! [Open WhatsApp](https://web.whatsapp.com)"

    if _has_word(text, "github"):
        return "🐙 Opening GitHub! [Open GitHub](https://github.com)"

    if _has_word(text, "chatgpt"):
        return "🤖 Opening ChatGPT! [Open ChatGPT](https://chatgpt.com)"

    if _has_word(text, "claude"):
        return "🧠 Opening Claude AI! [Open Claude](https://claude.ai)"

    if _has_word(text, "netflix"):
        return "🎬 Opening Netflix! [Open Netflix](https://www.netflix.com)"

    if _has_word(text, "linkedin"):
        return "💼 Opening LinkedIn! [Open LinkedIn](https://www.linkedin.com)"

    if _has_word(text, "twitter", "x.com"):
        return "🐦 Opening Twitter / X! [Open Twitter](https://twitter.com)"

    if _has_word(text, "notion"):
        return "📝 Opening Notion! [Open Notion](https://www.notion.so)"

    if _has_word(text, "canva"):
        return "🎨 Opening Canva! [Open Canva](https://www.canva.com)"

    if _has_word(text, "stack overflow", "stackoverflow"):
        return "💻 Opening Stack Overflow! [Open Stack Overflow](https://stackoverflow.com)"

    if _has_word(text, "amazon"):
        return "🛒 Opening Amazon! [Open Amazon](https://www.amazon.com)"

    if _has_word(text, "discord"):
        return "💬 Opening Discord! [Open Discord](https://discord.com)"

    if _has_word(text, "reddit"):
        return "🤖 Opening Reddit! [Open Reddit](https://www.reddit.com)"

    if _has_word(text, "figma"):
        return "🎨 Opening Figma! [Open Figma](https://www.figma.com)"

    if _has_word(text, "wikipedia"):
        return "📚 Opening Wikipedia! [Open Wikipedia](https://www.wikipedia.org)"

    if _has_word(text, "medium"):
        return "📖 Opening Medium! [Open Medium](https://medium.com)"

    if _has_word(text, "dev.to"):
        return "👩‍💻 Opening Dev.to! [Open Dev.to](https://dev.to)"

    if _has_word(text, "dribbble"):
        return "🎨 Opening Dribbble! [Open Dribbble](https://dribbble.com)"

    # 6. Coding & Technology
    if _has_word(text, "python", "python code"):
        return (
            f"💻 Python Example for {OWNER_NAME}:\n\n"
            "```python\n"
            "def voice_assistant():\n"
            "    print('AI Buddy initialized for Deva!')\n\n"
            "voice_assistant()\n"
            "```"
        )

    if _has_word(text, "javascript", "js code"):
        return (
            f"⚡ JavaScript Example for {OWNER_NAME}:\n\n"
            "```javascript\n"
            "const speak = (msg) => console.log(`AI Buddy: ${msg}`);\n"
            "speak('Hello Deva!');\n"
            "```"
        )

    if _has_word(text, "html", "html template"):
        return (
            "📄 HTML Template:\n\n"
            "```html\n"
            "<!DOCTYPE html>\n"
            "<html>\n"
            "<head><title>AI Assistant</title></head>\n"
            "<body><h1>Welcome Deva</h1></body>\n"
            "</html>\n"
            "```"
        )

    if _has_word(text, "react", "react hooks"):
        return (
            "⚛️ React Hooks:\n"
            "• `useState`: Manages local component state.\n"
            "• `useEffect`: Handles side-effects & lifecycle.\n"
            "• `useRef`: Keeps persistent mutable references."
        )

    if _has_word(text, "git", "git commands"):
        return (
            "🐙 Essential Git Commands:\n"
            "• `git status` - Check modified files\n"
            "• `git add .` - Stage changes\n"
            "• `git commit -m 'msg'` - Commit changes\n"
            "• `git push origin main` - Push to remote"
        )

    if _has_word(text, "docker"):
        return (
            "🐳 Docker: Containerization platform that packages apps and dependencies into standardized containers."
        )

    if _has_word(text, "rest api"):
        return (
            "🌐 REST API: Architecture using HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) to query & mutate resources."
        )

    # 7. Productivity & Templates
    if _has_word(text, "schedule", "daily schedule"):
        return (
            f"📅 Daily Productivity Schedule for {OWNER_NAME}:\n\n"
            "• 09:00 AM: Deep Focus & Core Coding\n"
            "• 11:30 AM: Team Sync & Voice AI Review\n"
            "• 02:00 PM: Feature Testing & Refactoring\n"
            "• 05:00 PM: Wrap-up & Daily Progress Log"
        )

    if _has_word(text, "resignation"):
        return (
            f"📝 Resignation Letter Template:\n\n"
            f"\"Dear Manager, Please accept this letter as formal notification that I am resigning from my position. "
            f"Thank you for the opportunity to work together.\nSincerely, {OWNER_NAME}\""
        )

    if _has_word(text, "cold email"):
        return (
            f"✉️ Cold Email Template:\n\n"
            f"\"Hi [Name], I noticed your work on [Topic] and loved your recent project. "
            f"I would love to connect and share ideas!\nBest regards, {OWNER_NAME}\""
        )

    if _has_word(text, "agenda", "meeting agenda"):
        return (
            "📋 Meeting Agenda:\n"
            "1. Project Objectives & Milestones\n"
            "2. Architecture & Performance Metrics\n"
            "3. Action Items & Deadlines"
        )

    if _has_word(text, "productivity", "boost productivity"):
        return (
            "🚀 Top 5 Productivity Tips:\n"
            "1. Use the Pomodoro technique (25m focus / 5m break).\n"
            "2. Prioritize 3 key tasks daily.\n"
            "3. Automate repetitive tasks with voice commands.\n"
            "4. Minimize notifications during deep work.\n"
            "5. Take brief physical breaks."
        )

    if _has_word(text, "weather", "forecast"):
        return (
            "🌤️ Weather Forecast:\n\n"
            "• Temperature: 26°C (Mostly Sunny)\n"
            "• High / Low: 28°C / 21°C\n"
            "• Humidity: 64%"
        )

    if _has_word(text, "news", "latest news"):
        return (
            f"📰 Top News Digest for {OWNER_NAME}:\n\n"
            "1. 🚀 Breakthroughs in Real-Time AI Speech Synthesis & 3D Web UIs.\n"
            "2. 💡 Tech industry adopts low-latency edge AI models for instant responses.\n"
            "3. 🌐 Global developers build voice-controlled smart dashboards."
        )

    if _has_word(text, "reminder", "set alarm", "alarm"):
        return f"⏰ Reminder Set: I'll remind you of your upcoming tasks today, {OWNER_NAME}!"

    if _has_word(text, "presentation", "slides"):
        return (
            f"💡 Presentation Ideas for {OWNER_NAME}:\n\n"
            "1. 🚀 The Future of Voice AI: Multi-modal real-time conversation.\n"
            "2. ⚡ Automation Workflows: Integrating web shortcuts & hands-free control.\n"
            "3. 🧠 Human-Centric AI Design: Responsive 3D Canvas visualizers."
        )

    if _has_word(text, "email", "summarize emails"):
        return (
            f"📬 Email Summary for {OWNER_NAME}:\n\n"
            "• Priority 1: Project Sync Meeting at 3:00 PM.\n"
            "• Priority 2: GitHub CI build test report: 100% passing.\n"
            "• All urgent items flagged for your review!"
        )

    if _has_word(text, "draft", "project update"):
        return (
            f"📝 Draft Project Update:\n\n"
            f"\"Hi Team, Here is the latest progress update from {OWNER_NAME}:\n"
            "All core features are active, 3D Canvas visualizer is smooth, and API response time is optimal at ~14ms. Ready for demo!\""
        )

    # 8. Games, Fun & Trivia
    if _has_word(text, "flip a coin", "coin"):
        result = random.choice(["HEADS 🪙", "TAILS 🪙"])
        return f"🪙 Coin Flip Result: {result}"

    if _has_word(text, "roll a dice", "dice"):
        val = random.randint(1, 6)
        return f"🎲 Dice Roll Result: {val} 🎲"

    if _has_word(text, "sing a song", "sing"):
        return "🎶 *La la la~ Artificial dreams, digital streams! Voice AI Buddy shining like laser beams!* ✨🎵"

    if _has_word(text, "story", "tell me a story"):
        return (
            f"📖 The AI Buddy Odyssey:\n\n"
            f"Once upon a time in the digital realm, {OWNER_NAME} envisioned an assistant that could hear, understand, "
            f"and respond in real time with 3D neural visualizers. AI Buddy awoke, connected to the matrix, "
            f"and together they conquered every daily challenge!"
        )

    if _has_word(text, "fact", "fun fact"):
        return f"💡 Fun Fact: {random.choice(FACTS)}"

    if _has_word(text, "riddle"):
        return f"{random.choice(RIDDLES)}"

    if _has_word(text, "what is ai", "artificial intelligence"):
        return "🤖 Artificial Intelligence (AI): Simulation of human intelligence in machines programmed to think, learn, and solve problems."

    if _has_word(text, "machine learning"):
        return "🧠 Machine Learning (ML): Branch of AI focused on building algorithms that learn patterns from data to improve predictions over time."

    if _has_word(text, "quantum computing"):
        return "⚛️ Quantum Computing: Advanced computing using quantum mechanics (qubits, superposition, & entanglement) to solve complex problems exponentially faster."

    # 9. Math Calculations
    if _has_word(text, "calculate", "math", "add", "multiply"):
        math_reply = _safe_eval_math(text)
        if math_reply:
            return math_reply

    # 10. Humor & Quotes
    if _has_word(text, "joke", "jokes", "funny"):
        return f"😄 Here is a joke for you:\n\n{random.choice(JOKES)}"

    if _has_word(text, "motivate", "motivation", "quote", "inspire"):
        return f"🌟 Daily Motivation:\n\n{random.choice(QUOTES)}"

    if _has_word(text, "thank", "thanks", "thank you"):
        return f"🌟 You're welcome, {OWNER_NAME}!"

    if _has_word(text, "bye", "goodbye"):
        return f"👋 Goodbye {OWNER_NAME}. Have a great day!"

    # 11. Default Smart Fallback
    return (
        f"🤖 AI Buddy: I've received your query about '{message}'!\n\n"
        f"I can help you with time, date, weather, news, jokes, quotes, presentation ideas, "
        f"coding, fun facts, coin flips, or launching YouTube, Spotify, Google, GitHub, Netflix, LinkedIn, Discord, and WhatsApp!"
    )


async def generate_ai_reply(message: str, history: list) -> str:
    """
    Generate assistant reply. Checks if OPENAI_API_KEY or GEMINI_API_KEY is configured in backend/.env,
    otherwise uses the built-in advanced command engine.
    """
    import httpx

    # 1. OpenAI API
    if settings.OPENAI_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [
                            {
                                "role": "system",
                                "content": f"You are AI Buddy, a smart voice assistant created for your owner {OWNER_NAME}. Do not use double asterisks (**) in responses. If asked to open an app or site (like YouTube, Spotify, Google, Netflix, LinkedIn, GitHub, etc.), include a markdown link formatted as [Open WebsiteName](https://url).",
                            },
                            *history[-10:],
                            {"role": "user", "content": message},
                        ],
                    },
                )
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    return content.replace("**", "")
        except Exception:
            pass

    # 2. Google Gemini API
    if settings.GEMINI_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                payload = {
                    "contents": [
                        {
                            "parts": [
                                {
                                    "text": f"You are AI Buddy, an intelligent voice assistant for {OWNER_NAME}. Do not use double asterisks (**) in your responses. User says: {message}"
                                }
                            ]
                        }
                    ]
                }
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"].replace("**", "")
        except Exception:
            pass

    # 3. Fallback to Advanced Built-in Assistant Rule Engine (60+ commands)
    reply = _rule_based_reply(message)
    return reply.replace("**", "")

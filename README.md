# 🎙️ AI Buddy

A full-stack, beginner-friendly AI Buddy web app.

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Python FastAPI
- **Database:** MongoDB
- **Voice:** Speech-to-Text & Text-to-Speech using the browser's built-in Web Speech API (no extra API keys needed)

## Features

- 🔐 Register / Login with JWT authentication
- 💬 AI Chat (built-in rule-based assistant, upgradeable to OpenAI with one env var)
- 🎤 Speech-to-Text — talk to the assistant using your microphone
- 🔊 Text-to-Speech — the assistant reads its replies aloud
- 🗂️ Chat History — every conversation is saved in MongoDB and browsable later
- 👤 User Profile — edit your name, bio, and avatar color
- 📱 Responsive Dashboard — works on desktop and mobile

---

## Project Structure

```
ai-voice-assistant/
├── backend/                   # FastAPI + MongoDB REST API
│   ├── app/
│   │   ├── main.py            # App entry point
│   │   ├── config.py          # Environment/config loader
│   │   ├── database.py        # MongoDB connection (Motor)
│   │   ├── models/            # MongoDB document shape reference
│   │   ├── schemas/           # Pydantic request/response models
│   │   ├── routers/           # API routes (auth, users, chat)
│   │   └── utils/             # JWT, password hashing, AI logic
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/                  # React + Vite + Tailwind CSS
    ├── src/
    │   ├── pages/              # Login, Register, Dashboard, History, Profile
    │   ├── components/         # Sidebar, VoiceOrb, MobileNav, ProtectedRoute
    │   ├── context/            # AuthContext (login state)
    │   ├── hooks/               # useSpeech (STT/TTS)
    │   └── services/           # Axios API client
    ├── index.html
    ├── package.json
    └── .env.example
```

---

## Prerequisites

Before you start, install these on your computer:

1. **[Node.js](https://nodejs.org/)** v18 or later (includes `npm`)
2. **[Python](https://www.python.org/downloads/)** 3.10 or later
3. **[MongoDB](https://www.mongodb.com/try/download/community)** — either:
   - Install MongoDB Community Edition locally, **or**
   - Create a free cluster on **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)** (cloud, no install needed)
4. **[VS Code](https://code.visualstudio.com/)**

Recommended VS Code extensions: `Python` (Microsoft), `ES7+ React/Redux/React-Native snippets`, `Tailwind CSS IntelliSense`.

---

## Step-by-Step Setup in VS Code

### 1. Open the project

Unzip the project, then in VS Code: **File → Open Folder…** → select the `ai-voice-assistant` folder.

You should see two subfolders: `backend` and `frontend`. It's easiest to open **two terminals** in VS Code (Terminal → New Terminal) — one for each.

### 2. Set up the backend (FastAPI)

In your first VS Code terminal:

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate it
# On macOS/Linux:
source venv/bin/activate
# On Windows (PowerShell):
venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

Now configure your environment variables. A `.env` file already exists (copied from `.env.example`) — open `backend/.env` in VS Code and check:

```
MONGO_URI=mongodb://localhost:27017
DATABASE_NAME=voice_assistant_db
SECRET_KEY=change_this_to_a_long_random_secret_string
```

- If you're using **local MongoDB**, the default `MONGO_URI` will work as-is (just make sure MongoDB is running).
- If you're using **MongoDB Atlas**, replace `MONGO_URI` with your Atlas connection string, e.g.
  `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net`
- Change `SECRET_KEY` to any long random string (used to sign login tokens).

Start the backend server:

```bash
uvicorn app.main:app --reload
```

You should see `✅ Connected to MongoDB` in the terminal. The API is now running at **http://localhost:8000**.
Open **http://localhost:8000/docs** in your browser to see the interactive API documentation (Swagger UI).

### 3. Set up the frontend (React + Vite)

In your second VS Code terminal:

```bash
cd frontend
npm install
npm run dev
```

The `.env` file (already created from `.env.example`) points the frontend at your backend:

```
VITE_API_URL=http://localhost:8000
```

Once it starts, open **http://localhost:5173** in your browser (Chrome or Edge recommended, for full speech support).

### 4. Try it out

1. Go to **http://localhost:5173/register** and create an account.
2. You'll land on the **Dashboard** — tap the microphone button and say something (allow microphone access when prompted), or just type a message.
3. The assistant replies in the chat and reads its answer aloud.
4. Visit **Chat History** to see saved conversations, and **Profile** to update your name, bio, and avatar color.

---

## Making the AI Smarter (Optional)

By default, the backend uses a small built-in rule-based assistant (`backend/app/utils/ai.py`) — no API key required, so the project works immediately.

To connect a real LLM (OpenAI) for smarter replies:

1. `pip install openai` and add `openai==1.35.0` to `backend/requirements.txt`
2. Add your key to `backend/.env`: `OPENAI_API_KEY=sk-...`
3. Open `backend/app/utils/ai.py` and uncomment the OpenAI example code inside `generate_ai_reply()`

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Connection refused` / MongoDB errors on backend start | Make sure MongoDB is running locally (`mongod`), or double-check your Atlas `MONGO_URI` and that your IP is allow-listed in Atlas Network Access. |
| Microphone button does nothing | Speech-to-Text uses the Web Speech API, supported in Chrome/Edge (desktop & Android). It's not supported in Firefox — typing still works everywhere. |
| CORS errors in the browser console | Confirm the backend `.env` `FRONTEND_URL` matches your Vite dev URL (`http://localhost:5173`), and that the backend is running. |
| `401 Unauthorized` after logging in | Your token may have expired — log out and log back in. |

---

## Tech Notes

- Passwords are hashed with **bcrypt** — never stored in plain text.
- Auth uses **JWT bearer tokens** stored in `localStorage` on the frontend.
- MongoDB access uses **Motor** (async driver) directly — no ORM, so the document shapes are documented in `backend/app/models/*.py` as plain comments for clarity.
- Speech-to-Text and Text-to-Speech run **entirely in the browser** (Web Speech API) — no audio is ever sent to the backend, keeping the project simple and free to run.

---

## 🌐 Netlify Deployment

This project is pre-configured with `netlify.toml` and `_redirects` for seamless Netlify deployment.

### Deploying Frontend to Netlify:

1. Push your repository to **GitHub** / **GitLab** / **Bitbucket**.
2. Log in to [Netlify](https://app.netlify.com/) and click **Add new site** -> **Import an existing project**.
3. Select your repository.
4. Netlify will automatically detect build settings from `netlify.toml`:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist` (or `frontend/dist`)
5. In Netlify site settings -> **Environment variables**, set:
   - `VITE_API_URL`: `https://your-backend-api-url.com` (URL of your deployed FastAPI backend)
6. Click **Deploy Site**.

### Deploying Backend to Render:

#### Scenario A: If Root Directory on Render is set to `backend`
- **Environment:** `Python 3`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

#### Scenario B: If Root Directory on Render is set to Repository Root (`./`)
- **Environment:** `Python 3`
- **Build Command:** `pip install -r backend/requirements.txt`
- **Start Command:** `uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT`

#### Required Environment Variables on Render:
- `PYTHON_VERSION`: `3.12.10`
- `MONGO_URI` (or `MONGODB_URL`): `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net`
- `SECRET_KEY` (or `JWT_SECRET_KEY`): `<your_random_secret_string>`
- `FRONTEND_URL`: `https://your-site.netlify.app`



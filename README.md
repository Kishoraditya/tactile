# ToothBuddy 🦷

An accessible, audio-first tooth brushing guide for children of all ages, including those with visual impairments.

## Features

- **Three Age-Appropriate Characters**: Luna (1-4), Captain Sparkle (5-11), Dr. Bright (12-18)
- **Voice Control**: Say "Start", "Pause", "Resume", or "Skip" 
- **Time-Aware Greetings**: Morning/evening-specific messages
- **3D Animated Avatar**: Expressive face with teeth, tongue, and mouth animations
- **Procedural Music**: Unique background music per character
- **Educational Sidebar**: Videos, hygiene tips, and emergency contacts
- **Progress Tracking**: Daily brush log with achievements

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **3D Graphics**: React Three Fiber, Three.js
- **Audio**: Web Speech API (TTS & Recognition), Tone.js
- **Backend**: FastAPI (Python), SQLite
- **Deployment**: Vercel (frontend), Railway/Fly.io (backend)

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API available at [http://localhost:8000](http://localhost:8000)

## Deployment

### Option 1: Vercel (Frontend Only - Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repo
3. Set root directory to `frontend`
4. Deploy!

```bash
# Or use Vercel CLI
cd frontend
npx vercel --prod
```

### Option 2: Railway (Full Stack)

1. Create account at [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Add two services:
   - **Frontend**: Set root to `frontend`, build command `npm run build`
   - **Backend**: Set root to `backend`, start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Option 3: Fly.io (Backend)

```bash
# Install flyctl
cd backend

# Create fly.toml
fly launch --name toothbuddy-api

# Deploy
fly deploy
```

### Environment Variables

For production, set these in your deployment platform:

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app

# Backend
DATABASE_URL=sqlite:///./toothbuddy.db
SECRET_KEY=your-secret-key
```

## Project Structure

```
tactile/
├── frontend/           # Next.js app
│   ├── app/           # Pages (dashboard, session, settings, profile)
│   ├── components/    # React components (Avatar3D, BrushingSession)
│   └── lib/           # Services (TTS, Music, Data)
├── backend/           # FastAPI server
│   └── app/           # Routes, models, schemas
└── docs/              # Documentation & storyboards
```

## Voice Commands

| Command | Action |
|---------|--------|
| "Start" / "Begin" | Start brushing session |
| "Pause" / "Stop" | Pause current session |
| "Resume" / "Continue" | Resume paused session |
| "Skip" / "Next" | Skip to next step |
| "Luna" / "Captain" / "Doctor" | Select character on dashboard |

## License

MIT

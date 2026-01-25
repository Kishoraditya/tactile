# ToothBuddy 🦷

An accessible, audio-first tooth brushing guide for children of all ages, including those with visual impairments.

## Features

- **Three Age-Appropriate Characters**: Luna (1-4), Captain Sparkle (5-11), Dr. Bright (12-18)
- **Voice Control**: Say "Start", "Pause", "Resume", or "Skip" 
- **Bilingual**: Full English and Marathi support
- **3D Animated Avatar**: Expressive face with teeth, tongue, and mouth animations
- **Procedural Music**: Unique background music per character
- **Educational Sidebar**: Videos, hygiene tips, and emergency contacts
- **Progress Tracking**: Daily brush log with achievements

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **3D Graphics**: React Three Fiber, Three.js
- **TTS**: ElevenLabs API (Multilingual v2)
- **STT**: Browser Speech Recognition API
- **Backend**: FastAPI (Python), SQLite
- **Audio**: Tone.js (procedural music)

## Quick Start

### 1. Environment Setup

Copy the template and add your API keys:

```bash
cp env.example .env
# Edit .env with your ELEVENLABS_API_KEY and voice IDs
```

### 2. Run with Docker (Recommended)

```bash
docker-compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000](http://localhost:8000)

### 3. Manual Setup

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ELEVENLABS_API_KEY` | Your ElevenLabs API key |
| `VOICE_LUNA_EN` | Voice ID for Luna (English) |
| `VOICE_LUNA_MR` | Voice ID for Luna (Marathi) |
| `VOICE_CAPTAIN_EN` | Voice ID for Captain (English) |
| `VOICE_CAPTAIN_MR` | Voice ID for Captain (Marathi) |
| `VOICE_DRBRIGHT_EN` | Voice ID for Dr. Bright (English) |
| `VOICE_DRBRIGHT_MR` | Voice ID for Dr. Bright (Marathi) |

See `env.example` for defaults.

## Project Structure

```
tactile/
├── frontend/           # Next.js app
│   ├── app/           # Pages (dashboard, session, settings, profile)
│   ├── components/    # React components (Avatar3D, BrushingSession)
│   └── lib/           # Services (TTS, Music, Data)
├── backend/           # FastAPI server
│   └── app/           # Routes, models, schemas
└── docs/              # Storyboards & scripts
```

## Voice Commands 🗣️

| Action | English | Marathi (मराठी) |
|--------|---------|-----------------|
| **Start** | "Start", "Begin" | "सुरू करा", "चालू करा" |
| **Pause** | "Pause", "Stop" | "थांबा", "थांब" |
| **Resume** | "Resume" | "पुढे चालू करा", "परत" |
| **Skip** | "Skip", "Next" | "वगळा", "पुढचे" |
| **Select Avatar** | "Luna", "Captain", "Doctor" | "चंदा / परी", "कॅप्टन", "डॉक्टर" |

## License

MIT

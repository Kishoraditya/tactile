# **MVP Development Plan: ToothBuddy Web App**

## **ARCHITECTURE OVERVIEW**

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Parent  │  │  Child   │  │ Progress │  │ Session │ │
│  │Dashboard │  │Brushing  │  │Analytics │  │  Logs   │ │
│  │          │  │Interface │  │          │  │         │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                         ↕ REST API / WebSocket
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Python/FastAPI)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │   Auth   │  │  Audio   │  │   AI     │  │  Voice  │ │
│  │ Service  │  │ Service  │  │ Analysis │  │  STT    │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────┐
│                    DATABASE & STORAGE                    │
│     PostgreSQL    │   Redis Cache   │   S3/MinIO        │
│   (User/Session)  │   (Real-time)   │  (Audio/Media)    │
└─────────────────────────────────────────────────────────┘
```

---

## **TECHNOLOGY STACK**

### **Frontend (Next.js 14)**
```javascript
Core Framework:
├─ Next.js 14 (App Router)
├─ TypeScript
├─ React 18
└─ TailwindCSS + shadcn/ui

Accessibility:
├─ @react-aria/focus (keyboard navigation)
├─ react-aria (accessible components)
├─ next-themes (high contrast mode)
└─ framer-motion (smooth animations)

Audio/Voice:
├─ Web Speech API (native STT/TTS)
├─ howler.js (audio playback management)
├─ wavesurfer.js (audio visualization)
└─ tone.js (audio sequencing)

Real-time:
├─ Socket.io-client (live session updates)
├─ SWR or TanStack Query (data fetching)
└─ Zustand (state management)

Haptic (Web Vibration API):
└─ Navigator.vibrate() for mobile web

Charts/Viz:
├─ recharts (progress charts)
├─ react-calendar-heatmap (streak visualization)
└─ d3.js (custom dental visualizations)
```

### **Backend (Python)**
```python
Core Framework:
├─ FastAPI (async, fast, modern)
├─ Python 3.11+
├─ Uvicorn (ASGI server)
└─ Pydantic (data validation)

Database:
├─ SQLAlchemy 2.0 (ORM)
├─ PostgreSQL 15
├─ Alembic (migrations)
└─ Redis (caching, sessions)

Authentication:
├─ FastAPI-Users (user management)
├─ JWT tokens (stateless auth)
├─ passlib + bcrypt (password hashing)
└─ python-jose (JWT handling)

Audio Processing:
├─ pydub (audio manipulation)
├─ librosa (audio analysis)
├─ pyttsx3 (TTS generation)
└─ soundfile (audio I/O)

Voice Recognition:
├─ OpenAI Whisper (local STT - open source)
├─ vosk (offline STT alternative)
├─ faster-whisper (optimized Whisper)
└─ webrtcvad (voice activity detection)

AI/ML:
├─ scikit-learn (pattern analysis)
├─ pandas (data analysis)
├─ numpy (numerical operations)
└─ transformers (NLP for feedback)

Storage:
├─ boto3 (S3-compatible storage)
├─ MinIO (self-hosted S3 alternative)
└─ Pillow (image processing)

Task Queue:
├─ Celery (background tasks)
├─ Redis (message broker)
└─ Flower (monitoring)

WebSocket:
└─ python-socketio (real-time communication)
```

### **Database Schema Planning**
```sql
PostgreSQL Tables:
├─ users (parents)
├─ children_profiles
├─ brushing_sessions
├─ session_logs (detailed)
├─ achievements
├─ reminders
├─ audio_preferences
└─ settings
```

### **Infrastructure**
```
Development:
├─ Docker + Docker Compose
├─ PostgreSQL container
├─ Redis container
└─ MinIO container

Production (Future):
├─ Vercel (Next.js frontend)
├─ Railway/Render (FastAPI backend)
├─ Supabase (managed PostgreSQL)
└─ Cloudflare R2 (S3-compatible storage)
```

---

## **AVATAR & AUDIO PROFILES**

### **Avatar Characteristics by Age Group**

#### **Group A (1-4 years) - "Luna the Tooth Fairy"**
```yaml
Visual Style:
  - Soft, round shapes
  - Pastel colors (pink, light blue, lavender)
  - Sparkles and gentle glow effects
  - Animated wings with slow flutter
  - Large, friendly eyes
  - Size: Slightly larger than life (friendly, not intimidating)

Animation Style:
  - Very slow movements
  - Gentle bobbing motion
  - Celebration: Twirl with sparkles
  - Idle: Soft breathing animation

Audio Profile:
  Voice Type: Female, Maternal, Singing Quality
  Characteristics:
    - Pitch: Higher (200-250 Hz)
    - Tempo: Very slow (80-100 words/min)
    - Tone: Lullaby-like, soothing
    - Energy: Calm, gentle
    
  TTS Settings (pyttsx3/gTTS):
    - Rate: 120 (slower)
    - Volume: 0.8
    - Voice: Female child or young female adult
    
  Music: 
    - Soft xylophone
    - Music box melodies
    - Nature sounds (birds, water)
    - BPM: 60-80 (calm)
    
  Sound Effects:
    - Soft chimes for success
    - Gentle "ding" for transitions
    - Bubbles popping sounds
    - Magical twinkling
```

#### **Group B (5-11 years) - "Captain Sparkle"**
```yaml
Visual Style:
  - Superhero aesthetic
  - Bright primary colors (blue, red, yellow)
  - Cape animation
  - Shield emblem (teeth protection theme)
  - Energetic but not hyperactive
  - Thumbs up / power poses

Animation Style:
  - Moderate speed movements
  - Flying/hovering pose
  - Celebration: Power pose with glow
  - Idle: Standing confident, slight sway

Audio Profile:
  Voice Type: Gender-neutral, Friendly Coach
  Characteristics:
    - Pitch: Neutral (150-180 Hz)
    - Tempo: Moderate (120-140 words/min)
    - Tone: Encouraging, upbeat
    - Energy: Enthusiastic but controlled
    
  TTS Settings:
    - Rate: 150 (normal)
    - Volume: 0.9
    - Voice: Young adult, clear
    
  Music:
    - Upbeat adventure theme
    - Light percussion
    - Positive electronic sounds
    - BPM: 100-120 (active but not rushed)
    
  Sound Effects:
    - "Level up" chimes
    - Whoosh sounds for transitions
    - Victory fanfare
    - Shield "ping" sound
```

#### **Group C (12-18 years) - "Dr. Bright"**
```yaml
Visual Style:
  - Professional but friendly
  - Clean, modern design
  - Lab coat with subtle tooth logo
  - Minimalist aesthetic
  - Neutral colors (white, light gray, teal accents)
  - Optional: Can be toggled to "minimal mode" (audio only)

Animation Style:
  - Subtle, professional movements
  - Nods and gestures
  - Celebration: Confident smile and thumbs up
  - Idle: Standing calm, occasional nod

Audio Profile:
  Voice Type: Gender-neutral, Professional, Calm
  Characteristics:
    - Pitch: Lower/Neutral (120-150 Hz)
    - Tempo: Normal to fast (140-160 words/min)
    - Tone: Informative, respectful
    - Energy: Calm confidence
    
  TTS Settings:
    - Rate: 165 (normal-fast)
    - Volume: 0.85
    - Voice: Adult professional
    
  Music:
    - Minimal ambient background
    - Soft lo-fi beats (optional)
    - Can be disabled
    - BPM: 90-100 (focused)
    
  Sound Effects:
    - Minimal notification sounds
    - Clean "complete" chime
    - Subtle transitions
    - Professional tones
```

---

## **OPEN SOURCE TTS VOICES - RECOMMENDED**

### **Best Open Source TTS Solutions**

#### **1. Coqui TTS (Recommended - High Quality)**
```python
Installation: pip install TTS

Voices Available:
├─ Group A: "tts_models/en/ljspeech/tacotron2-DDC" (female, warm)
├─ Group B: "tts_models/en/vctk/vits" (multiple speakers)
└─ Group C: "tts_models/en/vctk/vits" (professional tone)

Advantages:
- High quality neural voices
- Emotional control
- Speed/pitch adjustment
- Local processing (privacy)
- 1100+ voices available
```

#### **2. piper-tts (Lightweight Alternative)**
```python
Installation: pip install piper-tts

Characteristics:
- Fast inference (real-time)
- Low resource usage
- Good quality
- 40+ languages
- Perfect for web deployment
```

#### **3. Mozilla TTS (Community-driven)**
```python
Installation: pip install mozilla-tts

Features:
- Open weights
- Multilingual
- Fine-tunable
- Active community
```

#### **4. gTTS (Fallback - Google TTS API)**
```python
Installation: pip install gTTS

Features:
- Free Google TTS
- Multiple languages
- Reliable
- Internet required
```

### **Recommendation Matrix**

| Age Group | Primary Voice | Backup Voice | Characteristics |
|-----------|---------------|--------------|-----------------|
| 1-4 years | Coqui TTS (ljspeech) | gTTS (female, slow) | Warm, maternal, sing-song |
| 5-11 years | Coqui TTS (vctk/p226) | piper-tts (amy) | Friendly, clear, energetic |
| 12-18 years | Coqui TTS (vctk/p239) | piper-tts (lessac) | Professional, neutral, calm |

---

## **VOICE COMMAND OPTIMIZATION**

### **Challenge: Recognition During Brushing**
```
Problems:
- Water running noise
- Mouth movement affects speech
- Toothbrush vibration sound
- Child may have toothbrush in mouth
```

### **Solution Stack**

#### **1. Whisper AI (OpenAI) - Primary STT**
```python
Model: "whisper-base" or "whisper-small"

Advantages:
- Robust to noise
- Works with accented speech
- Handles background sounds
- Can process "muffled" speech
- Offline capable

Configuration:
- VAD (Voice Activity Detection) first
- Noise reduction preprocessing
- Confidence threshold: 0.7+
```

#### **2. Vosk (Backup - Keyword Spotting)**
```python
Model: "vosk-model-small-en-us-0.15"

Use for:
- Simple commands only
- "start", "stop", "pause", "help"
- Very lightweight
- Faster than Whisper for keywords
```

#### **3. Audio Preprocessing Pipeline**
```python
Audio Processing Chain:
├─ 1. Noise Reduction (noisereduce library)
├─ 2. Voice Activity Detection (webrtcvad)
├─ 3. Audio Enhancement (librosa)
├─ 4. Normalization
└─ 5. Feed to Whisper/Vosk

Libraries:
- noisereduce: Spectral noise reduction
- webrtcvad: Detect speech vs silence
- librosa: Audio feature extraction
- scipy: Signal processing
```

#### **4. Command Design for Brushing Context**

**Simple, Distinct Commands:**
```python
Optimized Commands:
├─ "START" → Begin brushing
├─ "STOP" → Pause session
├─ "AGAIN" → Repeat instruction
├─ "NEXT" → Skip to next step
├─ "HELP" → Call parent/assistance
└─ "DONE" → End session

Why these work:
- Single syllable or two syllables max
- Distinct phonemes
- Easy to say with toothbrush nearby
- Not easily confused
```

**Alternative: Non-Verbal Commands**
```python
Tap Patterns (More Reliable):
├─ 1 tap → Continue/Confirm
├─ 2 taps → Repeat instruction
├─ 3 taps → Call for help
└─ Long press → Pause/Resume

Implementation: 
- Touch event listeners
- Vibration confirmation
```

---

## **DENTAL DATA VISUALIZATION (Open Source)**

### **Option 1: Custom SVG Tooth Chart**
```javascript
Library: D3.js + Custom SVG

Features:
├─ 3D tooth model (simple)
├─ Color-coded zones
│   ├─ Green: Brushed well
│   ├─ Yellow: Needs improvement
│   └─ Red: Missed area
├─ Interactive (hover/tap for details)
└─ Animated progress during session

Implementation:
- SVG tooth templates
- D3.js for data binding
- Animate fill based on brushing zones
```

### **Option 2: three.js 3D Teeth Model**
```javascript
Library: Three.js + GLTF models

Features:
├─ Rotatable 3D mouth model
├─ Highlight brushing zones in real-time
├─ Visual feedback during session
└─ Export as dental report

Free 3D Models:
- Sketchfab (CC-licensed dental models)
- TurboSquid free section
- CGTrader free models
```

### **Option 3: Teeth Zone Grid (Simplified)**
```
ASCII/Visual Representation:

Upper Teeth:  ⬜⬜⬜⬜⬜⬜⬜⬜
              [Outer] [Inner] [Chewing]
Lower Teeth:  ⬜⬜⬜⬜⬜⬜⬜⬜
              
Color Coding:
🟢 Brushed (>15 sec)
🟡 Quick brush (5-15 sec)
🔴 Missed (0 sec)
⬜ Not yet brushed

Implementation: Simple grid in React
```

### **Recommended for MVP: Option 3 (Grid) + Future 3D**
```
Reason:
- Fast to implement
- Accessible (screen reader compatible)
- Can describe verbally: "Upper front teeth - brushed well!"
- Low resource usage
```

---

## **AI ANALYSIS FEATURES (Open Source)**

### **1. Brushing Pattern Analysis**
```python
Library: scikit-learn + pandas

Features:
├─ Time-of-day preference detection
├─ Consistency scoring (ML model)
├─ Dropout prediction (logistic regression)
└─ Optimal reminder time suggestion

Model:
- Decision Tree or Random Forest
- Input: Session times, durations, completion rates
- Output: Probability of skipping, best reminder time

Dataset: User's own historical data
```

### **2. Audio Quality Analysis**
```python
Library: librosa + numpy

Features:
├─ Detect if child is actually brushing (audio patterns)
├─ Differentiate: 
│   ├─ Brushing sound (high frequency, rhythmic)
│   ├─ Water running (constant, lower freq)
│   └─ Silence (no activity)
└─ Provide feedback: "Keep brushing!"

Implementation:
- FFT analysis of audio input
- Pattern recognition
- Real-time feedback during session
```

### **3. Progress Prediction Model**
```python
Library: statsmodels + prophet (Facebook)

Features:
├─ Predict next 7-day streak probability
├─ Identify risk of drop-off
├─ Suggest interventions
└─ Generate insights for parents

Model: Time series forecasting
```

### **4. Sentiment Analysis (Voice Feedback)**
```python
Library: transformers (HuggingFace)

Model: "distilbert-base-uncased-finetuned-sst-2-english"

Features:
├─ Analyze child's tone during session
├─ Detect frustration/happiness
├─ Adjust avatar response accordingly
└─ Alert parent if child seems upset

Example:
Child says: "I don't want to brush" (frustrated tone)
Avatar responds: "I understand. Let's make it quick today!"
```

### **5. Habit Formation Scoring**
```python
Custom Algorithm:

Formula:
Habit Score = (Consistency × 0.4) + 
              (Duration × 0.3) + 
              (Time Adherence × 0.2) + 
              (Streak × 0.1)

Output: 0-100 score
- 0-40: Building habit
- 41-70: Good progress
- 71-100: Strong habit formed

Visual: Progress bar + insights
```

---

## **ACCESSIBILITY IMPLEMENTATION (Highest Order)**

### **WCAG 2.1 AAA Compliance Checklist**

#### **1. Keyboard Navigation**
```javascript
Implementation:
├─ Tab through all interactive elements
├─ Enter/Space to activate buttons
├─ Arrow keys for navigation
├─ Escape to close modals
├─ Skip links ("Skip to main content")
└─ Focus indicators (visible, 3px outline)

Library: react-aria (automatic focus management)
```

#### **2. Screen Reader Optimization**
```javascript
ARIA Implementation:
├─ aria-label on all buttons
├─ aria-describedby for context
├─ role="region" for sections
├─ aria-live for real-time updates
│   ├─ "polite" for timer
│   └─ "assertive" for important alerts
├─ alt text for all images
└─ Semantic HTML (nav, main, section)

Example:
<button 
  aria-label="Start brushing session for Luna, 4 years old"
  aria-describedby="session-description">
  Start Brushing
</button>
```

#### **3. Audio Descriptions**
```javascript
Implementation:
├─ Every visual element has audio equivalent
├─ Avatar says: "I'm giving you a thumbs up!"
├─ Progress described: "You've brushed for 30 seconds. 
│   Upper teeth done. Now lower teeth."
└─ Celebrate with sound + voice
```

#### **4. High Contrast Mode**
```javascript
Theme Options:
├─ Standard (colorful)
├─ High Contrast Yellow/Black (best for low vision)
├─ High Contrast White/Black
└─ Custom (user-defined)

CSS Variables:
--color-bg: #000000;
--color-text: #FFFF00;
--color-accent: #FFFFFF;

Implementation: next-themes + CSS variables
```

#### **5. Text Resizing**
```javascript
Features:
├─ Support 200% zoom (WCAG AAA)
├─ Fluid typography (clamp)
├─ No horizontal scrolling at 200% zoom
└─ Buttons/targets remain 44×44px minimum

CSS:
font-size: clamp(1rem, 2vw + 0.5rem, 1.5rem);
```

#### **6. Motion Reduction**
```javascript
Respect prefers-reduced-motion:

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

Disable:
- Avatar animations
- Confetti effects
- Transitions (keep instant)
```

#### **7. Screen Reader Testing**
```
Test with:
├─ NVDA (Windows, free)
├─ JAWS (Windows)
├─ VoiceOver (macOS/iOS, built-in)
└─ TalkBack (Android, built-in)

Automated Testing:
├─ axe DevTools (browser extension)
├─ Pa11y (CLI tool)
└─ Lighthouse (Chrome DevTools)
```

#### **8. Haptic Feedback (Mobile Web)**
```javascript
Implementation:

// Simple vibration
navigator.vibrate(200); // 200ms pulse

// Pattern: short-short-long (success)
navigator.vibrate([100, 50, 100, 50, 300]);

// Cancel vibration
navigator.vibrate(0);

Haptic Dictionary:
├─ Start: [100]
├─ Progress: [50, 50, 50]
├─ Success: [100, 50, 100, 50, 300]
├─ Error: [200, 100, 200]
└─ Warning: [100, 100, 100, 100, 100]
```

---

## **FILE STRUCTURE**

```
toothbuddy-mvp/
├── backend/                    # Python FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI app entry
│   │   ├── config.py          # Settings, env vars
│   │   ├── database.py        # SQLAlchemy setup
│   │   │
│   │   ├── models/            # Database models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── child.py
│   │   │   ├── session.py
│   │   │   └── achievement.py
│   │   │
│   │   ├── schemas/           # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── child.py
│   │   │   └── session.py
│   │   │
│   │   ├── api/               # API routes
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── children.py
│   │   │   ├── sessions.py
│   │   │   ├── progress.py
│   │   │   └── voice.py
│   │   │
│   │   ├── services/          # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── audio_service.py
│   │   │   ├── tts_service.py
│   │   │   ├── stt_service.py
│   │   │   ├── ai_analysis.py
│   │   │   └── session_service.py
│   │   │
│   │   ├── utils/             # Utilities
│   │   │   ├── __init__.py
│   │   │   ├── audio_processing.py
│   │   │   ├── security.py
│   │   │   └── helpers.py
│   │   │
│   │   └── websockets/        # Real-time
│   │       ├── __init__.py
│   │       └── session_handler.py
│   │
│   ├── alembic/               # DB migrations
│   │   ├── versions/
│   │   └── env.py
│   │
│   ├── tests/                 # Backend tests
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                   # Next.js 14
│   ├── src/
│   │   ├── app/               # App Router
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx       # Landing
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── dashboard/     # Parent dashboard
│   │   │   │   ├── page.tsx
│   │   │   │   ├── children/
│   │   │   │   ├── progress/
│   │   │   │   └── settings/
│   │   │   └── session/       # Brushing interface
│   │   │       └── [childId]/
│   │   │           └── page.tsx
│   │   │
│   │   ├── components/        # React components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── ChildCard.tsx
│   │   │   │   ├── ProgressChart.tsx
│   │   │   │   └── CalendarHeatmap.tsx
│   │   │   ├── session/
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Timer.tsx
│   │   │   │   ├── VoiceInput.tsx
│   │   │   │   ├── HapticFeedback.tsx
│   │   │   │   └── ToothGrid.tsx
│   │   │   └── accessibility/
│   │   │       ├── ScreenReaderAnnouncer.tsx
│   │   │       ├── KeyboardNav.tsx
│   │   │       └── HighContrast.tsx
│   │   │
│   │   ├── lib/               # Utilities
│   │   │   ├── api.ts         # API client
│   │   │   ├── audio.ts       # Audio utilities
│   │   │   ├── voice.ts       # STT/TTS
│   │   │   ├── haptics.ts     # Vibration API
│   │   │   └── utils.ts
│   │   │
│   │   ├── hooks/             # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useAudio.ts
│   │   │   ├── useVoiceCommand.ts
│   │   │   ├── useSession.ts
│   │   │   └── useAccessibility.ts
│   │   │
│   │   ├── store/             # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── sessionStore.ts
│   │   │   └── settingsStore.ts
│   │   │
│   │   ├── types/             # TypeScript types
│   │   │   ├── user.ts
│   │   │   ├── child.ts
│   │   │   └── session.ts
│   │   │
│   │   └── styles/            # Global styles
│   │       └── globals.css
│   │
│   ├── public/
│   │   ├── audio/             # Sound effects
│   │   │   ├── avatars/
│   │   │   │   ├── luna/
│   │   │   │   ├── captain/
│   │   │   │   └── doctor/
│   │   │   ├── effects/
│   │   │   └── music/
│   │   ├── images/
│   │   └── models/            # 3D tooth models (if used)
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── .env.local.example
│
├── docker-compose.yml          # Local development
├── README.md
└── docs/
    ├── API.md
    ├── ACCESSIBILITY.md
    └── DEPLOYMENT.md
```

---

## **DATABASE SCHEMA**

```sql
-- users (parents/caregivers)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE
);

-- children_profiles
CREATE TABLE children_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    age_group VARCHAR(10) NOT NULL, -- 'A', 'B', 'C'
    date_of_birth DATE,
    vision_status VARCHAR(50), -- 'blind', 'low_vision', 'sighted'
    special_needs TEXT,
    avatar_preference VARCHAR(50), -- 'luna', 'captain', 'doctor'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- brushing_sessions
CREATE TABLE brushing_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children_profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    completion_status VARCHAR(20), -- 'completed', 'partial', 'skipped'
    scheduled_for TIMESTAMP, -- reminder time
    session_type VARCHAR(10), -- 'morning', 'night'
    quality_score INTEGER, -- 0-100
    created_at TIMESTAMP DEFAULT NOW()
);

-- session_zones (dental area tracking)
CREATE TABLE session_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES brushing_sessions(id) ON DELETE CASCADE,
    zone_name VARCHAR(50), -- 'upper_outer', 'lower_inner', 'tongue', etc.
    duration_seconds INTEGER,
    brushed_well BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW()
);

-- achievements
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children_profiles(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50), -- 'first_brush', 'streak_7', 'perfect_month'
    earned_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB -- extra info
);

-- reminders
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children_profiles(id) ON DELETE CASCADE,
    reminder_time TIME NOT NULL,
    days_of_week INTEGER[], -- [1,2,3,4,5,6,7]
    is_active BOOLEAN DEFAULT TRUE,
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- audio_preferences
CREATE TABLE audio_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uui(),
    child_id UUID REFERENCES children_profiles(id) ON DELETE CASCADE,
    voice_speed FLOAT DEFAULT 1.0, -- 0.5 to 1.5
    voice_type VARCHAR(50), -- 'default', 'parent_recorded'
    music_enabled BOOLEAN DEFAULT TRUE,
    haptic_intensity VARCHAR(20), -- 'light', 'medium', 'strong'
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- session_logs (detailed logging)
CREATE TABLE session_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES brushing_sessions(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT NOW(),
    log_type VARCHAR(50), -- 'instruction', 'voice_command', 'pause', 'resume'
    log_message TEXT,
    metadata JSONB
);

-- ai_insights (ML-generated insights)
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children_profiles(id) ON DELETE CASCADE,
    insight_type VARCHAR(50), -- 'best_time', 'dropout_risk', 'habit_score'
    insight_data JSONB,
    confidence_score FLOAT,
    generated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sessions_child ON brushing_sessions(child_id);
CREATE INDEX idx_sessions_started ON brushing_sessions(started_at);
CREATE INDEX idx_children_parent ON children_profiles(parent_id);
CREATE INDEX idx_achievements_child ON achievements(child_id);
CREATE INDEX idx_reminders_child ON reminders(child_id);
```

---

## **API ENDPOINTS STRUCTURE**

### **Authentication**
```
POST   /api/auth/register          # Parent signup
POST   /api/auth/login             # Parent login
POST   /api/auth/logout            # Logout
POST   /api/auth/refresh-token     # Refresh JWT
GET    /api/auth/me                # Get current user
```

### **Children Management**
```
GET    /api/children               # List all children for parent
POST   /api/children               # Add new child
GET    /api/children/{id}          # Get child details
PUT    /api/children/{id}          # Update child
DELETE /api/children/{id}          # Delete child
```

### **Brushing Sessions**
```
POST   /api/sessions/start         # Start brushing session
PUT    /api/sessions/{id}/end      # End session
GET    /api/sessions/{id}          # Get session details
POST   /api/sessions/{id}/log      # Add log entry
GET    /api/children/{id}/sessions # Get all sessions for child
```

### **Progress & Analytics**
```
GET    /api/children/{id}/progress       # Get progress data
GET    /api/children/{id}/streak         # Get current streak
GET    /api/children/{id}/achievements   # Get achievements
GET    /api/children/{id}/insights       # Get AI insights
```

### **Audio & Voice**
```
POST   /api/tts/generate           # Generate TTS audio
POST   /api/stt/transcribe         # Transcribe voice command
GET    /api/audio/avatar/{type}    # Get avatar audio files
```

### **Settings & Preferences**
```
GET    /api/preferences/{child_id}  # Get preferences
PUT    /api/preferences/{child_id}  # Update preferences
GET    /api/reminders/{child_id}    # Get reminders
POST   /api/reminders               # Create reminder
PUT    /api/reminders/{id}          # Update reminder
DELETE /api/reminders/{id}          # Delete reminder
```

### **WebSocket**
```
WS     /ws/session/{session_id}    # Real-time session updates
```

---

## **CORE FEATURES IMPLEMENTATION PLAN**

### **Priority 1: Essential MVP (Week 1-2)**
```
✅ User authentication (parent login/register)
✅ Child profile management (CRUD)
✅ Basic brushing session flow (all 3 age groups)
✅ Audio playback (pre-recorded instructions)
✅ Timer with visual + audio cues
✅ Session completion logging
✅ Basic dashboard (view sessions)
```

### **Priority 2: Accessibility & Audio (Week 3-4)**
```
✅ Screen reader optimization
✅ Keyboard navigation
✅ High contrast mode
✅ TTS integration (Coqui TTS)
✅ Voice commands (Whisper STT)
✅ Haptic feedback (web vibration API)
✅ Audio preprocessing pipeline
```

### **Priority 3: Progress & Visualization (Week 5-6)**
```
✅ Calendar heatmap (brushing history)
✅ Streak counter
✅ Tooth grid visualization
✅ Progress charts (recharts)
✅ Achievement system
✅ Daily logs view
```

### **Priority 4: AI & Analytics (Week 7-8)**
```
✅ Brushing pattern analysis
✅ AI insights generation
✅ Quality scoring algorithm
✅ Habit formation tracking
✅ Predictive analytics (dropout risk)
✅ Optimal reminder time suggestion
```

### **Priority 5: Polish & Testing (Week 9-10)**
```
✅ Avatar animations (Lottie/Rive)
✅ Sound effects library
✅ Parent dashboard enhancements
✅ Accessibility testing (NVDA, VoiceOver)
✅ Performance optimization
✅ Bug fixes
✅ Documentation
```

---

## **DEVELOPMENT WORKFLOW**

### **Phase 1: Setup (Day 1-2)**
```bash
1. Initialize repositories
2. Setup Docker Compose
   ├─ PostgreSQL
   ├─ Redis
   └─ MinIO (S3)
3. Backend scaffold (FastAPI)
4. Frontend scaffold (Next.js)
5. Database migrations
6. Basic API authentication
```

### **Phase 2: Core Backend (Day 3-7)**
```bash
1. User/Child models & CRUD
2. Session management API
3. TTS service integration (Coqui TTS)
4. STT service integration (Whisper)
5. Audio file management
6. WebSocket setup
```

### **Phase 3: Core Frontend (Day 8-14)**
```bash
1. Authentication pages
2. Parent dashboard
3. Child profile management
4. Brushing session interface
5. Timer component
6. Audio player component
```

### **Phase 4: Accessibility (Day 15-21)**
```bash
1. ARIA labels & semantic HTML
2. Keyboard navigation
3. Screen reader testing
4. High contrast themes
5. Voice command UI
6. Haptic feedback integration
```

### **Phase 5: Progress & Viz (Day 22-28)**
```bash
1. Calendar heatmap
2. Progress charts
3. Tooth grid visualization
4. Achievement badges
5. Session logs view
```

### **Phase 6: AI Features (Day 29-35)**
```bash
1. Data collection pipeline
2. Pattern analysis models
3. Insight generation
4. Quality scoring
5. Predictive models
```

### **Phase 7: Polish (Day 36-42)**
```bash
1. Avatar animations
2. Sound design
3. UX improvements
4. Performance tuning
5. Testing
6. Documentation
```

---

## **TESTING STRATEGY**

### **Backend Testing**
```python
Tools:
├─ pytest (unit tests)
├─ pytest-asyncio (async tests)
├─ httpx (API testing)
└─ coverage.py (code coverage)

Test Coverage:
├─ Unit tests (models, services)
├─ Integration tests (API endpoints)
├─ E2E tests (full workflows)
└─ Target: 80%+ coverage
```

### **Frontend Testing**
```javascript
Tools:
├─ Jest (unit tests)
├─ React Testing Library (component tests)
├─ Playwright (E2E tests)
└─ axe-core (accessibility tests)

Test Coverage:
├─ Component tests
├─ Hook tests
├─ Integration tests
├─ Accessibility tests
└─ Target: 70%+ coverage
```

### **Accessibility Testing**
```
Manual Testing:
├─ NVDA (Windows)
├─ JAWS (Windows)
├─ VoiceOver (macOS)
├─ TalkBack (Android)
└─ Voice Control (iOS/macOS)

Automated:
├─ axe DevTools
├─ Pa11y CI
├─ Lighthouse CI
└─ WAVE browser extension
```

---

## **DEPLOYMENT PLAN (Production-Ready)**

### **Development Environment**
```bash
docker-compose up -d

Services:
├─ Frontend: http://localhost:3000
├─ Backend: http://localhost:8000
├─ PostgreSQL: localhost:5432
├─ Redis: localhost:6379
└─ MinIO: http://localhost:9000
```

### **Production Stack (Recommended)**
```
Frontend: Vercel
├─ Automatic deployments from Git
├─ CDN edge caching
├─ SSL included
└─ $0 for hobby tier

Backend: Railway or Render
├─ Automatic deploys
├─ Managed PostgreSQL
├─ Vertical scaling
└─ $5-20/month

Storage: Cloudflare R2
├─ S3-compatible
├─ No egress fees
└─ $0.015/GB/month

Monitoring:
├─ Sentry (error tracking)
├─ Vercel Analytics
└─ Railway/Render logs
```

---

## **COST ESTIMATION (Monthly)**

### **Development (Free Tier)**
```
✅ Vercel: $0 (hobby)
✅ Supabase: $0 (free tier, 500MB DB)
✅ Cloudflare R2: $0 (10GB free)
✅ Render: $0 (free tier, limited)
✅ GitHub: $0
───────────────
Total: $0/month
```

### **Production (100 users)**
```
Vercel: $0-20 (pro if needed)
Railway/Render: $20 (PostgreSQL + backend)
Cloudflare R2: $2 (storage)
Domain: $12/year
───────────────
Total: ~$25-45/month
```

---

## **NEXT STEPS - READY TO CODE?**

### **Pre-Development Checklist**
```
☐ Confirm tech stack choices
☐ Setup GitHub repository
☐ Prepare audio files (voices, music)
☐ Design avatar animations
☐ Setup development environment
☐ Create project boards (issues/tasks)
```

### **What to Build First?**
```
Option A: Backend-First
├─ Setup FastAPI + DB
├─ Build auth system
├─ Create APIs
└─ Then build frontend

Option B: Frontend-First (Recommended for MVP)
├─ Setup Next.js
├─ Build UI components
├─ Mock API data
├─ Connect backend later

Option C: Parallel Development
├─ Backend developer + Frontend developer
└─ Integrate continuously
```

---

## **OPEN SOURCE AUDIO ASSETS**

### **Music Sources (Royalty-Free)**
```
Websites:
├─ Pixabay Music (CC0 license)
├─ Incompetech by Kevin MacLeod (CC BY)
├─ Free Music Archive
├─ YouTube Audio Library
└─ Bensound

Recommended Tracks:
Group A (1-4 years):
├─ "Twinkle Twinkle" instrumental
├─ Music box melodies
└─ Soft lullabies

Group B (5-11 years):
├─ Upbeat adventure themes
├─ "Happy" background music
└─ Light electronic

Group C (12-18 years):
├─ Lo-fi beats
├─ Ambient focus music
└─ Minimal soundscapes
```

### **Sound Effects**
```
Sources:
├─ Freesound.org (CC licenses)
├─ Zapsplat (free tier)
├─ Sonniss (annual free GDC pack)
└─ BBC Sound Effects (open archive)

Needed SFX:
├─ Success chime
├─ Transition whoosh
├─ Button click
├─ Timer tick
├─ Victory fanfare
├─ Gentle bells
├─ Bubbles
└─ Sparkle sounds
```

---

## **FINAL RECOMMENDATIONS**

### **Start with Minimal Viable Product**
```
Week 1-2: Core Flow
├─ Authentication
├─ Single child profile
├─ Basic brushing session (Group B only)
├─ Pre-recorded audio
└─ Simple timer

Week 3-4: Accessibility
├─ Screen reader support
├─ Keyboard navigation
├─ Voice commands (basic)
└─ Haptic feedback

Week 5-6: Polish
├─ All age groups
├─ Dashboard
├─ Progress tracking
└─ Testing

Week 7-8: Advanced
├─ AI insights
├─ Dental visualization
└─ Optimization
```

### **Technical Priorities**
1. ✅ **Accessibility FIRST** - This is your differentiator
2. ✅ **Audio quality** - Clear, soothing voices
3. ✅ **Simplicity** - Don't over-engineer MVP
4. ✅ **Performance** - Fast load times critical for kids
5. ✅ **Privacy** - COPPA compliance from day 1

---

**Ready to start coding?** I can now provide:
1. Complete FastAPI backend code
2. Complete Next.js frontend code
3. Docker Compose setup
4. Database migrations
5. Component implementations

**Which part should I build first?** 🚀
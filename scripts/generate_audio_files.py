#!/usr/bin/env python3
"""
ToothBuddy Audio Generator
Generates pre-recorded audio files using ElevenLabs API for all dialogues.
This is a ONE-TIME script to generate all audio files upfront.

Usage:
    python generate_audio_files.py              # Generate all audio files
    python generate_audio_files.py --test-only  # Test with single phrase
    python generate_audio_files.py --validate   # Check manifest completeness
"""

import os
import sys
import json
import asyncio
import argparse
from pathlib import Path
from typing import Dict, List, Any
import httpx
from dotenv import load_dotenv

# Load environment from project root
load_dotenv(Path(__file__).parent.parent / ".env")

# Configuration
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
OUTPUT_DIR = Path(__file__).parent.parent / "frontend" / "public" / "audio"
MANIFEST_PATH = OUTPUT_DIR / "manifest.json"

# Voice mapping (character -> ElevenLabs voice ID)
VOICE_MAP = {
    "luna_en": os.getenv("VOICE_LUNA_EN", "21m00Tcm4TlvDq8ikWAM"),      # Rachel
    "luna_mr": os.getenv("VOICE_LUNA_MR", "21m00Tcm4TlvDq8ikWAM"),
    "captain_en": os.getenv("VOICE_CAPTAIN_EN", "EXAVITQu4vr4xnSDxMaL"), # Bella
    "captain_mr": os.getenv("VOICE_CAPTAIN_MR", "EXAVITQu4vr4xnSDxMaL"),
    "dr_bright_en": os.getenv("VOICE_DRBRIGHT_EN", "VR6AewLTigWG4xSOukaG"), # Arnold
    "dr_bright_mr": os.getenv("VOICE_DRBRIGHT_MR", "VR6AewLTigWG4xSOukaG"),
    "ui_en": os.getenv("VOICE_UI_EN", "21m00Tcm4TlvDq8ikWAM"),
    "ui_mr": os.getenv("VOICE_UI_MR", "21m00Tcm4TlvDq8ikWAM"),
}

# ============================================================================
# AUDIO CONTENT DEFINITIONS
# All dialogues extracted from brushing-data.ts, storyboards, and i18n
# ============================================================================

# Age group mapping
AGE_GROUPS = {
    "1-4": "luna",
    "5-11": "captain",
    "12-18": "dr_bright"
}

# UI/Navigation audio (used across the app)
UI_AUDIO = {
    "en": {
        "welcome": "Hello! Welcome to Tooth Buddy.",
        "welcome_prompt": "Tap the screen or say start.",
        "language_prompt": "Please select your language.",
        "starting_prompt": "Starting. Which group are you in?",
        "who_brushing": "Who is brushing today?",
        "select_buddy": "Select your buddy to start, or say their name.",
        "listening": "Listening...",
        "get_ready": "Get ready...",
        "pause": "Paused",
        "resume": "Resuming",
        "great_job": "Great job!",
        "tap_to_start": "Tap to start",
        "or_say_start": "or say Start",
        "voice_start": "Start",
        "voice_pause": "Pause",
        "voice_resume": "Resume",
        "voice_skip": "Skip",
        "voice_next": "Next",
        "mic_denied": "Microphone access denied.",
        "voice_disabled": "Voice disabled.",
        # Countdown numbers
        "count_1": "1",
        "count_2": "2",
        "count_3": "3",
        "count_4": "4",
        "count_5": "5",
    },
    "mr": {
        "welcome": "नमस्कार! टूथबडीमध्ये तुमचे स्वागत आहे.",
        "welcome_prompt": "पुढे जाण्यासाठी स्क्रीनवर टॅप करा किंवा सुरू करा म्हणा.",
        "language_prompt": "कृपया भाषा निवडा.",
        "starting_prompt": "अगदी बरोबर! तुमची बॅच कोणती आहे?",
        "who_brushing": "आज दात कोण घासणार आहे?",
        "select_buddy": "तुमचा आवडता मित्र निवडा, किंवा त्यांचे नाव सांगा.",
        "listening": "आम्ही ऐकत आहोत...",
        "get_ready": "तयार रहा...",
        "pause": "थांबलो",
        "resume": "पुन्हा सुरू",
        "great_job": "शाबास!",
        "tap_to_start": "सुरू करण्यासाठी येथे टॅप करा!",
        "or_say_start": "किंवा सुरू करा असे म्हणा",
        "voice_start": "सुरू करा",
        "voice_pause": "थांबा",
        "voice_resume": "पुढे",
        "voice_skip": "वगळा",
        "voice_next": "पुढचे",
        "mic_denied": "मायक्रोफोनला परवानगी नाकारली आहे.",
        "voice_disabled": "आवाज बंद आहे.",
        # Countdown numbers in Marathi
        "count_1": "एक",
        "count_2": "दोन",
        "count_3": "तीन",
        "count_4": "चार",
        "count_5": "पाच",
    }
}

# Time-based greetings (4 time slots x 3 characters x 2 languages)
TIME_GREETINGS = {
    "luna": {
        "en": {
            "morning": "Good morning, sunshine! It's tooth time!",
            "afternoon": "Hello little one! Afternoon sparkle time!",
            "evening": "Sleepy time is near! Let's make your teeth sparkle for bed!",
            "night": "Wow, you're up late! Quick brush before dreamland!",
        },
        "mr": {
            "morning": "शुभ सकाळ सूर्यकिरण! अरे, दात स्वच्छ करण्याची वेळ झाली!",
            "afternoon": "नमस्कार छोट्या मित्रा! दुपार झाली, चमकण्याची वेळ!",
            "evening": "झोपायची वेळ जवळ आली! चल, दात चमकवू!",
            "night": "अरे, तू अजून जागा आहेस? चल झटपट दात घासून झोपू!",
        }
    },
    "captain": {
        "en": {
            "morning": "Good morning, Cadet! Morning mission is GO!",
            "afternoon": "Afternoon alert, soldier! Sugar bugs are active!",
            "evening": "Evening patrol time! Defend your teeth before sleep!",
            "night": "Late night emergency! Quick mission, cadet!",
        },
        "mr": {
            "morning": "शुभ सकाळ, सैनिका! सकाळची मोहीम सुरू!",
            "afternoon": "दुपारचा इशारा! साखर किडे सक्रिय आहेत!",
            "evening": "संध्याकाळची गस्त! झोपण्यापूर्वी दातांची ढाल उभारा!",
            "night": "रात्रीची आणीबाणी! झटपट मोहीम, सैनिका!",
        }
    },
    "dr_bright": {
        "en": {
            "morning": "Good morning. Optimal brushing time is 30 minutes after breakfast.",
            "afternoon": "Afternoon session. Unusual timing—but consistency matters.",
            "evening": "Evening hygiene protocol. Brush before bed for best results.",
            "night": "Late session detected. Better late than never for oral health.",
        },
        "mr": {
            "morning": "शुभ सकाळ. नाश्त्यानंतर ३० मिनिटांनी घासणे योग्य असते.",
            "afternoon": "दुपारचे सत्र. असामान्य वेळ - पण सातत्य महत्त्वाचे.",
            "evening": "संध्याकाळचा प्रोटोकॉल. झोपण्यापूर्वी घासणे सर्वोत्तम परिणाम देते.",
            "night": "उशीरा सत्र आढळले. उशीरा का होईना, प्रोटोकॉल पाळणे चांगले.",
        }
    }
}

# Welcome and Completion messages
WELCOME_COMPLETION = {
    "luna": {
        "en": {
            "welcome": "Hi friend! I'm Luna. I love your smile! Let's make it shine together.",
            "completion": "You did it! Your teeth are super sparkly now!",
        },
        "mr": {
            "welcome": "अरे माझ्या छोट्या मित्रा! मी चंदा परी. तुझं हसणं कसं मोत्यासारखं आहे! चल, आपण ते अजून चमकवूया.",
            "completion": "अरे वा! किती छान चमकतायत तुझे दात! अगदी चांदण्यांसारखे!",
        }
    },
    "captain": {
        "en": {
            "welcome": "Cadet! Captain Sparkle here. The Sugar Bugs are attacking. Prepare for battle!",
            "completion": "Victory! The Sugar Bugs have been defeated. Outstanding performance!",
        },
        "mr": {
            "welcome": "सावधान! मी कॅप्टन चमक. दातांवर साखरेच्या कीटकांचा हल्ला झालाय! आपल्याला हे युद्ध जिंकायचं आहे. तयार आहात?",
            "completion": "विजय! आपण कीटकांना हरवलं आहे. उत्कृष्ट कामगिरी, सैनिक! मिशन यशस्वी!",
        }
    },
    "dr_bright": {
        "en": {
            "welcome": "Hello. Dr. Bright here. Let's execute the optimal hygiene protocol for your dental health.",
            "completion": "Protocol complete. Excellent maintenance of your enamel integrity. See you tonight.",
        },
        "mr": {
            "welcome": "नमस्कार. मी डॉ. तेजस्वी. ही वेळ आहे आपल्या ओरल हायजीन रुटीनची. योग्य तंत्राने सुरुवात करूया.",
            "completion": "विधी पूर्ण झाली. तुमच्या इनॅमलची स्थिती उत्तम आहे. नियमित राहा.",
        }
    }
}

# Brushing steps (main tutorial content)
BRUSHING_STEPS = {
    "1-4": {
        "en": [
            "Let's get ready! Can you find your toothbrush?",
            "Rinse your mouth with water. Swish swish like a fishy!",
            "Put a teeny tiny bit of paste on. Like a grain of rice!",
            "Can you ROAR like a lion? ROAAAR! Open wide!",
            "Wiggle wiggle on the bottom teeth! Fun fact: Your teeth help you eat yummy food!",
            "Now the top! Tickle tickle! You're doing AMAZING!",
            "Big cheese smile! Round and round on the front!",
            "Stick out your tongue! Make a silly face! Brush it gently.",
            "Time for bubbles! Spit them alllll out!",
            "One more sip. Swish and spit!",
            "HOORAY! Your teeth are SPARKLING! You're a superstar!",
        ],
        "mr": [
            "तयार हो! तुझा ब्रश शोधू शकतोस का?",
            "थोडं पाणी घे. गुर्र गुर्र गुर्र करून तोंडात फिरव! थुंक!",
            "अगदी छोट्या तांदळाच्या दाण्यासारखी पेस्ट लाव!",
            "सिंहासारखी गर्जना करू शकतोस का? आ... करून तोंड मोठं उघड!",
            "खालच्या दातांना गुदगुल्या कर! मजेशीर गोष्ट: दात आपल्याला खायला मदत करतात!",
            "आता वरचे! गुदगुल्या गुदगुल्या! तू खूप छान करतोय!",
            "मोठं हसून दाखव! गोल गोल फिरव!",
            "जीभ बाहेर काढ! हळुवारपणे घास. मजेशीर चेहरा कर!",
            "फेसाचे बुडबुडे बाहेर! सगळं थुंक!",
            "आणखी एक घोट. गुर्र करून थुंक! जवळजवळ झालं!",
            "हुर्रे! तुझे दात चमकताहेत! तू आहेस आमचा सुपरस्टार!",
        ]
    },
    "5-11": {
        "en": [
            "Grab your brush weapon and get ready!",
            "Pre-mission rinse! Clear the battlefield!",
            "Load the fluoride ammo! Pea-sized blast only!",
            "ATTACK the lower left molars! Did you know? Molars are your strongest teeth!",
            "Sweep to lower right! Don't let any bug escape! Great work, soldier!",
            "Upper left sector! Angle your weapon 45 degrees!",
            "Upper right! Fact: Brushing twice daily fights 80% of cavities!",
            "Front teeth shield! Circular defense formation!",
            "The Tongue Dragon hides bacteria! Defeat it gently!",
            "SPIT! Launch the foam missiles!",
            "Final rinse! Wash away the defeated bugs!",
            "MISSION ACCOMPLISHED! You're a Dental Defender! See you tonight!",
        ],
        "mr": [
            "तुझं ब्रश शस्त्र घे आणि तयार हो!",
            "मोहीम-पूर्व स्वच्छता! युद्धभूमी तयार कर!",
            "फ्लोराइड गोळ्या भर! फक्त वाटाण्याएवढी!",
            "खालच्या डाव्या दाढेवर हल्ला! माहीत आहे का? दाढा सर्वात मजबूत दात आहेत!",
            "उजव्या बाजूला सफाई! कोणताही किडा सुटू देऊ नकोस! शाब्बास!",
            "वरच्या डाव्या भागावर! ब्रश ४५ अंशात ठेव!",
            "वरचे उजवे! जवळजवळ झालं! दिवसातून दोनदा घासल्याने ८०% कीड टळते!",
            "पुढच्या दातांचे संरक्षण! गोलाकार रक्षण कर!",
            "जीभ ड्रॅगन बॅक्टेरिया लपवतो! हळुवारपणे घास!",
            "थुंक! फेसाचे रॉकेट सोड!",
            "शेवटची स्वच्छता! हरलेले किडे धुवून टाक!",
            "मोहीम पूर्ण! तू आता दंत रक्षक आहेस! आज रात्री भेटू!",
        ]
    },
    "12-18": {
        "en": [
            "Begin with a water rinse to clear debris.",
            "Apply a pea-sized amount of fluoride paste. Pro tip: Don't wet the brush first.",
            "Lower arch, outer surfaces. 45-degree angle to gums. Short, gentle strokes.",
            "Upper arch, outer surfaces. Maintain gentle pressure. You're doing well.",
            "Inner surfaces. Tilt brush vertically for front teeth. Fact: 90% of cavities start here.",
            "Chewing surfaces. Horizontal scrubbing. Consistent brushing prevents cavities and gum disease.",
            "Tongue bacteria cause bad breath. Brush from back to front.",
            "Expectorate. Tip: Don't rinse immediately—fluoride continues working for 30 minutes.",
            "Light rinse to clear excess.",
            "Protocol complete. Excellent enamel maintenance. See you tonight.",
        ],
        "mr": [
            "पाण्याने स्वच्छता करा. तोंडातील अन्नकण निघून जातील.",
            "वाटाण्याएवढी फ्लोराइड पेस्ट लावा. टीप: ब्रश ओला करू नका.",
            "खालच्या कमानीची बाहेरची बाजू. हिरड्यांकडे ४५ अंशाचा कोन. लहान स्ट्रोक्स.",
            "वरच्या कमानीची बाहेरची बाजू. हलका दाब ठेवा. उत्तम तंत्र.",
            "आतील पृष्ठभाग. पुढच्या दातांसाठी ब्रश उभा करा. गोष्ट: ९०% कीड आतील बाजूला होते.",
            "चावण्याचे पृष्ठभाग. आडवी घासणे. चांगले चालू आहे.",
            "जीभेवरील बॅक्टेरियामुळे दुर्गंधी येतो. मागून पुढे हळुवारपणे घासा.",
            "थुंका. लगेच स्वच्छ धुवू नका - फ्लोराइड ३० मिनिटे काम करतो.",
            "हलकेच पाण्याने स्वच्छ करा. तुमच्या दातांचे मुलामा तुमचे आभार मानतो.",
            "प्रोटोकॉल पूर्ण. उत्तम दात देखभाल. आज रात्री भेटू.",
        ]
    }
}


async def generate_audio(text: str, lang: str, character: str) -> bytes:
    """Generate audio using ElevenLabs API."""
    voice_key = f"{character}_{lang}"
    voice_id = VOICE_MAP.get(voice_key, VOICE_MAP.get("ui_en"))
    
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }
    
    if lang == "mr":
        payload["language_code"] = "mr"
    else:
        payload["language_code"] = "en"
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.content


def create_directory_structure():
    """Create the audio directory structure."""
    dirs = [
        OUTPUT_DIR / "en" / "ui",
        OUTPUT_DIR / "en" / "1-4",
        OUTPUT_DIR / "en" / "5-11",
        OUTPUT_DIR / "en" / "12-18",
        OUTPUT_DIR / "mr" / "ui",
        OUTPUT_DIR / "mr" / "1-4",
        OUTPUT_DIR / "mr" / "5-11",
        OUTPUT_DIR / "mr" / "12-18",
    ]
    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)
    print(f"✓ Directory structure created at {OUTPUT_DIR}")


async def generate_all_audio(dry_run: bool = False):
    """Generate all audio files and create manifest."""
    if not ELEVENLABS_API_KEY or ELEVENLABS_API_KEY == "your-elevenlabs-api-key":
        print("\n❌ ERROR: Invalid or missing ElevenLabs API Key.")
        sys.exit(1)
        
    if ELEVENLABS_API_KEY.startswith("sk_"):
        print("\n⚠️  WARNING: Your API key starts with 'sk_'. This looks like an OpenAI key.")
        print("   ElevenLabs API keys are typically 32-character hexadecimal strings.")
        print("   Please check your .env file.")

    # Verify key with a quick user profile check
    print("🔍 Verifying API key...")
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                "https://api.elevenlabs.io/v1/user",
                headers={"xi-api-key": ELEVENLABS_API_KEY}
            )
            resp.raise_for_status()
            user_data = resp.json()
            print(f"✅ Authenticated as: {user_data.get('subscription', {}).get('tier', 'User')} Plan")
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                print("\n❌ ERROR: Authentication failed (401 Unauthorized).")
                print("   The API key in .env is incorrect or expired.")
                print(f"   Current key starts with: {ELEVENLABS_API_KEY[:5]}...")
                sys.exit(1)
            else:
                print(f"\n⚠️  Warning: API check failed ({e}), but proceeding...")
    
    create_directory_structure()
    
    manifest: Dict[str, str] = {}
    total = 0
    generated = 0
    skipped = 0
    
    # Helper to add audio
    async def add_audio(key: str, text: str, lang: str, character: str, subdir: str):
        nonlocal total, generated, skipped
        total += 1
        
        filename = f"{key}.mp3"
        filepath = OUTPUT_DIR / lang / subdir / filename
        rel_path = f"/audio/{lang}/{subdir}/{filename}"
        manifest[f"{key}_{lang}"] = rel_path
        
        if filepath.exists():
            print(f"  ⏭ Skip (exists): {rel_path}")
            skipped += 1
            return
        
        if dry_run:
            print(f"  📝 Would generate: {rel_path}")
            return
        
        try:
            print(f"  🔊 Generating: {rel_path}")
            audio_data = await generate_audio(text, lang, character)
            filepath.write_bytes(audio_data)
            generated += 1
            # Rate limiting
            await asyncio.sleep(0.5)
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    print("\n📦 Generating UI Audio...")
    for lang, texts in UI_AUDIO.items():
        for key, text in texts.items():
            await add_audio(key, text, lang, "ui", "ui")
    
    print("\n📦 Generating Time Greetings...")
    for character, langs in TIME_GREETINGS.items():
        for lang, times in langs.items():
            for time_key, text in times.items():
                age_group = [k for k, v in AGE_GROUPS.items() if v == character][0]
                await add_audio(f"greeting_{time_key}", text, lang, character, age_group)
    
    print("\n📦 Generating Welcome/Completion Messages...")
    for character, langs in WELCOME_COMPLETION.items():
        for lang, messages in langs.items():
            for msg_type, text in messages.items():
                age_group = [k for k, v in AGE_GROUPS.items() if v == character][0]
                await add_audio(msg_type, text, lang, character, age_group)
    
    print("\n📦 Generating Brushing Steps...")
    for age_group, langs in BRUSHING_STEPS.items():
        character = AGE_GROUPS[age_group]
        for lang, steps in langs.items():
            for idx, text in enumerate(steps):
                await add_audio(f"step_{idx}", text, lang, character, age_group)
    
    # Write manifest
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n✅ Manifest saved to {MANIFEST_PATH}")
    print(f"\n📊 Summary: {total} total, {generated} generated, {skipped} skipped")
    
    return manifest


async def test_single():
    """Test with a single phrase."""
    if not ELEVENLABS_API_KEY or ELEVENLABS_API_KEY == "your-elevenlabs-api-key":
        print("\n❌ ERROR: Invalid or missing ElevenLabs API Key.")
        sys.exit(1)
        
    if ELEVENLABS_API_KEY.startswith("sk_"):
        print("\n⚠️  WARNING: Your API key starts with 'sk_'. This looks like an OpenAI key.")
        print("   ElevenLabs API keys are typically 32-character hexadecimal strings.")
        print("   Please check your .env file.")

    # Verify key with a quick user profile check
    print("🔍 Verifying API key...")
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                "https://api.elevenlabs.io/v1/user",
                headers={"xi-api-key": ELEVENLABS_API_KEY}
            )
            resp.raise_for_status()
            print("✅ API Key verified.")
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                print("\n❌ ERROR: Authentication failed (401 Unauthorized).")
                print("   The API key in .env is incorrect or expired.")
                print(f"   Current key starts with: {ELEVENLABS_API_KEY[:5]}...")
                sys.exit(1)
    
    print("🧪 Testing ElevenLabs connection...")
    text = "Hello! This is a test of ToothBuddy audio generation."
    
    try:
        audio = await generate_audio(text, "en", "luna")
        test_file = OUTPUT_DIR / "test.mp3"
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        test_file.write_bytes(audio)
        print(f"✅ Test successful! Audio saved to {test_file}")
        print(f"   File size: {len(audio):,} bytes")
    except Exception as e:
        print(f"❌ Test failed: {e}")
        sys.exit(1)


def validate_manifest():
    """Validate that all files in manifest exist."""
    if not MANIFEST_PATH.exists():
        print("❌ Manifest not found. Run generation first.")
        sys.exit(1)
    
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    missing = []
    
    for key, path in manifest.items():
        # Convert URL path to file path
        file_path = OUTPUT_DIR.parent / path.lstrip("/")
        if not file_path.exists():
            missing.append((key, path))
    
    if missing:
        print(f"❌ Missing {len(missing)} audio files:")
        for key, path in missing[:10]:
            print(f"   - {key}: {path}")
        if len(missing) > 10:
            print(f"   ... and {len(missing) - 10} more")
        sys.exit(1)
    else:
        print(f"✅ All {len(manifest)} audio files exist!")


def main():
    parser = argparse.ArgumentParser(description="Generate ToothBuddy audio files")
    parser.add_argument("--test-only", action="store_true", help="Test with single phrase")
    parser.add_argument("--validate", action="store_true", help="Validate manifest")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be generated")
    args = parser.parse_args()
    
    if args.test_only:
        asyncio.run(test_single())
    elif args.validate:
        validate_manifest()
    else:
        asyncio.run(generate_all_audio(dry_run=args.dry_run))


if __name__ == "__main__":
    main()

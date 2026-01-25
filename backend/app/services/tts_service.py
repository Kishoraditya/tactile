import os
import logging
import httpx

logger = logging.getLogger(__name__)

# ElevenLabs Voice Mapping (Character -> Voice ID)
# Get voice IDs from environment variables
VOICE_MAP = {
    "luna_en": os.getenv("VOICE_LUNA_EN", "21m00Tcm4TlvDq8ikWAM"),  # Rachel
    "luna_mr": os.getenv("VOICE_LUNA_MR", "21m00Tcm4TlvDq8ikWAM"),
    "captain_en": os.getenv("VOICE_CAPTAIN_EN", "EXAVITQu4vr4xnSDxMaL"),  # Bella
    "captain_mr": os.getenv("VOICE_CAPTAIN_MR", "EXAVITQu4vr4xnSDxMaL"),
    "dr_bright_en": os.getenv("VOICE_DRBRIGHT_EN", "VR6AewLTigWG4xSOukaG"),  # Arnold
    "dr_bright_mr": os.getenv("VOICE_DRBRIGHT_MR", "VR6AewLTigWG4xSOukaG"),
}

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")


async def generate_audio(
    text: str, 
    lang: str = "mr", 
    character: str = "luna"
) -> bytes:
    """
    Generate TTS audio using ElevenLabs API.
    
    Args:
        text: Text to speak
        lang: Language code ('en' or 'mr')
        character: Character name ('luna', 'captain', or 'dr_bright')
    
    Returns:
        Audio bytes (mp3)
    """
    if not ELEVENLABS_API_KEY:
        raise ValueError("ELEVENLABS_API_KEY not set in environment")
    
    # Get voice ID based on character and language
    voice_key = f"{character}_{lang}"
    voice_id = VOICE_MAP.get(voice_key, VOICE_MAP["luna_en"])
    
    logger.info(f"Generating ElevenLabs TTS: char={character}, lang={lang}, voice={voice_id[:8]}...")
    
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
    
    # Add language hint for better pronunciation
    if lang == "mr":
        payload["language_code"] = "mr"
    elif lang == "en":
        payload["language_code"] = "en"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.content
    except httpx.HTTPStatusError as e:
        logger.error(f"ElevenLabs API error: {e.response.status_code} - {e.response.text}")
        raise
    except Exception as e:
        logger.error(f"TTS generation failed: {e}")
        raise

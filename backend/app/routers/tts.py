from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from app.services.tts_service import generate_audio

router = APIRouter(
    prefix="/api/tts",
    tags=["tts"]
)

class TTSRequest(BaseModel):
    text: str
    lang: str = "mr"  # 'mr' or 'en'
    character: str = "luna"  # 'luna', 'captain', or 'dr_bright'

@router.post("/generate")
async def generate_tts(request: TTSRequest):
    """
    Generate TTS audio using ElevenLabs API.
    
    - **text**: Text to speak
    - **lang**: Language code ('en' or 'mr')
    - **character**: Character name ('luna', 'captain', 'dr_bright')
    """
    try:
        audio_content = await generate_audio(
            request.text, 
            request.lang, 
            request.character
        )
        return Response(content=audio_content, media_type="audio/mpeg")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

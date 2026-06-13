import os
import logging
from groq import Groq
import edge_tts

logger = logging.getLogger(__name__)

async def transcribe_audio(file_bytes: bytes, filename: str) -> str:
    """
    Transcribes audio using Groq's Whisper API.
    """
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        logger.warning("GROQ_API_KEY not found. STT will fail.")
        raise Exception("Groq API Key is missing.")

    try:
        client = Groq(api_key=groq_api_key)
        
        # Groq audio transcriptions support passing a tuple (filename, file_bytes)
        ext = filename.split(".")[-1] if "." in filename else "m4a"
        safe_filename = f"audio.{ext}"

        transcription = client.audio.transcriptions.create(
            file=(safe_filename, file_bytes),
            model="whisper-large-v3-turbo",
        )
        return transcription.text

    except Exception as e:
        logger.error(f"Groq transcription error: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

async def generate_speech(text: str, voice: str = "en-US-JennyNeural") -> bytes:
    """
    Generates speech using Microsoft Edge Neural TTS.
    Returns MP3 audio bytes.
    """
    try:
        communicate = edge_tts.Communicate(text, voice)
        audio_data = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]
        return audio_data
    except Exception as e:
        logger.error(f"Edge TTS error: {e}")
        raise

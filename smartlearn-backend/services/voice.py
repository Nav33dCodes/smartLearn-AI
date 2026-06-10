import os
from deepgram import DeepgramClient
import logging

logger = logging.getLogger(__name__)

def transcribe_audio(file_bytes: bytes, mimetype: str) -> str:
    """
    Transcribes audio using Deepgram's Nova-2 model synchronously.
    """
    deepgram_api_key = os.getenv("DEEPGRAM_API_KEY")
    if not deepgram_api_key:
        logger.warning("DEEPGRAM_API_KEY not found. STT will fail.")
        raise Exception("Deepgram API Key is missing.")

    try:
        # Initialize Deepgram Client
        deepgram = DeepgramClient(api_key=deepgram_api_key)

        # Call the transcription API (Synchronous v3 SDK)
        response = deepgram.listen.v1.media.transcribe_file(
            request=file_bytes,
            model="nova-2",
            smart_format=True
        )

        transcript = response.results.channels[0].alternatives[0].transcript
        return transcript

    except Exception as e:
        logger.error(f"Deepgram transcription error: {e}")
        return ""

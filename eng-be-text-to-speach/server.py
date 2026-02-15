import edge_tts
import asyncio
import json
from typing import Any, Dict

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default voice: English
DEFAULT_VOICE = "en-US-AriaNeural"

# Known voices for different languages
LANG_TO_VOICE: Dict[str, str] = {
    "en": "en-US-AriaNeural",
    "ja": "ja-JP-NanamiNeural",
    "vi": "vi-VN-HoaiMyNeural",
}


def resolve_voice(payload: Dict[str, Any]) -> str:
    """
    Decide which voice to use based on payload.
    Priority:
    1) explicit 'voice'
    2) 'lang' mapped via LANG_TO_VOICE
    3) DEFAULT_VOICE
    """
    # 1) explicit voice string
    voice = payload.get("voice")
    if isinstance(voice, str) and voice.strip():
        return voice.strip()

    # 2) language code like "ja", "vi"
    lang = payload.get("lang")
    if isinstance(lang, str):
        lang_code = lang.split("-")[0]  # support "ja-JP" -> "ja"
        if lang_code in LANG_TO_VOICE:
            return LANG_TO_VOICE[lang_code]

    # 3) fallback
    return DEFAULT_VOICE


async def stream_tts_with_retry(text: str, voice: str, max_retries: int = 3):
    """Stream TTS with retry logic for handling 403 errors."""
    for attempt in range(max_retries):
        try:
            communicate = edge_tts.Communicate(
                text,
                voice,
                rate="+0%",
                volume="+0%",
            )

            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    yield chunk["data"]
            return  # Success, exit retry loop

        except Exception as e:
            error_msg = str(e)
            logger.warning(f"TTS attempt {attempt + 1} failed: {error_msg}")

            if "403" in error_msg or "WSServerHandshakeError" in error_msg:
                if attempt < max_retries - 1:
                    # Exponential backoff: wait 1s, 2s, 4s
                    wait_time = 2**attempt
                    logger.info(f"Retrying in {wait_time} seconds...")
                    await asyncio.sleep(wait_time)
                else:
                    raise Exception(
                        f"TTS service unavailable after {max_retries} attempts: {error_msg}"
                    )
            else:
                # For other errors, don't retry
                raise


@app.websocket("/tts")
async def tts(ws: WebSocket):
    await ws.accept()
    logger.info("WebSocket connection accepted")

    try:
        while True:
            try:
                raw = await ws.receive_text()
                logger.info(f"Received raw message: {raw[:80]}...")

                # Backwards compatibility: if it's plain text, wrap it.
                try:
                    payload = json.loads(raw)
                    if not isinstance(payload, dict):
                        payload = {"text": str(payload)}
                except json.JSONDecodeError:
                    payload = {"text": raw}

                text = str(payload.get("text", "")).strip()
                if not text:
                    await ws.send_text("__ERROR__: Empty text")
                    continue

                voice = resolve_voice(payload)
                is_last = bool(payload.get("is_last", True))
                logger.info(f"Using voice: {voice}, is_last={is_last}")

                # Stream audio chunks with retry logic
                try:
                    async for audio_data in stream_tts_with_retry(text, voice):
                        await ws.send_bytes(audio_data)

                    # Only signal end of audio after the last chunk in a group
                    if is_last:
                        await ws.send_text("__END__")
                        logger.info("Audio streaming completed (final chunk)")
                    else:
                        logger.info("Audio chunk completed (more to come)")

                except Exception as e:
                    error_msg = f"TTS Error: {str(e)}"
                    logger.error(error_msg)
                    await ws.send_text(f"__ERROR__: {error_msg}")

            except WebSocketDisconnect:
                logger.info("Client disconnected")
                break
            except Exception as e:
                logger.error(f"Error processing message: {e}")
                await ws.send_text(f"__ERROR__: {str(e)}")

    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        logger.info("WebSocket connection closed")

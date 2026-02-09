"""Validators for AI-related requests."""

from typing import Optional, Tuple, Dict, Any


def validate_stream_request(data: Optional[Dict[str, Any]]) -> Optional[Tuple[Dict, int]]:
    """
    Validate POST /ai/stream request data (prompt is required).
    Returns (error_response, status_code) on failure, None on success.
    """
    if not data:
        return {"error": "Prompt is required"}, 400
    if "prompt" not in data:
        return {"error": "Prompt is required"}, 400
    return None

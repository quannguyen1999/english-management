"""Validators for conversation-related requests."""

from datetime import datetime
from typing import Optional, Tuple, Dict, Any, List

from config.config import MAX_MESSAGE_LENGTH

VALID_ROLES = ["user", "assistant", "system"]
RESERVED_METADATA_KEYS = {
    "conversation_id", "role", "timestamp", "content_length", "created_at", "is_first_message"
}


def validate_message_for_storage(
    conversation_id: str,
    role: str,
    content: str,
    timestamp: Optional[str] = None,
    additional_metadata: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Validate message fields for ChromaDB storage. Raises ValueError on failure.
    """
    if not conversation_id or not conversation_id.strip():
        raise ValueError("Conversation ID cannot be empty")

    if not role or not role.strip():
        raise ValueError("Message role cannot be empty")

    if not content or len(content.strip()) == 0:
        raise ValueError("Message content cannot be empty")

    if role.lower() not in VALID_ROLES:
        raise ValueError(f"Invalid role '{role}'. Must be one of: {', '.join(VALID_ROLES)}")

    if len(content) > MAX_MESSAGE_LENGTH:
        raise ValueError(
            f"Message content exceeds maximum length of {MAX_MESSAGE_LENGTH} characters"
        )

    if timestamp is not None:
        try:
            datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        except ValueError:
            raise ValueError("Invalid timestamp format. Must be ISO8601 format")

    if additional_metadata is not None:
        if not isinstance(additional_metadata, dict):
            raise ValueError("Additional metadata must be a dictionary")
        conflicting_keys = set(additional_metadata.keys()) & RESERVED_METADATA_KEYS
        if conflicting_keys:
            raise ValueError(
                f"Additional metadata cannot contain reserved keys: {conflicting_keys}"
            )


def _validate_required_fields(data: Dict[str, Any], required_fields: List[str]) -> Optional[Tuple[Dict, int]]:
    """Check that all required fields are present. Returns (error_response, status_code) or None."""
    for field in required_fields:
        if field not in data:
            return {
                "status": "error",
                "message": f"Missing required field: {field}"
            }, 400
    return None


def validate_add_message(data: Dict[str, Any]) -> Optional[Tuple[Dict, int]]:
    """
    Validate POST /messages request data.
    Returns (error_response, status_code) on failure, None on success.
    """
    error = _validate_required_fields(data, ["conversation_id", "role", "content"])
    if error:
        return error

    if data["role"] not in VALID_ROLES:
        return {
            "status": "error",
            "message": f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}"
        }, 400

    return None


def validate_chat_request(data: Dict[str, Any]) -> Optional[Tuple[Dict, int]]:
    """
    Validate POST /chat request data.
    Returns (error_response, status_code) on failure, None on success.
    """
    return _validate_required_fields(data, ["conversation_id", "message"])

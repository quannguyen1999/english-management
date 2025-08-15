import os
from dotenv import load_dotenv

load_dotenv()

# ChromaDB Configuration
CHROMA_HOST = os.getenv("CHROMA_HOST", "localhost")
CHROMA_PORT = int(os.getenv("CHROMA_PORT", "8000"))

# Collection Configuration
COLLECTION_NAME = "chat_messages"
COLLECTION_METADATA = {
    "hnsw:space": "cosine",
    "description": "Chat messages with conversation tracking"
}

# Message Configuration
MAX_MESSAGE_LENGTH = 10000  # Maximum characters per message
MAX_CONVERSATION_MESSAGES = 1000  # Maximum messages per conversation 
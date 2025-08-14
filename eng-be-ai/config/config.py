import os

url = os.getenv("OLLAMA_URL") or "http://localhost:11434/api/generate"
model = os.getenv("MODEL_OLLAMA") or "gemma2:2b"







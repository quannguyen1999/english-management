# WebSocket TTS Streaming - Production Architecture

## Setup

### Backend (Python FastAPI)

0. Init:

```bash
python3 -m venv venv
```

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run the server:

```bash
uvicorn server:app --port 8000 --reload
```

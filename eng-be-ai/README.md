# English Management AI Backend

A Flask-based backend service for English language management with AI capabilities and ChromaDB-powered conversation storage.

## Prerequisites

- Python 3.11 or higher
- Poetry (Python dependency manager)
- Git Bash (for Windows users)
- ChromaDB server running on localhost:8000

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd eng-be-ai
```

2. Install dependencies using Poetry:
```bash
poetry install
```

3. Start ChromaDB server (in a separate terminal):
```bash
# Install ChromaDB if you haven't already
pip install chromadb

# Start ChromaDB server
chroma run --host localhost --port 8000
```

## Running the Application

### Using Git Bash (Recommended for Windows)

1. **Activate the virtual environment:**
```bash
source venv/Scripts/activate
```

2. **Run the application:**
```bash
python main.py
```

### Alternative: Using PowerShell

1. **Activate the virtual environment:**
```powershell
.\venv\Scripts\Activate.ps1
```

2. **Run the application:**
```powershell
python main.py
```

## Project Structure

```
eng-be-ai/
├── config/          # Configuration files
│   ├── config.py    # General configuration
│   └── chroma_config.py  # ChromaDB configuration
├── controller/      # API controllers
│   ├── ai_controller.py      # AI endpoints
│   └── conversation_controller.py  # Conversation endpoints
├── service/         # Business logic services
│   ├── ai_service.py        # AI service
│   └── chroma_service.py    # ChromaDB conversation service
├── templates/       # HTML templates
├── main.py         # Application entry point
└── pyproject.toml  # Poetry configuration
```

## Features

### AI Capabilities
- Text generation using Ollama
- Streaming AI responses
- Chat functionality

### Conversation Storage with ChromaDB
- Store and retrieve conversation messages
- Semantic search within conversations
- Message metadata tracking (role, timestamp, conversation_id)
- Conversation statistics and management

## API Endpoints

### AI Endpoints
- `POST /ai/generate` - Generate text using AI
- `POST /ai/chat` - Chat with AI
- `POST /ai/stream` - Stream AI responses
- `GET /ai/health` - AI service health check

### Conversation Endpoints
- `POST /messages` - Add a new message to a conversation
- `GET /conversations/{conversation_id}` - Get all messages in a conversation
- `POST /search` - Semantic search within a conversation
- `GET /conversations/{conversation_id}/stats` - Get conversation statistics
- `DELETE /conversations/{conversation_id}` - Delete a conversation
- `POST /chat` - Send a message and get AI response (stores both in conversation)
- `GET /chroma/health` - ChromaDB connection health check

### New Chat Endpoint

The `/chat` endpoint combines AI conversation with automatic storage:

**Request:**
```json
POST /chat
{
  "conversation_id": "conv_12345",
  "message": "Hello, how are you?",
  "max_tokens": 1000,
  "temperature": 0.5
}
```

**Response:**
```json
{
  "status": "success",
  "conversation_id": "conv_12345",
  "user_message_id": "msg_user_123",
  "ai_message_id": "msg_ai_456",
  "ai_response": "Hello! I'm doing well, thank you for asking...",
  "context_used": "Previous conversation context if available"
}
```

This endpoint automatically:
1. Stores the user message in ChromaDB
2. Retrieves conversation history for context
3. Generates an AI response using the context
4. Stores the AI response in ChromaDB
5. Returns the AI response with metadata

## Conversation Storage Schema

Each message is stored in ChromaDB with the following structure:

```json
{
  "id": "msg_43",
  "document": "Sure, I can help you with that!",
  "metadata": {
    "conversation_id": "conv_12345",
    "role": "assistant",
    "timestamp": "2025-08-15T10:20:00Z"
  }
}
```

## Testing

Run the test script to verify ChromaDB functionality:

```bash
python test_chroma.py
```

This will test:
- Adding messages to conversations
- Retrieving conversation history
- Semantic search functionality
- Conversation statistics

## Environment Variables

Copy the example environment file and configure your settings:
```bash
cp env.example .env
```

Edit `.env` with your configuration values:

```bash
# Ollama Configuration
URL_OLLAMA=http://localhost:11434/api/generate
MODEL_OLLAMA=gemma2:2b

# ChromaDB Configuration
CHROMA_HOST=localhost
CHROMA_PORT=8000
```

## Development

- The application uses Flask as the web framework
- ChromaDB for vector storage and semantic search
- Poetry for dependency management
- Black for code formatting
- Flake8 for linting

## Contributing

1. Ensure code is formatted with Black
2. Run linting with Flake8
3. Follow the existing code structure and patterns
4. Test ChromaDB functionality before submitting changes

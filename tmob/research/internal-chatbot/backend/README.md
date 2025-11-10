# Backend - Internal Chatbot API

FastAPI backend service for the Internal Developer Assistant Chatbot.

## Features

- RESTful API for chat interactions
- WebSocket support for real-time responses
- RAG (Retrieval-Augmented Generation) system
- Vector database integration (ChromaDB)
- LLM integration (OpenAI GPT-4o)
- Intent detection and classification
- Audit logging and monitoring

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On macOS/Linux
# venv\Scripts\activate  # On Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

Copy `.env.example` from the root directory and create `.env`:

```bash
cp ../.env.example .env
```

Edit `.env` and add your OpenAI API key and other configurations.

### 4. Run the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── chat.py      # Chat endpoints
│   │   │   └── health.py    # Health check endpoints
│   ├── core/
│   │   ├── __init__.py
│   │   ├── rag.py           # RAG system implementation
│   │   ├── llm.py           # LLM integration
│   │   └── vector_store.py  # Vector database operations
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py       # Pydantic models
│   └── utils/
│       ├── __init__.py
│       ├── logger.py        # Logging utilities
│       └── helpers.py       # Helper functions
├── tests/
│   └── test_api.py
└── requirements.txt
```

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Chat
- `POST /api/chat` - Send a message and get response
- `WS /api/chat/stream` - WebSocket for streaming responses

### Intent Detection
- `POST /api/intent` - Detect intent from user message

## Testing

```bash
pytest tests/
```

## Development

Run with auto-reload:

```bash
uvicorn app.main:app --reload
```

Access API docs at: http://localhost:8000/docs

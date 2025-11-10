# Internal Developer Assistant Chatbot

AI-powered internal chatbot using RAG (Retrieval-Augmented Generation) and LLM technology.

## Project Overview

This chatbot serves as a natural language interface to company systems, allowing employees to:
- Query forms, project data, and organizational information
- Check request statuses
- Access knowledge base content conversationally
- Submit internal requests through natural conversation

## Architecture

- **Frontend**: React chat interface
- **Backend**: FastAPI orchestrator
- **Retrieval**: LangChain for RAG
- **Vector Store**: ChromaDB
- **Embeddings**: text-embedding-3-small
- **LLM**: GPT-4o (configurable)

## Project Structure

```
.
├── backend/          # FastAPI backend service
├── frontend/         # React chat UI
├── data-pipeline/    # Data ingestion and processing
└── docs/            # Documentation
```

## Performance Targets

- Intent detection: ≥ 90%
- Retrieval accuracy: ≥ 85%
- Answer correctness: ≥ 80%
- Response latency: ≤ 3 seconds

## Development Timeline

Estimated 17-19 days across 6 phases:
1. Planning + API setup (2 days)
2. Data preparation & embedding (5-6 days)
3. RAG orchestration (3-4 days)
4. LLM integration (2 days)
5. Backend + frontend integration (4 days)
6. Testing & demo (3 days)

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- OpenAI API key (or local LLM setup)

### Setup

See individual README files in:
- `backend/README.md` - Backend setup
- `frontend/README.md` - Frontend setup
- `data-pipeline/README.md` - Data processing setup

## License

Internal use only

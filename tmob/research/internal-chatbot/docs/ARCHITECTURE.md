# Architecture Overview

## System Architecture

```
┌─────────────┐
│   Frontend  │ (React - Optional)
│  Chat UI    │
└──────┬──────┘
       │ HTTP/WebSocket
       │
┌──────▼──────────────────────────────────────┐
│         FastAPI Backend                      │
│                                              │
│  ┌────────────────┐    ┌─────────────────┐ │
│  │  API Routes    │    │   LLM Service   │ │
│  │  - Chat        │◄───┤   (OpenAI)      │ │
│  │  - Intent      │    └─────────────────┘ │
│  │  - Health      │                         │
│  └───────┬────────┘                         │
│          │                                   │
│  ┌───────▼────────┐                         │
│  │   RAG System   │                         │
│  │  - Retrieval   │                         │
│  │  - Context     │                         │
│  └───────┬────────┘                         │
│          │                                   │
│  ┌───────▼────────┐                         │
│  │  Vector Store  │                         │
│  │  (ChromaDB)    │                         │
│  └────────────────┘                         │
└──────────────────────────────────────────────┘
           ▲
           │
    ┌──────┴──────┐
    │   Data      │
    │  Pipeline   │
    │             │
    │ - Ingest    │
    │ - Process   │
    │ - Chunk     │
    │ - Embed     │
    └─────────────┘
```

## Component Breakdown

### 1. Frontend (React - Optional)
- **Purpose**: User interface for chat interactions
- **Technology**: React.js
- **Features**:
  - Chat interface
  - Message history
  - Real-time responses
  - Source document display

### 2. Backend API (FastAPI)
- **Purpose**: Orchestrates all services and handles requests
- **Technology**: FastAPI (Python)
- **Responsibilities**:
  - Request routing
  - Session management
  - Response coordination
  - Error handling

### 3. RAG System
- **Purpose**: Retrieval-Augmented Generation
- **Technology**: LangChain
- **Process**:
  1. Receive user query
  2. Generate query embedding
  3. Search vector database
  4. Retrieve top-k relevant documents
  5. Build context for LLM
  6. Return augmented context

### 4. LLM Service
- **Purpose**: Natural language understanding and generation
- **Technology**: OpenAI GPT-4o API
- **Functions**:
  - Response generation
  - Intent detection
  - Entity extraction
  - Streaming responses

### 5. Vector Store
- **Purpose**: Store and retrieve document embeddings
- **Technology**: ChromaDB
- **Operations**:
  - Store embeddings
  - Similarity search
  - Metadata filtering
  - Persistence

### 6. Data Pipeline
- **Purpose**: Process and load documents
- **Technology**: Python + LangChain
- **Steps**:
  1. Document ingestion
  2. Text cleaning
  3. PII removal
  4. Chunking (800 tokens)
  5. Embedding generation
  6. Vector store loading

## Data Flow

### Chat Request Flow

```
1. User sends message
   ↓
2. Backend receives request
   ↓
3. RAG System retrieves context
   ├─ Generate query embedding
   ├─ Search vector store
   └─ Get top-k documents
   ↓
4. LLM Service generates response
   ├─ System prompt
   ├─ Retrieved context
   └─ User message
   ↓
5. Response sent to user
```

### Document Ingestion Flow

```
1. Raw documents
   ↓
2. Text extraction
   ↓
3. Cleaning & normalization
   ├─ Remove special chars
   ├─ Normalize whitespace
   └─ Remove PII
   ↓
4. Chunking
   ├─ Split into 800-token chunks
   └─ 200-token overlap
   ↓
5. Embedding generation
   ↓
6. Store in ChromaDB
```

## Key Design Decisions

### 1. Chunking Strategy
- **Size**: 800 tokens per chunk
- **Overlap**: 200 tokens
- **Rationale**: Balance between context preservation and retrieval precision

### 2. Embedding Model
- **Model**: text-embedding-3-small
- **Rationale**: Fast, cost-effective, good performance for enterprise data

### 3. LLM Selection
- **Model**: GPT-4o
- **Rationale**: Strong reasoning, low latency, JSON mode support

### 4. Vector Store
- **Database**: ChromaDB
- **Rationale**: Simple, local persistence, no external dependencies for MVP

### 5. API Framework
- **Framework**: FastAPI
- **Rationale**: Fast, async support, automatic API docs, type safety

## Security Considerations

1. **API Key Management**: Environment variables, never committed
2. **PII Protection**: Removed during data processing
3. **Authentication**: OAuth2/SSO ready (optional for MVP)
4. **Audit Logging**: All requests logged with timestamps
5. **Rate Limiting**: To be implemented in production

## Scalability

### Current (MVP)
- Single server deployment
- Local vector store
- Synchronous processing

### Future Enhancements
- Load balancing
- Distributed vector store (Pinecone/Weaviate)
- Caching layer (Redis)
- Async job processing
- Horizontal scaling

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Response Latency | ≤ 3 seconds | ~2 seconds |
| Intent Accuracy | ≥ 90% | TBD |
| Retrieval Precision | ≥ 85% | TBD |
| Answer Correctness | ≥ 80% | TBD |
| Concurrent Users | 50+ | TBD |

## Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 18+ |
| Backend | FastAPI | 0.104+ |
| LLM | OpenAI GPT-4o | Latest |
| Embeddings | text-embedding-3-small | Latest |
| Vector Store | ChromaDB | 0.4+ |
| RAG Framework | LangChain | 0.1+ |
| Python | Python | 3.10+ |
| Node.js | Node.js | 18+ |

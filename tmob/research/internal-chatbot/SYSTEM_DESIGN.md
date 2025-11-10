# Internal Chatbot - System Design Document

## System Overview

The Internal Developer Assistant Chatbot is a RAG (Retrieval-Augmented Generation) system that provides contextual responses to developer queries using internal company documents. The system combines document retrieval with large language model generation to deliver accurate, source-backed answers.

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │    │   Mobile App    │    │   API Client    │
│                 │    │                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │      FastAPI Server     │
                    │   (Backend Service)     │
                    │                         │
                    │  ┌─────────────────┐   │
                    │  │  Chat Router    │   │
                    │  │  /api/chat      │   │
                    │  └─────────────────┘   │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │   RAG System    │ │   LLM Service   │ │  Vector Store   │
    │                 │ │                 │ │   (ChromaDB)    │
    │ - Document      │ │ - OpenAI GPT-4o │ │                 │
    │   Retrieval     │ │ - Intent        │ │ - Embeddings    │
    │ - Context       │ │   Detection     │ │ - Metadata      │
    │   Building      │ │ - Response Gen  │ │ - Search Index  │
    └─────────────────┘ └─────────────────┘ └─────────────────┘
```

## Detailed System Flow

### 1. Data Ingestion Pipeline

```
Raw Documents                    Processing                    Vector Storage
─────────────────               ─────────────                ─────────────────

┌─────────────────┐            ┌─────────────────┐           ┌─────────────────┐
│  Sample Data    │            │  Ingest Script  │           │   ChromaDB      │
│                 │            │                 │           │                 │
│ org_structure   │───────────▶│ - Text Extract  │──────────▶│ - Embeddings    │
│ .txt            │            │ - Chunking      │           │ - Metadata      │
│                 │            │ - Metadata      │           │ - Search Index  │
│ projects.txt    │            │   Extraction    │           │                 │
│                 │            │                 │           │                 │
│ templates.json  │            │ - Format        │           │                 │
│                 │            │   Conversion    │           │                 │
└─────────────────┘            └─────────────────┘           └─────────────────┘
        │                              │                              │
        │                              │                              │
        ▼                              ▼                              ▼
┌─────────────────┐            ┌─────────────────┐           ┌─────────────────┐
│ More Documents  │            │ Load to Vector  │           │ Queryable Vector│
│ (Future)        │            │ Store Script    │           │ Database        │
└─────────────────┘            └─────────────────┘           └─────────────────┘
```

### 2. RAG Query Flow

```
User Query Processing Flow
──────────────────────────

┌─────────────────┐
│   User Input    │
│ "Who is the VP  │
│ of Engineering?"│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Chat Endpoint  │    │   RAG System    │    │  Vector Search  │
│                 │    │                 │    │                 │
│ - Validate      │────▶ - Query Vector  │────▶ - Semantic     │
│ - Route         │    │   Store         │    │   Similarity    │
│ - Log Request   │    │ - Rank Results  │    │ - Top 5 Docs    │
└─────────────────┘    └─────────────────┘    └─────────┬───────┘
          │                      │                      │
          │                      │                      │
          │                      ▼                      │
          │            ┌─────────────────┐              │
          │            │ Context Builder │              │
          │            │                 │              │
          │            │ - Concatenate   │◀─────────────┘
          │            │   Retrieved     │
          │            │   Documents     │
          │            │ - Format for    │
          │            │   LLM Input     │
          │            └─────────┬───────┘
          │                      │
          │                      ▼
          │            ┌─────────────────┐
          │            │  LLM Service    │
          │            │                 │
          │            │ - OpenAI API    │
          │            │ - Context +     │
          │            │   Query         │
          │            │ - Generate      │
          │            │   Response      │
          │            └─────────┬───────┘
          │                      │
          ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│   Response      │    │   Intent        │
│   Formatting    │    │   Detection     │
│                 │    │   (Optional)    │
│ - Add Sources   │    │                 │
│ - Metadata      │    │ - Classify      │
│ - Timestamp     │    │   Query Type    │
│ - JSON Format   │    │ - Confidence    │
└─────────┬───────┘    └─────────────────┘
          │
          ▼
┌─────────────────┐
│  Final Response │
│                 │
│ {               │
│   "message":    │
│   "sources":    │
│   "intent":     │
│   "timestamp"   │
│ }               │
└─────────────────┘
```

## Component Architecture

### Backend Services

```
FastAPI Application Structure
─────────────────────────────

app/
├── main.py                 ◀── Application Entry Point
│   ├── FastAPI Instance
│   ├── CORS Middleware
│   ├── Route Registration
│   └── Startup/Shutdown Events
│
├── api/
│   └── routes/
│       ├── health.py       ◀── Health Check Endpoints
│       └── chat.py         ◀── Chat API Endpoints
│           ├── POST /chat
│           ├── POST /intent
│           └── WebSocket /chat/stream
│
├── core/                   ◀── Business Logic Layer
│   ├── rag.py             ◀── RAG System Implementation
│   │   ├── Document Retrieval
│   │   ├── Context Building
│   │   └── Vector Store Interface
│   │
│   ├── llm.py             ◀── LLM Service
│   │   ├── OpenAI Integration
│   │   ├── Response Generation
│   │   ├── Intent Detection
│   │   └── Streaming Support
│   │
│   └── vector_store.py    ◀── Vector Database Interface
│       ├── ChromaDB Client
│       ├── Embedding Management
│       └── Search Operations
│
├── models/
│   └── schemas.py         ◀── Data Models
│       ├── ChatRequest
│       ├── ChatResponse
│       ├── IntentRequest
│       └── IntentResponse
│
└── utils/
    ├── logger.py          ◀── Logging Configuration
    └── helpers.py         ◀── Utility Functions
```

### Frontend Architecture

```
Frontend Structure
──────────────────

┌─────────────────────────────────────────────────────────┐
│                    Chat Interface                       │
│                   (chat.html)                          │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Header    │  │  Messages   │  │   Input     │    │
│  │             │  │   Area      │  │   Area      │    │
│  │ - Title     │  │             │  │             │    │
│  │ - Subtitle  │  │ - User Msgs │  │ - Text Box  │    │
│  └─────────────┘  │ - Bot Msgs  │  │ - Send Btn  │    │
│                   │ - Sources   │  │ - Shortcuts │    │
│  ┌─────────────┐  │ - Typing    │  └─────────────┘    │
│  │ Suggestions │  │   Indicator │                     │
│  │             │  │             │                     │
│  │ - Quick     │  └─────────────┘                     │
│  │   Questions │                                      │
│  └─────────────┘                                      │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   JavaScript    │
                    │   Controller    │
                    │                 │
                    │ - Event Handlers│
                    │ - API Calls     │
                    │ - DOM Updates   │
                    │ - Error Handling│
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   HTTP Client   │
                    │                 │
                    │ - Fetch API     │
                    │ - JSON Parsing  │
                    │ - Error Handling│
                    └─────────────────┘
```

## Data Flow Sequence

```
Complete Request-Response Cycle
───────────────────────────────

User                Frontend           Backend API        RAG System         Vector DB          LLM Service
 │                     │                   │                 │                 │                 │
 │ 1. Type Question    │                   │                 │                 │                 │
 │────────────────────▶│                   │                 │                 │                 │
 │                     │                   │                 │                 │                 │
 │                     │ 2. POST /api/chat │                 │                 │                 │
 │                     │──────────────────▶│                 │                 │                 │
 │                     │                   │                 │                 │                 │
 │                     │                   │ 3. Query Vector │                 │                 │
 │                     │                   │    Store        │                 │                 │
 │                     │                   │────────────────▶│                 │                 │
 │                     │                   │                 │                 │                 │
 │                     │                   │                 │ 4. Semantic     │                 │
 │                     │                   │                 │    Search       │                 │
 │                     │                   │                 │────────────────▶│                 │
 │                     │                   │                 │                 │                 │
 │                     │                   │                 │ 5. Return Docs  │                 │
 │                     │                   │                 │◀────────────────│                 │
 │                     │                   │                 │                 │                 │
 │                     │                   │ 6. Build Context│                 │                 │
 │                     │                   │◀────────────────│                 │                 │
 │                     │                   │                 │                 │                 │
 │                     │                   │ 7. Generate Response              │                 │
 │                     │                   │──────────────────────────────────▶│                 │
 │                     │                   │                 │                 │                 │
 │                     │                   │ 8. AI Response                    │                 │
 │                     │                   │◀──────────────────────────────────│                 │
 │                     │                   │                 │                 │                 │
 │                     │ 9. JSON Response  │                 │                 │                 │
 │                     │◀──────────────────│                 │                 │                 │
 │                     │                   │                 │                 │                 │
 │ 10. Display Answer  │                   │                 │                 │                 │
 │◀────────────────────│                   │                 │                 │                 │
 │                     │                   │                 │                 │                 │
```

## Technology Stack

### Core Technologies
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Data Layer    │
│                 │    │                 │    │                 │
│ - HTML5         │    │ - Python 3.12   │    │ - ChromaDB      │
│ - CSS3          │    │ - FastAPI       │    │ - Vector Store  │
│ - JavaScript    │    │ - Uvicorn       │    │ - JSON Files    │
│ - Fetch API     │    │ - Asyncio       │    │ - File System   │
└─────────────────┘    └─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Services   │    │   Frameworks    │    │   DevOps        │
│                 │    │                 │    │                 │
│ - OpenAI GPT-4o │    │ - LangChain     │    │ - Git           │
│ - Embeddings    │    │ - Pydantic      │    │ - Virtual Env   │
│ - Intent Det.   │    │ - Asyncio       │    │ - pip           │
│ - Streaming     │    │ - JSON Schema   │    │ - Auto-reload   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## System Design Decisions

### 1. Architecture Patterns

**Microservices Approach**
- Separated concerns: API, RAG, LLM, Vector Store
- Each component can be scaled independently
- Clean interfaces between layers

**Async/Await Pattern**
- Non-blocking I/O for LLM calls
- Better concurrent user handling
- Responsive user experience

### 2. Data Storage Strategy

**Vector Database (ChromaDB)**
- Fast semantic search capabilities
- Local storage for development
- Easy migration to cloud solutions

**Document Processing**
- Chunking strategy for optimal retrieval
- Metadata preservation for source tracking
- Flexible format support (txt, json, etc.)

### 3. API Design

**RESTful Endpoints**
- Clear, predictable URL structure
- Standard HTTP methods and status codes
- JSON request/response format

**Auto-Generated Documentation**
- FastAPI automatically creates OpenAPI docs
- Interactive testing interface
- Always up-to-date API documentation

## Security Considerations

### Environment Variables
```
Security Layer: Environment Configuration
─────────────────────────────────────────

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   .env File     │    │   .gitignore    │    │   Runtime       │
│   (Local Only)  │    │   Protection    │    │   Access        │
│                 │    │                 │    │                 │
│ - API Keys      │────▶ - .env excluded │────▶ - os.getenv()  │
│ - Secrets       │    │ - No commit     │    │ - Secure access │
│ - Config        │    │ - No exposure   │    │ - Runtime only  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Privacy
- No sensitive data in version control
- Local vector store for proprietary documents
- API key protection and rotation support
- Request/response logging controls

## Performance Characteristics

### Response Times
- **Simple queries** (no RAG): ~500ms
- **RAG queries**: ~2-5 seconds
- **Vector search**: ~100-300ms
- **LLM generation**: ~1-4 seconds

### Resource Usage
- **Memory**: ~500MB (with models loaded)
- **Storage**: ~50MB (vector database)
- **CPU**: Moderate during query processing
- **Network**: OpenAI API calls only

### Scalability Considerations
- **Concurrent users**: 10-50 (single instance)
- **Document capacity**: 10,000+ documents
- **Query throughput**: 20-100 queries/minute
- **Horizontal scaling**: Load balancer + multiple instances

## Deployment Architecture

```
Production Deployment Strategy
──────────────────────────────

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Load Balancer  │    │   Web Servers   │    │   Database      │
│                 │    │                 │    │                 │
│ - Route Traffic │    │ - FastAPI App   │    │ - Vector Store  │
│ - SSL Termination│───▶ - Multiple      │────▶ - Persistent   │
│ - Health Checks │    │   Instances     │    │   Storage       │
└─────────────────┘    └─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Monitoring    │    │   External      │    │   CI/CD         │
│                 │    │   Services      │    │                 │
│ - Logs          │    │ - OpenAI API    │    │ - Git Hooks     │
│ - Metrics       │    │ - CDN (Static)  │    │ - Auto Deploy   │
│ - Alerts        │    │ - DNS           │    │ - Testing       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Future Enhancements

### Planned Features
1. **Authentication & Authorization**
   - User login system
   - Role-based access control
   - API key management

2. **Enhanced RAG**
   - Multiple document formats (PDF, Word, etc.)
   - Real-time document updates
   - Advanced chunking strategies

3. **Analytics & Monitoring**
   - Query analytics dashboard
   - Performance metrics
   - User interaction tracking

4. **Advanced AI Features**
   - Multi-turn conversations
   - Context memory across sessions
   - Custom fine-tuned models

---

**Document Version**: 1.0  
**Last Updated**: November 9, 2025  
**Architecture Review Date**: November 9, 2025
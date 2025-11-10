# Internal Chatbot - Installation & Build Guide

## Project Overview

This project is an AI-powered internal chatbot using RAG (Retrieval-Augmented Generation) with OpenAI GPT-4o, FastAPI backend, and a web-based frontend. The chatbot helps developers with templates, deployment processes, organizational information, and project details.

## Prerequisites

- **Python 3.10+** (we used Python 3.12)
- **OpenAI API Key** 
- **Git**
- **Virtual Environment** support
- **Web Browser** for testing the interface

## Installation Steps

### 1. Initial Setup

```bash
# Navigate to the project directory
cd /Users/sghosh61/Documents/IDP/code-base/development/research/internal-chatbot

# Verify project structure exists
ls -la
# Should see: backend/, frontend/, data-pipeline/, .env.example, etc.
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file and add your OpenAI API key
nano .env
# Replace: OPENAI_API_KEY=your_openai_api_key_here
# With: OPENAI_API_KEY=sk-your-actual-api-key
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Data Pipeline Setup

```bash
# Navigate to data pipeline (from project root)
cd data-pipeline

# Install data pipeline dependencies
pip install -r requirements.txt

# Process sample documents
python scripts/ingest_documents.py \
    --source ./sample_data \
    --format txt \
    --output ./processed_documents.json

# Load documents into vector store
python scripts/load_to_vectorstore.py \
    --input ./processed_documents.json \
    --batch-size 50
```

### 5. Start the Backend Server

```bash
# Navigate back to backend directory
cd ../backend

# Ensure virtual environment is activated
source venv/bin/activate

# Start the FastAPI server
uvicorn app.main:app --reload
```

The server will start at: http://localhost:8000

## Access Points

- **Main API**: http://localhost:8000
- **Chat Interface**: http://localhost:8000/chat
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Testing the Installation

### 1. Quick Health Check
```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy"}
```

### 2. Simple API Test
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "hello", "use_rag": false}'
```

### 3. RAG-Enabled Test
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "what is TKE?", "use_rag": true}'
```

### 4. Web Interface Test
Open browser and go to: http://localhost:8000/chat

Try these questions:
- "What technologies are available?"
- "Who is the VP of Engineering?"
- "How do I deploy to TKE?"
- "What are the active projects?"

## Problems Faced & Solutions

### Problem 1: Virtual Environment Activation Issues
**Issue**: `source: no such file or directory: venv/bin/activate`

**Root Cause**: Commands were being run from wrong directory or in separate terminal sessions

**Solution**: 
- Always verify current directory with `pwd`
- Use full command chains: `cd /path/to/backend && source venv/bin/activate && uvicorn app.main:app --reload`
- Ensure consistency in terminal sessions

### Problem 2: JSON Parsing Errors in Intent Detection
**Issue**: `Error detecting intent: '"intent"'` and `cannot access local variable 'json'`

**Root Causes**:
- OpenAI API returning malformed JSON responses
- Variable scoping issues with imports inside try blocks

**Solutions**:
- Moved `import json` to top of function
- Added robust JSON parsing with regex fallbacks
- Implemented graceful fallbacks for intent detection failures
- Added proper error handling to prevent 500 errors

### Problem 3: Frontend-Backend Communication Mismatch
**Issue**: Frontend showing "Sorry, I encountered an error" despite successful backend responses

**Root Causes**:
- Frontend expected `data.response` but backend returned `data.message`
- Frontend sending `conversation_history: []` but backend expected `use_rag: true`

**Solutions**:
- Fixed field mapping in frontend JavaScript
- Updated request payload structure
- Ensured consistent API contract

### Problem 4: Server Restart Issues
**Issue**: Server reloading too frequently, causing interrupted requests

**Root Cause**: Auto-reload triggered by file saves during development

**Solution**: 
- Made targeted edits instead of frequent saves
- Used stable command sequences for server startup

### Problem 5: ChromaDB Telemetry Warnings
**Issue**: `Failed to send telemetry event` warnings in logs

**Root Cause**: ChromaDB version compatibility issue

**Status**: Non-critical warnings that don't affect functionality - left as-is since they don't impact user experience

## Project Architecture

```
internal-chatbot/
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── api/routes/     # API endpoints
│   │   ├── core/           # Core services (LLM, RAG, Vector Store)
│   │   ├── models/         # Pydantic schemas
│   │   └── utils/          # Helper functions
│   ├── venv/               # Virtual environment (local only)
│   ├── chroma_db/          # Vector database (local only)
│   ├── .env                # Environment variables (local only)
│   └── requirements.txt    # Python dependencies
├── frontend/               # Web interface
│   └── chat.html          # Single-page chat application
├── data-pipeline/          # Document processing
│   ├── sample_data/       # Sample documents
│   ├── scripts/           # Processing scripts
│   └── processed_documents.json
└── docs/                  # Documentation
```

## Security Notes

- .env file is in .gitignore - OpenAI API key stays local
- chroma_db/ is in .gitignore - Vector database stays local  
- venv/ is in .gitignore - Virtual environment stays local
- No sensitive data is committed to version control

## Features Implemented

- **RAG System**: Document retrieval from vector store
- **OpenAI Integration**: GPT-4o for response generation
- **Intent Detection**: With graceful fallbacks
- **Web Interface**: Clean, responsive chat UI
- **Error Handling**: Robust error recovery
- **API Documentation**: Auto-generated with FastAPI
- **Health Checks**: System status monitoring
- **Source Citations**: Shows document sources in responses

## Example Use Cases

The chatbot successfully answers questions about:

1. **Technology Templates**:
   - "What Node.js templates are available?"
   - "How do I use Spring Boot template?"

2. **Deployment Processes**:
   - "How do I deploy to TKE?"
   - "What is the difference between TKE and Conducktor?"

3. **Organizational Information**:
   - "Who is the VP of Engineering?" (Answer: Sarah Johnson)
   - "Who leads the Backend team?" (Answer: Alex Rodriguez)

4. **Project Status**:
   - "What are the active projects?"
   - "What is Project Alpha status?"

## Development Workflow

1. **Start Development Server**:
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

2. **Make Changes**: Edit code files (auto-reload enabled)

3. **Test Changes**: Use web interface or curl commands

4. **Commit Changes**: 
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

## Performance Notes

- **Response Time**: ~2-5 seconds for RAG-enabled queries
- **Vector Retrieval**: Typically finds 5 relevant documents
- **Memory Usage**: ~500MB with loaded models and vector store
- **Concurrent Users**: Tested with multiple simultaneous requests

## Troubleshooting

### Server Won't Start
1. Check if port 8000 is available: `lsof -i :8000`
2. Verify virtual environment is activated
3. Check Python version: `python --version`

### OpenAI API Errors
1. Verify API key in `.env` file
2. Check OpenAI account balance/usage
3. Ensure proper internet connectivity

### Empty Responses
1. Ensure `chroma_db/` directory exists with data
2. Re-run data pipeline if needed
3. Check server logs for vector store initialization

### Frontend Errors
1. Hard refresh browser (Cmd+Shift+R / Ctrl+F5)
2. Check browser console for JavaScript errors
3. Verify backend server is running

---

**Last Updated**: November 9, 2025
**Project Status**: Fully Functional
**Tested On**: macOS with Python 3.12
# Quick Start Guide

Complete setup guide for the Internal Developer Assistant Chatbot.

## Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- OpenAI API key
- Git

## Step-by-Step Setup

### 1. Environment Setup

Clone or navigate to the project directory:

```bash
cd /Users/sghosh61/Documents/sg/ft_prep/development/research/internal-chatbot
```

Create `.env` file from example:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```bash
OPENAI_API_KEY=your_actual_api_key_here
```

### 2. Backend Setup

Navigate to backend directory:

```bash
cd backend
```

Create and activate virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Data Pipeline Setup

Navigate to data-pipeline directory:

```bash
cd ../data-pipeline
```

Install dependencies (use same virtual environment):

```bash
pip install -r requirements.txt
```

Process and load sample documents:

```bash
# Process documents
python scripts/ingest_documents.py --source ./sample_data --format txt --output ./processed_documents.json

# Load into vector store
python scripts/load_to_vectorstore.py --input ./processed_documents.json
```

### 4. Start Backend Server

From the backend directory:

```bash
cd ../backend
source venv/bin/activate  # If not already activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000

API documentation: http://localhost:8000/docs

### 5. Frontend Setup (Optional for Full Demo)

Navigate to frontend directory:

```bash
cd ../frontend
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm start
```

Frontend will be available at: http://localhost:3000

## Testing the API

### Using curl

Test health endpoint:

```bash
curl http://localhost:8000/health
```

Test chat endpoint:

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the time off request process?", "use_rag": true}'
```

Test intent detection:

```bash
curl -X POST http://localhost:8000/api/intent \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I request equipment?"}'
```

### Using the API Docs

Navigate to http://localhost:8000/docs for an interactive API interface.

## Example Queries

Try these queries to test the system:

1. **Policy Questions**
   - "What is the time off request process?"
   - "How long does equipment approval take?"
   - "What training requests require budget approval?"

2. **Organizational Questions**
   - "Who leads the Backend team?"
   - "What is the reporting structure in Engineering?"
   - "When are sprint planning meetings?"

3. **Project Questions**
   - "What is the status of Project Alpha?"
   - "Which projects are the Frontend team working on?"
   - "When will the API modernization be complete?"

## Troubleshooting

### Backend won't start

- Check Python version: `python --version` (should be 3.10+)
- Ensure virtual environment is activated
- Verify all dependencies installed: `pip list`
- Check if port 8000 is available

### Vector store errors

- Ensure OpenAI API key is set correctly in `.env`
- Check ChromaDB directory permissions
- Re-run data ingestion if needed

### API returns empty responses

- Verify documents are loaded: Check for `chroma_db` directory
- Ensure OpenAI API key is valid and has credits
- Check backend logs for errors

## Next Steps

1. **Add More Documents**: Place your company documents in `data-pipeline/sample_data/` and re-run ingestion

2. **Customize System Prompt**: Edit `backend/app/core/llm.py` to customize the assistant's behavior

3. **Implement Authentication**: Follow the authentication guide in `docs/`

4. **Deploy to Production**: See deployment guide for cloud deployment options

## Project Structure

```
internal-chatbot/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── core/        # Core logic (RAG, LLM)
│   │   ├── models/      # Data models
│   │   └── utils/       # Utilities
│   └── tests/           # Tests
├── data-pipeline/       # Document processing
│   ├── scripts/         # Processing scripts
│   ├── sample_data/     # Sample documents
│   └── utils/           # Utility functions
├── frontend/            # React UI (optional)
└── docs/               # Documentation
```

## Support

For issues or questions:
- Check the README files in each directory
- Review API documentation at `/docs`
- Check backend logs for error details

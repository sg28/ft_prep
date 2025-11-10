# GET STARTED - Internal Developer Assistant Chatbot

## You're Ready to Build!

The complete project structure has been created at:
```
/Users/sghosh61/Documents/sg/ft_prep/development/research/internal-chatbot/
```

## What You Have

✅ **Backend API** - Complete FastAPI service with RAG + LLM  
✅ **Data Pipeline** - Document processing and vector store loading  
✅ **Sample Data** - 3 example documents ready to use  
✅ **Documentation** - Complete guides and architecture docs  
✅ **Test Scripts** - Automated setup and testing  

## Quick Start (3 Steps)

### Step 1: Add Your OpenAI API Key

```bash
cd /Users/sghosh61/Documents/sg/ft_prep/development/research/internal-chatbot
nano .env
```

Replace `your_openai_api_key_here` with your actual OpenAI API key, then save (Ctrl+X, Y, Enter).

### Step 2: Run Automated Setup

```bash
./setup.sh
```

This will:
- Create Python virtual environment
- Install all dependencies
- Process sample documents
- Load data into vector store

### Step 3: Start the Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

**Done!** Your chatbot is now running at http://localhost:8000

## Test It Out

### Option 1: Use the Test Script (Recommended)

```bash
# In a new terminal
cd /Users/sghosh61/Documents/sg/ft_prep/development/research/internal-chatbot
source backend/venv/bin/activate
python test_chatbot.py
```

### Option 2: Use curl

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the time off request process?", "use_rag": true}'
```

### Option 3: Interactive API Docs

Open in browser: http://localhost:8000/docs

## 📖 Example Queries to Try

1. "What is the time off request process?"
2. "Who leads the Backend team?"
3. "What is the status of Project Alpha?"
4. "How long does equipment approval take?"
5. "When are sprint planning meetings?"

## Documentation

- **PROJECT_SUMMARY.md** - Complete project overview
- **docs/QUICKSTART.md** - Detailed setup guide
- **docs/ARCHITECTURE.md** - System architecture
- **README.md** - Main project README

## Next Steps

### Add Your Own Documents

1. Place your documents in `data-pipeline/sample_data/`
2. Run: `python data-pipeline/scripts/ingest_documents.py --source data-pipeline/sample_data --format txt`
3. Load: `python data-pipeline/scripts/load_to_vectorstore.py --input data-pipeline/processed_documents.json`
4. Restart backend

### Customize the Assistant

Edit `backend/app/core/llm.py` to change:
- System prompts
- Intent categories
- Response behavior

### Build the Frontend

The frontend structure is ready in the `frontend/` directory. You can:
- Build a React chat UI
- Connect to the WebSocket endpoint for streaming
- Display source documents and intent

## Need Help?

### Common Issues

**"No module named 'app'"**
→ Make sure virtual environment is activated: `source backend/venv/bin/activate`

**"OpenAI API Error"**
→ Check your API key in `.env` file

**"Empty responses"**
→ Ensure documents are loaded: check for `chroma_db/` directory

### Check These

- Python version 3.10+: `python3 --version`
- Virtual env activated: Should see `(venv)` in terminal
- Backend running: Check http://localhost:8000/health
- Documents loaded: `ls -la chroma_db/`

## Project Files

```
30+ files created including:
- 7 backend API files
- 3 data pipeline scripts
- 3 sample documents
- 3 documentation files
- 1 automated setup script
- 1 test script
```

## Pro Tips

1. **Monitor Costs**: Check your OpenAI dashboard for API usage
2. **Version Control**: Consider initializing git: `git init`
3. **Environment**: Never commit `.env` file
4. **Scaling**: When ready, migrate to Pinecone for production vector store
5. **Testing**: Run `pytest backend/tests/` for automated tests

## You're All Set!

The project is ready to run. Follow the 3 steps above to get started!

Questions? Check PROJECT_SUMMARY.md for complete details.

---

**Built with:** FastAPI • LangChain • OpenAI • ChromaDB • Python

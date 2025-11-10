from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from app.config import settings
from app.api.routes import health, chat
from app.utils.logger import setup_logger
from pathlib import Path

# Setup logger
logger = setup_logger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered internal chatbot using RAG and LLM technology",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"Using LLM model: {settings.llm_model}")
    logger.info(f"Vector store location: {settings.chroma_persist_dir}")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down application")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Internal Developer Assistant Chatbot API",
        "version": settings.app_version,
        "docs": "/docs"
    }


@app.get("/chat")
async def serve_chat_ui():
    """Serve the chat interface."""
    frontend_path = Path(__file__).parent.parent.parent / "frontend" / "chat.html"
    return FileResponse(frontend_path)

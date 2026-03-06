from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from datetime import datetime
import asyncio
import logging
import os
import uvicorn
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles

from app.database import get_db, engine
from app import models, schemas, crud
from app.config import settings
from app.routers import auth, users, posts, connections, search, forms, datasets
from app.tasks import cleanup_underengaged_posts

logger = logging.getLogger(__name__)

# Create database tables
models.Base.metadata.create_all(bind=engine)

CLEANUP_INTERVAL_SECONDS = 7 * 24 * 60 * 60  # 1 week


async def _weekly_cleanup_loop():
    """Runs the post engagement cleanup once a week."""
    while True:
        await asyncio.sleep(CLEANUP_INTERVAL_SECONDS)
        try:
            result = cleanup_underengaged_posts()
            logger.info("Scheduled cleanup complete: %s", result)
        except Exception as exc:
            logger.error("Scheduled cleanup error: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(_weekly_cleanup_loop())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="Julienites API",
    description="API for Julienites Alumni Network Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# Serve uploaded files as static assets
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(posts.router, prefix="/api/posts", tags=["Posts"])
app.include_router(connections.router, prefix="/api/connections", tags=["Connections"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(forms.router, prefix="/api/forms", tags=["Forms"])\

app.include_router(datasets.router, prefix="/api/datasets", tags=["Datasets"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Julienites API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "health": "/api/health"
    }

@app.get("/api/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint"""
    try:
        # Try to execute a simple query
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}"
        )

@app.get("/api/version")
async def get_version():
    """Get API version"""
    return {
        "version": "1.0.0",
        "frontend_compatible": "0.1.1"
    }


@app.post("/api/admin/cleanup-posts")
async def trigger_post_cleanup():
    """
    Manually trigger the weekly post engagement cleanup.
    Deletes posts with fewer than 3 unique engagers (likers + commenters).
    """
    result = cleanup_underengaged_posts()
    return result

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
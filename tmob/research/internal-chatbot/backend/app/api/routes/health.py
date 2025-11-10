from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.config import settings
from datetime import datetime

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint to verify service status.
    
    Returns:
        Service health status
    """
    return HealthResponse(
        status="healthy",
        version=settings.app_version,
        timestamp=datetime.now()
    )

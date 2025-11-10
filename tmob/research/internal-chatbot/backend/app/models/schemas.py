from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ChatMessage(BaseModel):
    """Schema for a chat message."""
    role: str = Field(..., description="Role of the message sender (user/assistant)")
    content: str = Field(..., description="Content of the message")
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)


class ChatRequest(BaseModel):
    """Schema for chat request."""
    message: str = Field(..., description="User message", min_length=1)
    conversation_id: Optional[str] = Field(None, description="Conversation ID for context")
    use_rag: bool = Field(True, description="Whether to use RAG retrieval")


class ChatResponse(BaseModel):
    """Schema for chat response."""
    message: str = Field(..., description="Assistant response")
    conversation_id: str = Field(..., description="Conversation ID")
    sources: Optional[List[dict]] = Field(None, description="Source documents used")
    intent: Optional[str] = Field(None, description="Detected intent")
    confidence: Optional[float] = Field(None, description="Confidence score")
    timestamp: datetime = Field(default_factory=datetime.now)


class IntentRequest(BaseModel):
    """Schema for intent detection request."""
    message: str = Field(..., description="Message to analyze")


class IntentResponse(BaseModel):
    """Schema for intent detection response."""
    intent: str = Field(..., description="Detected intent")
    confidence: float = Field(..., description="Confidence score")
    entities: Optional[dict] = Field(None, description="Extracted entities")


class HealthResponse(BaseModel):
    """Schema for health check response."""
    status: str
    version: str
    timestamp: datetime = Field(default_factory=datetime.now)

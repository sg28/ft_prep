import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "timestamp" in data


def test_chat_endpoint():
    """Test chat endpoint."""
    payload = {
        "message": "What is the time off request process?",
        "use_rag": True
    }
    
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "conversation_id" in data
    assert isinstance(data["message"], str)


def test_intent_detection():
    """Test intent detection endpoint."""
    payload = {
        "message": "How do I submit a time off request?"
    }
    
    response = client.post("/api/intent", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "intent" in data
    assert "confidence" in data
    assert isinstance(data["confidence"], float)


def test_chat_invalid_message():
    """Test chat with invalid message."""
    payload = {
        "message": "",  # Empty message
        "use_rag": True
    }
    
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 422  # Validation error

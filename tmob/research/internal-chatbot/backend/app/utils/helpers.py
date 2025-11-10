import uuid
from typing import Optional


def generate_conversation_id() -> str:
    """Generate a unique conversation ID."""
    return str(uuid.uuid4())


def truncate_text(text: str, max_length: int = 500) -> str:
    """
    Truncate text to max length.
    
    Args:
        text: Text to truncate
        max_length: Maximum length
        
    Returns:
        Truncated text
    """
    if len(text) <= max_length:
        return text
    return text[:max_length] + "..."


def extract_metadata(document: dict) -> dict:
    """
    Extract relevant metadata from a document.
    
    Args:
        document: Document dictionary
        
    Returns:
        Metadata dictionary
    """
    return {
        "source": document.get("source", "unknown"),
        "title": document.get("title", ""),
        "page": document.get("page", 0)
    }

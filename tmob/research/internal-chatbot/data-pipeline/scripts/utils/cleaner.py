import re
from typing import List


def clean_text(text: str) -> str:
    """
    Clean and normalize text.
    
    Args:
        text: Input text
        
    Returns:
        Cleaned text
    """
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters but keep punctuation
    text = re.sub(r'[^\w\s\.,!?;:()\-\'\"]+', '', text)
    
    # Strip leading/trailing whitespace
    text = text.strip()
    
    return text


def remove_pii(text: str) -> str:
    """
    Remove personally identifiable information (PII).
    Basic implementation - should be enhanced for production.
    
    Args:
        text: Input text
        
    Returns:
        Text with PII removed
    """
    # Remove email addresses
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]', text)
    
    # Remove phone numbers (US format)
    text = re.sub(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', '[PHONE]', text)
    
    # Remove SSN-like patterns
    text = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '[SSN]', text)
    
    return text


def normalize_whitespace(text: str) -> str:
    """
    Normalize whitespace in text.
    
    Args:
        text: Input text
        
    Returns:
        Text with normalized whitespace
    """
    # Replace multiple spaces with single space
    text = re.sub(r' +', ' ', text)
    
    # Replace multiple newlines with double newline
    text = re.sub(r'\n+', '\n\n', text)
    
    return text.strip()


def extract_sentences(text: str) -> List[str]:
    """
    Extract sentences from text.
    
    Args:
        text: Input text
        
    Returns:
        List of sentences
    """
    # Simple sentence splitting (can be enhanced with NLTK)
    sentences = re.split(r'[.!?]+', text)
    return [s.strip() for s in sentences if s.strip()]

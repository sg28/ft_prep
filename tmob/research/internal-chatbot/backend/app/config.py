from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Configuration
    app_name: str = "Internal Developer Assistant Chatbot"
    app_version: str = "1.0.0"
    backend_host: str = "localhost"
    backend_port: int = 8000
    
    # OpenAI Configuration
    openai_api_key: str
    llm_model: str = "gpt-4o"
    embedding_model: str = "text-embedding-3-small"
    max_tokens: int = 4096
    temperature: float = 0.7
    
    # Vector Database
    chroma_persist_dir: str = "./chroma_db"
    
    # RAG Configuration
    chunk_size: int = 800
    chunk_overlap: int = 200
    top_k_results: int = 5
    
    # Authentication (Optional)
    auth_enabled: bool = False
    oauth_client_id: Optional[str] = None
    oauth_client_secret: Optional[str] = None
    
    # Logging
    log_level: str = "INFO"
    
    # CORS
    cors_origins: list = ["http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:8000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

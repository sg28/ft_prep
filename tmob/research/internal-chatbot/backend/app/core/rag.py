from typing import List
from langchain.schema import Document
from app.core.vector_store import VectorStore
from app.core.llm import LLMService
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


class RAGSystem:
    """RAG (Retrieval-Augmented Generation) system."""
    
    def __init__(self):
        """Initialize RAG system."""
        self.vector_store = VectorStore()
        logger.info("RAG system initialized")
    
    def retrieve(self, query: str, k: int = None) -> List[Document]:
        """
        Retrieve relevant documents for a query.
        
        Args:
            query: Search query
            k: Number of results to return
            
        Returns:
            List of relevant documents
        """
        k = k or settings.top_k_results
        logger.info(f"Retrieving top {k} documents for query: {query[:50]}...")
        
        try:
            documents = self.vector_store.similarity_search(query, k=k)
            logger.info(f"Retrieved {len(documents)} documents")
            return documents
        except Exception as e:
            logger.error(f"Error retrieving documents: {str(e)}")
            return []
    
    def retrieve_with_scores(
        self,
        query: str,
        k: int = None,
        score_threshold: float = 0.7
    ) -> List[tuple[Document, float]]:
        """
        Retrieve relevant documents with relevance scores.
        
        Args:
            query: Search query
            k: Number of results to return
            score_threshold: Minimum relevance score
            
        Returns:
            List of (document, score) tuples
        """
        k = k or settings.top_k_results
        logger.info(f"Retrieving documents with scores for query: {query[:50]}...")
        
        try:
            results = self.vector_store.similarity_search_with_score(query, k=k)
            
            # Filter by score threshold
            filtered_results = [
                (doc, score) for doc, score in results
                if score >= score_threshold
            ]
            
            logger.info(f"Retrieved {len(filtered_results)} documents above threshold {score_threshold}")
            return filtered_results
        except Exception as e:
            logger.error(f"Error retrieving documents with scores: {str(e)}")
            return []
    
    def add_documents(self, documents: List[Document]) -> List[str]:
        """
        Add documents to the RAG system.
        
        Args:
            documents: List of documents to add
            
        Returns:
            List of document IDs
        """
        logger.info(f"Adding {len(documents)} documents to RAG system")
        return self.vector_store.add_documents(documents)

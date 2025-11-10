from typing import List
import tiktoken
from langchain.text_splitter import RecursiveCharacterTextSplitter


class DocumentChunker:
    """Chunker for splitting documents into optimal sizes."""
    
    def __init__(
        self,
        chunk_size: int = 800,
        chunk_overlap: int = 200,
        encoding_name: str = "cl100k_base"
    ):
        """
        Initialize chunker.
        
        Args:
            chunk_size: Target size for each chunk in tokens
            chunk_overlap: Overlap between chunks in tokens
            encoding_name: Tiktoken encoding name
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.encoding = tiktoken.get_encoding(encoding_name)
        
        # Initialize text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=self._token_length,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
    
    def _token_length(self, text: str) -> int:
        """
        Calculate token length of text.
        
        Args:
            text: Input text
            
        Returns:
            Number of tokens
        """
        return len(self.encoding.encode(text))
    
    def chunk_text(self, text: str) -> List[str]:
        """
        Split text into chunks.
        
        Args:
            text: Input text
            
        Returns:
            List of text chunks
        """
        return self.text_splitter.split_text(text)
    
    def chunk_documents(self, documents: List[dict]) -> List[dict]:
        """
        Chunk multiple documents.
        
        Args:
            documents: List of document dicts with 'content' and 'metadata'
            
        Returns:
            List of chunked documents
        """
        chunked_docs = []
        
        for doc in documents:
            content = doc.get("content", "")
            metadata = doc.get("metadata", {})
            
            chunks = self.chunk_text(content)
            
            for i, chunk in enumerate(chunks):
                chunked_doc = {
                    "content": chunk,
                    "metadata": {
                        **metadata,
                        "chunk_index": i,
                        "total_chunks": len(chunks)
                    }
                }
                chunked_docs.append(chunked_doc)
        
        return chunked_docs
    
    def get_stats(self, text: str) -> dict:
        """
        Get chunking statistics for text.
        
        Args:
            text: Input text
            
        Returns:
            Dictionary with statistics
        """
        chunks = self.chunk_text(text)
        token_counts = [self._token_length(chunk) for chunk in chunks]
        
        return {
            "num_chunks": len(chunks),
            "avg_tokens_per_chunk": sum(token_counts) / len(token_counts) if token_counts else 0,
            "max_tokens": max(token_counts) if token_counts else 0,
            "min_tokens": min(token_counts) if token_counts else 0,
            "total_tokens": sum(token_counts)
        }

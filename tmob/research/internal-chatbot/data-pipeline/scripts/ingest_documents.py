#!/usr/bin/env python3
"""
Document ingestion script.
Loads documents from various sources and prepares them for vector storage.
"""

import os
import sys
import argparse
from pathlib import Path
from typing import List
import json

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent.parent))

from langchain.schema import Document
from langchain_community.document_loaders import (
    TextLoader,
    DirectoryLoader,
    JSONLoader,
    CSVLoader
)
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from utils.cleaner import clean_text, remove_pii, normalize_whitespace
from utils.chunker import DocumentChunker


def load_documents_from_directory(
    directory: str,
    file_format: str = "txt"
) -> List[Document]:
    """
    Load documents from a directory.
    
    Args:
        directory: Path to directory containing documents
        file_format: File format to load (txt, json, csv, md)
        
    Returns:
        List of loaded documents
    """
    print(f"Loading {file_format} documents from {directory}...")
    
    loader_map = {
        "txt": TextLoader,
        "md": TextLoader,
        "json": JSONLoader,
        "csv": CSVLoader,
    }
    
    if file_format not in loader_map:
        raise ValueError(f"Unsupported file format: {file_format}")
    
    loader = DirectoryLoader(
        directory,
        glob=f"**/*.{file_format}",
        loader_cls=loader_map[file_format],
        show_progress=True
    )
    
    documents = loader.load()
    print(f"Loaded {len(documents)} documents")
    return documents


def process_documents(documents: List[Document]) -> List[Document]:
    """
    Process and clean documents.
    
    Args:
        documents: List of raw documents
        
    Returns:
        List of processed documents
    """
    print("Processing documents...")
    processed = []
    
    for doc in documents:
        # Clean text
        content = clean_text(doc.page_content)
        content = normalize_whitespace(content)
        content = remove_pii(content)
        
        # Create processed document
        processed_doc = Document(
            page_content=content,
            metadata={
                **doc.metadata,
                "processed": True
            }
        )
        processed.append(processed_doc)
    
    print(f"Processed {len(processed)} documents")
    return processed


def chunk_documents(
    documents: List[Document],
    chunk_size: int = 800,
    chunk_overlap: int = 200
) -> List[Document]:
    """
    Chunk documents into smaller pieces.
    
    Args:
        documents: List of documents to chunk
        chunk_size: Size of each chunk in tokens
        chunk_overlap: Overlap between chunks
        
    Returns:
        List of chunked documents
    """
    print(f"Chunking documents (size={chunk_size}, overlap={chunk_overlap})...")
    
    chunker = DocumentChunker(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    
    chunked = []
    for doc in documents:
        chunks = chunker.chunk_text(doc.page_content)
        
        for i, chunk in enumerate(chunks):
            chunked_doc = Document(
                page_content=chunk,
                metadata={
                    **doc.metadata,
                    "chunk_index": i,
                    "total_chunks": len(chunks)
                }
            )
            chunked.append(chunked_doc)
    
    print(f"Created {len(chunked)} chunks from {len(documents)} documents")
    return chunked


def save_processed_documents(
    documents: List[Document],
    output_path: str
):
    """
    Save processed documents to file.
    
    Args:
        documents: List of documents to save
        output_path: Path to output file
    """
    print(f"Saving processed documents to {output_path}...")
    
    data = [
        {
            "content": doc.page_content,
            "metadata": doc.metadata
        }
        for doc in documents
    ]
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"Saved {len(documents)} documents")


def main():
    parser = argparse.ArgumentParser(description="Ingest and process documents")
    parser.add_argument(
        "--source",
        type=str,
        required=True,
        help="Source directory containing documents"
    )
    parser.add_argument(
        "--format",
        type=str,
        default="txt",
        choices=["txt", "md", "json", "csv"],
        help="File format to load"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="./processed_documents.json",
        help="Output file for processed documents"
    )
    parser.add_argument(
        "--chunk-size",
        type=int,
        default=800,
        help="Chunk size in tokens"
    )
    parser.add_argument(
        "--chunk-overlap",
        type=int,
        default=200,
        help="Overlap between chunks in tokens"
    )
    
    args = parser.parse_args()
    
    # Load documents
    documents = load_documents_from_directory(args.source, args.format)
    
    if not documents:
        print("No documents found. Exiting.")
        return
    
    # Process documents
    processed_docs = process_documents(documents)
    
    # Chunk documents
    chunked_docs = chunk_documents(
        processed_docs,
        chunk_size=args.chunk_size,
        chunk_overlap=args.chunk_overlap
    )
    
    # Save processed documents
    save_processed_documents(chunked_docs, args.output)
    
    print("\nIngestion complete!")
    print(f"Total documents: {len(documents)}")
    print(f"Total chunks: {len(chunked_docs)}")


if __name__ == "__main__":
    main()

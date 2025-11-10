#!/usr/bin/env python3
"""
Load processed documents into ChromaDB vector store.
"""

import os
import sys
import argparse
import json
from pathlib import Path
from typing import List

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent.parent / "backend"))

from langchain.schema import Document
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.core.vector_store import VectorStore


def load_documents_from_json(file_path: str) -> List[Document]:
    """
    Load documents from JSON file.
    
    Args:
        file_path: Path to JSON file
        
    Returns:
        List of documents
    """
    print(f"Loading documents from {file_path}...")
    
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    documents = [
        Document(
            page_content=item["content"],
            metadata=item["metadata"]
        )
        for item in data
    ]
    
    print(f"Loaded {len(documents)} documents")
    return documents


def load_to_vector_store(documents: List[Document], batch_size: int = 100):
    """
    Load documents into vector store in batches.
    
    Args:
        documents: List of documents to load
        batch_size: Number of documents to process at once
    """
    print(f"Initializing vector store...")
    vector_store = VectorStore()
    
    print(f"Loading {len(documents)} documents in batches of {batch_size}...")
    
    total_loaded = 0
    for i in range(0, len(documents), batch_size):
        batch = documents[i:i + batch_size]
        
        try:
            ids = vector_store.add_documents(batch)
            total_loaded += len(ids)
            print(f"Loaded batch {i // batch_size + 1}: {len(ids)} documents (Total: {total_loaded})")
        except Exception as e:
            print(f"Error loading batch: {str(e)}")
            continue
    
    print(f"\nSuccessfully loaded {total_loaded} documents into vector store")


def main():
    parser = argparse.ArgumentParser(description="Load documents into vector store")
    parser.add_argument(
        "--input",
        type=str,
        required=True,
        help="Input JSON file with processed documents"
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=100,
        help="Batch size for loading"
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Reset vector store before loading"
    )
    
    args = parser.parse_args()
    
    # Check if input file exists
    if not os.path.exists(args.input):
        print(f"Error: Input file not found: {args.input}")
        return
    
    # Reset vector store if requested
    if args.reset:
        print("Resetting vector store...")
        try:
            vector_store = VectorStore()
            vector_store.delete_collection()
            print("Vector store reset complete")
            # Reinitialize
            vector_store = VectorStore()
        except Exception as e:
            print(f"Error resetting vector store: {str(e)}")
            return
    
    # Load documents from JSON
    documents = load_documents_from_json(args.input)
    
    if not documents:
        print("No documents to load. Exiting.")
        return
    
    # Load into vector store
    load_to_vector_store(documents, batch_size=args.batch_size)
    
    print("\nLoad complete!")


if __name__ == "__main__":
    main()

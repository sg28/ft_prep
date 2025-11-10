#!/usr/bin/env python3
"""
Test the chatbot with sample queries.
"""

import sys
import asyncio
import json
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent / "backend"))

from dotenv import load_dotenv
load_dotenv()

from app.core.rag import RAGSystem
from app.core.llm import LLMService

# Sample test queries
TEST_QUERIES = [
    "What is the time off request process?",
    "Who leads the Backend team?",
    "What is the status of Project Alpha?",
    "How do I submit an equipment request?",
    "When are sprint planning meetings held?",
]


async def test_query(query: str, rag_system: RAGSystem, llm_service: LLMService):
    """Test a single query."""
    print(f"\n{'='*80}")
    print(f"Query: {query}")
    print(f"{'='*80}")
    
    # Retrieve context
    print("\n Retrieving relevant documents...")
    documents = rag_system.retrieve(query, k=3)
    
    if documents:
        print(f"Found {len(documents)} relevant documents:")
        for i, doc in enumerate(documents, 1):
            source = doc.metadata.get('source', 'unknown')
            print(f"  {i}. {source} (preview: {doc.page_content[:100]}...)")
    else:
        print("  No relevant documents found")
    
    # Build context
    context = "\n\n".join([doc.page_content for doc in documents])
    
    # Generate response
    print("\n Generating response...")
    response = await llm_service.generate_response(query, context)
    print(f"\nResponse:\n{response}")
    
    # Detect intent
    print("\n Detecting intent...")
    intent = await llm_service.detect_intent(query)
    print(f"Intent: {intent.get('intent')} (confidence: {intent.get('confidence'):.2f})")
    
    return {
        "query": query,
        "response": response,
        "intent": intent,
        "num_sources": len(documents)
    }


async def main():
    """Main test function."""
    print("="*80)
    print("INTERNAL CHATBOT - TEST SUITE")
    print("="*80)
    
    # Initialize systems
    print("\n Initializing systems...")
    try:
        rag_system = RAGSystem()
        llm_service = LLMService()
        print("✅ Systems initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing systems: {str(e)}")
        print("\nMake sure:")
        print("  1. You've run setup.sh")
        print("  2. Your OPENAI_API_KEY is set in .env")
        print("  3. Documents are loaded into the vector store")
        return
    
    # Run test queries
    results = []
    for query in TEST_QUERIES:
        try:
            result = await test_query(query, rag_system, llm_service)
            results.append(result)
        except Exception as e:
            print(f"Error processing query: {str(e)}")
            continue
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    print(f"\nTotal queries tested: {len(results)}")
    print(f"Successful responses: {len([r for r in results if r.get('response')])}")
    
    avg_sources = sum(r['num_sources'] for r in results) / len(results) if results else 0
    print(f"Average sources retrieved: {avg_sources:.1f}")
    
    print("\n Testing complete!")


if __name__ == "__main__":
    asyncio.run(main())

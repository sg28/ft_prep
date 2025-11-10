#!/bin/bash

# Setup script for Internal Developer Assistant Chatbot
# This script automates the initial setup process

set -e  # Exit on error

echo "=================================="
echo "Internal Chatbot Setup Script"
echo "=================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your OPENAI_API_KEY before continuing!"
    echo "   Then run this script again."
    exit 1
fi

# Check if OpenAI API key is set
if grep -q "your_openai_api_key_here" .env; then
    echo "⚠️  Please set your OPENAI_API_KEY in the .env file!"
    exit 1
fi

echo "✅ Environment file configured"
echo ""

# Setup Backend
echo "Setting up Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing backend dependencies..."
pip install -q -r requirements.txt

echo "✅ Backend setup complete"
echo ""

# Setup Data Pipeline
echo "Setting up Data Pipeline..."
cd ../data-pipeline

echo "Installing data pipeline dependencies..."
pip install -q -r requirements.txt

echo "✅ Data pipeline setup complete"
echo ""

# Process Sample Documents
echo "Processing sample documents..."
if [ ! -f "processed_documents.json" ]; then
    python scripts/ingest_documents.py \
        --source ./sample_data \
        --format txt \
        --output ./processed_documents.json
    
    echo "✅ Documents processed"
else
    echo "ℹ️  Processed documents already exist, skipping..."
fi

echo ""

# Load into Vector Store
echo "Loading documents into vector store..."
python scripts/load_to_vectorstore.py \
    --input ./processed_documents.json \
    --batch-size 50

echo "✅ Vector store initialized"
echo ""

cd ..

echo "=================================="
echo "Setup Complete! 🎉"
echo "=================================="
echo ""
echo "To start the backend server:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload"
echo ""
echo "Backend will be available at: http://localhost:8000"
echo "API docs at: http://localhost:8000/docs"
echo ""
echo "Try these example queries:"
echo "  - What is the time off request process?"
echo "  - Who leads the Backend team?"
echo "  - What is the status of Project Alpha?"
echo ""

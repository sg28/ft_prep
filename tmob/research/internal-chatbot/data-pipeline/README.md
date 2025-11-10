# Data Pipeline - Document Ingestion and Processing

Scripts for ingesting, cleaning, chunking, and embedding internal documents.

## Overview

The data pipeline handles:
- Document ingestion from various sources
- Text cleaning and normalization
- Chunking into optimal sizes (500-1000 tokens)
- Embedding generation
- Loading into vector database

## Setup

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Configuration

Set environment variables in `.env` file (use `../.env.example` as template).

## Usage

### 1. Ingest Sample Documents

```bash
python ingest_documents.py --source ./sample_data --format txt
```

### 2. Process Existing Data

```bash
python process_documents.py --input ./raw_data --output ./processed_data
```

### 3. Load into Vector Store

```bash
python load_to_vectorstore.py --input ./processed_data
```

## Supported Formats

- Text files (.txt)
- Markdown (.md)
- JSON (.json)
- CSV (.csv)
- PDF (.pdf) - requires additional dependencies

## Data Structure

```
data-pipeline/
├── sample_data/         # Sample documents for testing
├── scripts/
│   ├── ingest_documents.py      # Main ingestion script
│   ├── process_documents.py     # Document processing
│   ├── load_to_vectorstore.py   # Load to ChromaDB
│   └── utils/
│       ├── chunker.py           # Text chunking utilities
│       └── cleaner.py           # Text cleaning utilities
└── requirements.txt
```

## Example: Add Company Documentation

1. Place documents in `sample_data/`
2. Run ingestion: `python scripts/ingest_documents.py`
3. Documents are automatically chunked, embedded, and stored

## Chunking Strategy

- Chunk size: 800 tokens (configurable)
- Overlap: 200 tokens
- Preserves sentence boundaries
- Maintains metadata (source, title, page)

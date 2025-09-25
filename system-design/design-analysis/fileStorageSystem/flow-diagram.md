upload flow
--------------------

Client App (chunk, hash, compress)
   │
   │ POST /files (metadata)
   ▼
API Gateway (auth, routing)
   │
   ▼
File Service
   │  ├── Persist metadata → File Metadata DB (DynamoDB)
   │  └── Generate presigned URL
   ▼
Client App
   │
   │ PUT chunk(s) → Blob Storage (S3/GCS) using presigned URL
   │
   └── Notify chunk completion → File Service
             │
             └── Verify chunk in Blob Storage, update status in Metadata DB



Download Flow
--------------------

Client App (wants file)
   │
   │ GET /files/{file_id}
   ▼
API Gateway
   │
   ▼
File Service
   │  ├── Lookup file metadata → File Metadata DB
   │  └── Return presigned URL for blob
   ▼
Client App
   │
   └── GET file/chunks directly from Blob Storage



Sync Flow
--------------------

Client App (polls for changes)
   │
   │ GET /changes?timestamp={ts}
   ▼
API Gateway
   │
   ▼
Sync Service
   │
   └── Query File Metadata DB (changed files since ts)
   ▼
Client App
   │
   ├── Download updated chunks from Blob Storage
   └── Upload local changes via Upload Flow


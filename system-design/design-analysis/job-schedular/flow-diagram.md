   ┌────────────┐        ┌──────────────┐
   │    Client  │──────► │  API Gateway │
   └────────────┘        └──────────────┘
                                │
                                ▼
                        ┌────────────────┐
                        │ Load Balancer  │
                        └────────────────┘
                                │
                                ▼
                        ┌───────────────────────┐
                        │   Scheduler Service   │
                        │  - Save job metadata  │
                        │  - Upload script to S3│
                        │  - Insert into DB     │
                        └───────────────────────┘
                                │
                ┌───────────────┴─────────────────┐
                ▼                                 ▼
      ┌────────────────────────────────┐   ┌────────────────────────┐
      │           DynamoDB             │   │     Blob Storage       │
      │ - Jobs table: job_id, owner,   │   │  (S3: stores scripts)  │
      │   schedule, params, S3 link    │   │  e.g., report.py       │
      │ - Runs table: run_id, status,  │   │                        │
      │   start/end timestamps         │   │  Provides actual code  │
      │ - Job Schedule: execution_time │   │  files to Executors    │
      │   (by time_bucket), job_id     │   └────────────────────────┘
      └────────────────────────────────┘
                │
        (poll every min)
                ▼
        ┌────────────────┐
        │ Watcher Service│
        │ - Queries DB   │
        │ - Finds jobs   │
        └────────────────┘
                │
                ▼
        ┌───────────────────────────────┐
        │           SQS Queue           │
        │ - Buffer jobs                 │
        │ - Ensure delivery             │
        │                               │
        │ Example Message:              │
        │ {                             │
        │   "job_id": "job-12345",      │
        │   "run_id": "run-abc-001",    │
        │   "execution_time": "2025-09-23T09:00:00Z", │
        │   "task_id": "task-67890",    │
        │   "script_s3_url": "s3://job-scripts/user123/task-67890/report.py", │
        │   "parameters": { "region": "US-West", "format": "PDF" }, │
        │   "priority": "medium",       │
        │   "owner_id": "user123"       │
        │ }                             │
        └───────────────────────────────┘
                │
       (parallel consumption by many Executors)
      ┌─────────┴─────────┬─────────┐
      ▼                   ▼         ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│ Executor Service #1 │ │ Executor Service #2 │ │ Executor Service #3 │
│ - Polls SQS         │ │ - Polls SQS         │ │ - Polls SQS         │
│ - Fetch script from │ │ - Fetch script from │ │ - Fetch script from │
│   S3 (Blob Storage) │ │   S3 (Blob Storage) │ │   S3 (Blob Storage) │
│ - Run in container  │ │ - Run in container  │ │ - Run in container  │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘
      │                   │         │
      ▼                   ▼         ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│  ECS Container #1   │ │  ECS Container #2   │ │  ECS Container #3   │
│ - Isolated job run  │ │ - Isolated job run  │ │ - Isolated job run  │
│ - Report status     │ │ - Report status     │ │ - Report status     │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘
      │                   │         │
      └─────────┬─────────┴─────────┘
                ▼
        ┌─────────────────────┐
        │ Scheduler Service   │
        │ - Update Run table  │
        │ - Persist status    │
        └─────────────────────┘

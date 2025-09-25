
Apache Flink, Kafka
Amazon Kinesis

   ┌───────────────┐
   │   Branch/     │
   │ Partner Sys   │
   └──────┬────────┘
          │  (sales events, each sale is a single event)
          │
          │ Example Payload:
          │ {
          │   "sale_id": "sale-987654",
          │   "tenant_id": "nike",
          │   "branch_id": "sf-42",
          │   "seller_id": "seller-123",
          │   "item_id": "sku-5678",
          │   "amount": 50.00,
          │   "currency": "USD",
          │   "timestamp": "2025-09-23T10:15:00Z",
          │   "payment_method": "credit_card"
          │ }
          ▼
   ┌───────────────────────┐
   │ API Gateway           │
   │ - Auth, schema check  │
   │ - Rate limiting       │
   └─────────┬─────────────┘
             ▼
   ┌───────────────────────────────┐
   │ Ingestion Service             │
   │ - Receives validated events   │
   │ - Adds metadata (ingest_time) │
   │ - Serializes (Avro/Proto/JSON)│
   │ - Produces to Kafka/Kinesis   │
   │ - Handles retries / DLQ       │
   └─────────┬─────────────────────┘
             ▼
   ┌───────────────────────┐
   │ Kafka / Amazon Kinesis│
   │ - Events keyed by     │
   │   tenant + branch     │
   │ - Schema registry     │
   │ - DLQ for failures    │
   └─────────┬─────────────┘
             ▼
   ┌───────────────────────┐
   │ Stream Processing     │
   │ (Flink / Kafka Str.)  │
   │ - Idempotent agg.     │
   │ - Currency norm.      │
   │ - Windowed updates    │
   │ - Emit leaderboard    │
   │   deltas              │
   └───────┬─────────────────────┐
           ▼                     ▼
   ┌──────────────────┐    ┌──────────────────────┐
   │ Redis Cluster    │    │ Time-series / Hist.  │
   │ - ZSets: scores  │    │ (ClickHouse, BQ,     │
   │ - Hash: profiles │    │ Snowflake)           │
   └───────┬──────────┘    └──────────────────────┘
           │
   (sub-ms reads)
           ▼
   ┌─────────────────────────┐
   │ Public APIs             │
   │ - GET /leaderboard      │
   │ - GET /rank/{seller}    │
   │ - GET /around-me        │
   │ - WebSocket updates     │
   └─────────────────────────┘

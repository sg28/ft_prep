# Domain Refresher Answer — AWS

Format per service (as the plan specifies): what it is in one sentence, 3 use cases, 1 gotcha to know cold.

## S3 (Simple Storage Service)

**What it is:** Object storage for files of any size, durable (11 nines) and effectively infinitely scalable.

**Use cases:**
- Data lake storage for analytics pipelines (raw + processed data as Parquet/CSV)
- Static asset hosting (images, static websites, build artifacts)
- Backup/archive with lifecycle policies to cheaper storage tiers (Glacier) over time

**Gotcha:** People still assume S3 is only *eventually* consistent. Since December 2020, S3 provides strong read-after-write consistency for all operations — if you write an object, an immediate subsequent read is guaranteed to see it. Citing the old eventual-consistency caveat is a dated answer.

## DynamoDB

**What it is:** A managed, fully serverless NoSQL key-value/document database with single-digit-millisecond latency at virtually any scale.

**Use cases:**
- Session stores for high-traffic web apps
- Gaming leaderboards / real-time counters needing fast, predictable reads and writes
- IoT device state / event data with high write throughput

**Gotcha:** You must design your partition key and access patterns *before* writing data, not after. Unlike a relational DB, you can't bolt on an arbitrary new query pattern later without a Global Secondary Index — and a poorly chosen partition key creates "hot partitions" that throttle throughput no matter how much you scale the table.

## RDS (Relational Database Service)

**What it is:** A managed relational database service (Postgres, MySQL, etc.) that handles patching, backups, and failover for you.

**Use cases:**
- Transactional systems needing ACID guarantees and joins (e.g. a ledger — see [../system-design/bank-ledger-wallet.md](../system-design/bank-ledger-wallet.md))
- Lift-and-shift of existing relational workloads without a rewrite
- Read-heavy apps using read replicas to offload reporting/analytics queries from the primary

**Gotcha:** RDS scales vertically (bigger instance) far more easily than horizontally — sharding a relational workload is a real application-level redesign, not a config change. Also, Multi-AZ failover isn't instant: it typically takes 60-120 seconds, which matters if your SLA assumes zero-downtime failover.

## Kinesis

**What it is:** A managed real-time data streaming service for ingesting and processing high-throughput event streams.

**Use cases:**
- Clickstream / user-activity ingestion for real-time analytics
- Log aggregation pipelines feeding downstream processing
- Feeding a real-time scoring system (e.g. the fraud-detection design's transaction stream — see [../system-design/fraud-detection.md](../system-design/fraud-detection.md))

**Gotcha:** Throughput is shard-based — each shard supports 1MB/s (or 1,000 records/s) write and 2MB/s read. Hitting a throughput ceiling means resharding, which is an operational task you need to plan for, not something that scales invisibly like a fully serverless service.

## Lambda

**What it is:** Serverless, event-driven compute — you provide a function, AWS runs it in response to triggers without you managing servers.

**Use cases:**
- API backends behind API Gateway for lightweight, spiky-traffic endpoints
- Event-driven processing (e.g. resize an image the moment it lands in an S3 bucket)
- Scheduled jobs (via EventBridge) replacing traditional cron servers

**Gotcha:** Cold starts add latency to the first invocation after idle periods, and every Lambda has a hard 15-minute maximum execution time — it's the wrong tool for long-running batch jobs or anything latency-sensitive that can't tolerate an occasional cold-start spike.

## IAM (Identity and Access Management)

**What it is:** AWS's system for defining who (users, roles, services) can do what (permissions) on which resources.

**Use cases:**
- Least-privilege roles for services (e.g. a Lambda function's execution role scoped only to the S3 bucket and DynamoDB table it actually needs)
- Cross-account roles for granting a partner account or CI/CD pipeline temporary, scoped access
- Temporary credentials via STS instead of long-lived access keys, for anything automated

**Gotcha:** The most common real-world security misconfiguration is an overly permissive policy — `"Action": "*"` or `"Resource": "*"` "to make it work" during development, that never gets tightened before shipping. This is exactly the kind of finding that shows up in a security audit and is worth naming unprompted if IAM comes up in a system design round.

# System Design Answer — Bank Ledger / Wallet

**Prompt:** "Design a backend service that stores and updates user account balances. Must be highly reliable."

## 1. Clarify Requirements

- **Scale:** 100M users, 10K TPS peak writes, 100K TPS peak reads (10:1 read:write skew)
- **Latency:** <100ms P99 read, <500ms P99 write
- **Consistency:** Strong consistency for balance writes (money can't be eventually consistent); reads can tolerate slight staleness on replicas if disclosed
- **Reliability bar:** No lost or double-applied transactions — this is the single hardest requirement, everything else is secondary to it

## 2. API

```
POST /accounts                          → create account
POST /accounts/{id}/credit              → idempotent, body: {amount, currency, txn_id}
POST /accounts/{id}/debit               → idempotent, body: {amount, currency, txn_id}
POST /transfers                         → atomic, body: {from, to, amount, txn_id}
GET  /accounts/{id}/balance             → current balance
GET  /accounts/{id}/transactions?from=  → paginated history
```

Every mutating call takes a `txn_id` — that's what makes idempotency possible. Without it, network retries would double-apply transactions.

## 3. Data Model (Postgres)

```
accounts(id PK, user_id, currency, status, created_at)
ledger_entries(id PK, txn_id FK, account_id FK, amount, direction, created_at)
   -- amount as bigint in smallest unit (cents); never float
   -- direction: 'debit' | 'credit'; per-txn entries sum to zero
transactions(id PK, txn_id UNIQUE, status, created_at, idempotency_key UNIQUE)
balances(account_id PK, balance bigint, updated_at, version)
   -- materialized; updated in same tx as ledger_entries
outbox(id PK, event_type, payload, published_at NULL)
```

`balances` is a materialized view of `ledger_entries` — kept in the same transaction so it's never out of sync. `ledger_entries` is the source of truth and is append-only, so it doubles as the audit trail.

## 4. High-Level Architecture

Client → API layer → Postgres primary (writes) + read replicas (reads) → Kafka (via outbox) → downstream consumers (analytics, notifications, fraud).

## 5. Deep-Dive: The Transfer Sequence (A → B)

```
1. Client POST /transfers with idempotency_key
2. Check transactions table for existing key → return cached result if found
3. BEGIN tx
4.   Insert transactions row (status=pending)
5.   Insert 2 ledger_entries: debit A, credit B
6.   UPDATE balances SET balance=balance-amt WHERE account_id=A AND balance>=amt
       → if 0 rows affected → ROLLBACK, return 422 insufficient funds
7.   UPDATE balances SET balance=balance+amt WHERE account_id=B
8.   Insert outbox row (event=transfer_completed)
9.   UPDATE transactions SET status=committed
10.  COMMIT
11. Outbox worker publishes event to Kafka (at-least-once)
12. Downstream consumers process the event idempotently
```

The `WHERE balance >= amt` guard on the debit update is what prevents overdrafts under concurrency — it's an atomic check-and-update, not a separate read-then-write (which would race).

## 6. Key Concepts to Say Out Loud

- **Double-entry bookkeeping:** every transaction is a matching debit + credit; the entries for a transaction always sum to zero — this makes the ledger self-auditing
- **Idempotency keys** with a 24h TTL — retries return the cached response instead of double-applying
- **Outbox pattern** guarantees the "transfer completed" event is never lost, even if the Kafka publish fails right after commit — a worker polls `outbox` rows with `published_at IS NULL` and retries
- **Reconciliation job:** a nightly sweep that verifies `SUM(ledger_entries.signed_amount)` per account equals `balances.balance` — this catches any drift between the source of truth and the materialized view
- **Sharding:** shard by `account_id` hash once a single Postgres primary hits its write ceiling (~50K TPS)
- **Currency precision:** bigint cents everywhere (or `BigInt` in JS) — floats are banned from any code path that touches money

## 7. Failure Modes

| Failure | Detection | Recovery |
|---|---|---|
| Network partition mid-transfer | Client retries with same idempotency_key | Returns committed result, no double-charge |
| Replay attack | Idempotency key TTL + replay log | Reject after TTL |
| Hot account (merchant) | Lock contention metrics | Partition account or async queue |
| Lost outbox event | Outbox row with `published_at=NULL` after 60s | Worker retries; alarm if backlog grows |
| Replica lag | Lag metric exceeds 1s | Force balance reads to primary |
| Currency rounding | Float anywhere triggers test failure | bigint cents, never divide |

## 8. Follow-Up Questions — Full Answers

**"How would you handle multi-currency transfers?"**
Two ledger entries per leg — debit the source account in its currency, credit the destination account in its currency — plus a separate FX entry recording the conversion rate. Lock both currencies' exchange rates at the moment the transaction starts, so the rate used matches what the customer saw, even if the market rate moves before the transaction commits.

**"What if Postgres goes down?"**
Run a synchronous standby replica with automatic failover, targeting ~30 seconds to promote. While failover is in progress, the service degrades to read-only mode (serving balance reads from the replica) rather than going fully down. Writes queue at the application layer in a bounded buffer during the failover window, and are drained once the new primary is live — bounded so a prolonged outage fails loudly instead of growing an unbounded backlog.

**"How does this scale to 1M TPS?"**
Shard by `account_id` hash so each shard owns a disjoint set of accounts exclusively — single-account transactions stay within one shard and need no cross-shard coordination. Cross-shard transfers (A on shard 1, B on shard 2) use the saga pattern: debit A, then credit B; if the credit step fails, run a compensating transaction to reverse the debit. This trades strict two-phase-commit for eventual consistency across shards, which is an explicit tradeoff worth naming out loud.

**"How do you handle disputes / reversals?"**
Never delete or mutate a ledger entry — the ledger is append-only and immutable, which is what makes it auditable. To reverse a transaction, post a new transaction with matching debit/credit entries that reference the original transaction's `txn_id`. The original entries stay in the audit trail exactly as they happened; the reversal is a new, visible event layered on top.

## Numbers to Have Ready

- 100M users · 10K TPS peak writes · 100K TPS peak reads · <100ms P99 read · <500ms P99 write
- ~100GB/year ledger storage at 10K TPS
- Read:write skew ~10:1
- Single Postgres primary write ceiling ≈ 50K TPS (the point at which you'd bring up sharding unprompted)

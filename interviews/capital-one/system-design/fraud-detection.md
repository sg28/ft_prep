# System Design Answer — Real-Time Fraud Detection

**Prompt:** "Design a system that scores credit card transactions in real time for fraud."

## 1. Clarify Requirements

- **Scale:** 100K TPS transaction stream
- **Latency:** <100ms P99 decision latency, broken into budget: ~50ms feature lookup, ~30ms model inference, ~20ms decision logic
- **Availability:** 99.99% — a fraud system that's down either blocks all legitimate transactions or (worse) fails open and approves everything
- **Accuracy tradeoff to name up front:** false positives (declining a real customer) vs false negatives (letting fraud through) — this is the central tension of the whole design

## 2. API

```
POST /score
  body: {txn_id, card_id, amount, merchant, geo, channel, ts}
  response: {decision: approve|decline|step_up, score: 0-1, reason_codes: []}
```

`reason_codes` matters beyond debugging — it's what lets a human (analyst, or the customer via a step-up MFA flow) understand *why* a transaction got flagged, and it's what a fairness audit inspects later.

## 3. Architecture

```
Card Networks
     ↓
   Kafka (partitioned by card_id, retention 7d)
     ↓                              ↓
[Scoring Service]            [Stream Processor (Flink)]
     ↓                              ↓
[Feature Store: Redis]    [Feature Store: S3/Parquet]
     ↓
[Rules Engine] + [ML Model (gradient boost / sequence)]
     ↓
[Decision Service: combine, decide]
     ↓
Approve / Decline / Step-up MFA
     ↓
[Feedback: analyst overrides, chargebacks]
     ↓
[Retraining pipeline] → new model → shadow mode → live
```

Partitioning Kafka by `card_id` matters: it guarantees all events for one card arrive in order to the same partition, which the stream processor relies on for correct sliding-window features (you can't compute "transactions in the last minute" correctly if events for the same card can arrive out of order across partitions).

## 4. Deep-Dive: Features

**Online (Redis, sub-millisecond reads)** — freshness matters more than richness here, since these feed the synchronous scoring path:
- `last_txn_geo(card_id)`
- `txn_count_1m`, `txn_count_5m`, `txn_count_1h` — sliding windows
- `amount_sum_1h`
- `distinct_merchant_count_1h`
- `distance_from_last_geo`

**Offline (S3/Parquet, retrained daily)** — richer, computed in batch, tolerates staleness:
- card lifetime spend percentiles
- merchant category baseline
- time-of-day pattern

## 5. Tradeoffs to State Explicitly

- **False positive vs false negative** — tune the decision threshold per merchant category rather than globally, since risk tolerance differs (a $5 coffee charge vs a $5,000 electronics charge)
- **Latency vs accuracy** — use a cascade: cheap rules catch obvious fraud in <5ms, and only ambiguous cases fall through to the more expensive ML model, keeping average latency low without sacrificing accuracy on the hard cases
- **Online vs offline features** — fresh-but-narrow (Redis) vs rich-but-stale (S3/Parquet); most models blend both
- **Synchronous score vs async approve-then-flag** — a synchronous decision blocks checkout and adds latency risk but stops fraud before money moves; async approves first and reconciles later, which is faster for the customer but means some fraud loss is unrecoverable by the time it's caught. For payments, synchronous wins despite the latency cost — customer trust and actual dollars lost outweigh checkout friction.

## 6. Failure Modes

| Failure | Recovery |
|---|---|
| Feature store down | Fail open with rules-only scoring; alarm |
| Model serving down | Fallback model in memory; rules-only |
| Kafka lag > 5s | Score on partial features; alarm |
| Model drift | PSI / KL divergence per feature; auto-trigger retrain |
| Bad model deploy | Shadow mode + automatic rollback on lift drop |

"Fail open with rules-only" is a deliberate choice — a fraud system that fails *closed* (blocking every transaction when a dependency is down) turns an infra outage into a total payments outage, which is a worse failure mode than temporarily degraded fraud coverage.

## 7. Follow-Up Questions — Full Answers

**"How do you measure success?"**
Approval rate, fraud loss rate (dollars lost to fraud that got approved), and customer escalation rate (legitimate customers wrongly declined, then complaining). None of these alone is sufficient — optimizing only for fraud loss rate would decline too many real customers, and optimizing only for approval rate would let fraud through. The real signal comes from holding out a control population that's scored but not acted on, to measure the model's *incremental* fraud caught versus what would have happened with the old system or no system.

**"How do you avoid bias?"**
Audit `reason_codes` for protected-attribute proxies — a feature like zip code can act as a proxy for income or race even if it's never explicitly used as such. Run fairness metrics (e.g. approval rate parity across demographic groups) as part of every model evaluation, not just accuracy metrics. Remove or transform proxy features once identified rather than leaving them in and hoping the model doesn't lean on them.

**"What if a model trained on bad labels?"**
Run a label-quality evaluation before any model is promoted to shadow mode — spot-check a sample of "fraud" and "not fraud" labels against ground truth (confirmed chargebacks, confirmed disputes) to catch systematic labeling errors early. If a bad-label problem is only discovered after the model is in shadow mode, the shadow-mode lift metric will look wrong (e.g. much worse or suspiciously much better than the current model) — that's the trigger to roll back and re-audit the training data rather than promoting to live traffic.

## Numbers to Have Ready

- 100K TPS transaction stream
- <100ms P99 decision latency (50ms feature / 30ms inference / 20ms decision)
- 99.99% availability target
- Kafka retention: 7 days

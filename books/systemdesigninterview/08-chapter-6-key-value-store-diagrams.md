# Chapter 6: Design a Key-Value Store — ASCII Flow Diagrams

---

## 1. CAP Theorem Triangle

You can only pick 2 out of 3.

```
              Consistency
                  /\
                 /  \
                /    \
               / CP   \
              /  (HBase)\
             /----------\
            /  CA   AP   \
           / (impossible) \
          /________________\
    Availability        Partition
                        Tolerance
                       (Cassandra,
                        Dynamo)

CP = Consistency + Partition Tolerance  → sacrifices Availability  (e.g. HBase)
AP = Availability + Partition Tolerance → sacrifices Consistency   (e.g. Cassandra, DynamoDB)
CA = Consistency + Availability         → cannot exist in real distributed systems
```

---

## 2. Single Server vs Distributed Key-Value Store

```
SINGLE SERVER
┌─────────────────────────┐
│   Server Memory         │
│   ┌──────────────────┐  │
│   │ key  │  value    │  │
│   │ "a"  │ "hello"   │  │
│   │ "b"  │ "world"   │  │
│   └──────────────────┘  │
│   Problem: runs out     │
│   of memory fast        │
└─────────────────────────┘

DISTRIBUTED (consistent hashing ring)
              S0
           /      \
        S3          S1
           \      /
              S2

Each server holds a slice of the data.
Keys are hashed onto the ring → stored on nearest server clockwise.
```

---

## 3. Data Replication (N=3)

```
Key "user_1" hashes to position X on the ring.
Walk clockwise → replicate to first 3 servers.

         S0  ← replica 3
       /    \
     S3      S1  ← replica 1  (key maps here first)
       \    /
         S2  ← replica 2

"user_1" data lives on S1, S2, S3.
If S1 goes down, S2 and S3 still have the data.
```

---

## 4. Quorum Consensus (N=3, W=2, R=2)

```
Client
  |
  | write("key", value)
  v
Coordinator
  |-------> S1  ✓ ack
  |-------> S2  ✓ ack      W=2 acks received → write SUCCESS
  |-------> S3  (slow, waiting...)

Client
  |
  | read("key")
  v
Coordinator
  |-------> S1  ✓ returns value
  |-------> S2  ✓ returns value   R=2 responses → read SUCCESS
  |-------> S3  (slow, waiting...)

Rule: W + R > N  →  strong consistency guaranteed
      2 + 2 > 3  ✓
```

---

## 5. Consistency Models

```
STRONG CONSISTENCY
  Write ──► all replicas updated ──► then read allowed
  Slow but always accurate. Used in banks.

EVENTUAL CONSISTENCY
  Write ──► coordinator ──► replicas sync over time
  Fast but may read stale data temporarily.
  Used in Cassandra, DynamoDB.

  Time:   t1        t2        t3
  S1:     "john" ─────────► "johnSF"
  S2:     "john" ──────────────────► "johnSF"  (syncs later)
  S3:     "john" ───────────────────────────► "johnSF"
```

---

## 6. Inconsistency Resolution — Vector Clock

```
Problem: Two servers update the same key simultaneously.

n1: name = "johnSanFrancisco"   ← version v1
n2: name = "johnNewYork"        ← version v2

Which one wins? We don't know without a vector clock.

Vector Clock flow:
  D1 written to Sx  →  D1[(Sx,1)]
  D2 written to Sx  →  D2[(Sx,2)]          (update)
  D3 written to Sy  →  D3[(Sx,2),(Sy,1)]   (branch)
  D4 written to Sz  →  D4[(Sx,2),(Sz,1)]   (branch)
                              |
                        CONFLICT DETECTED
                        Client resolves it
                              |
  D5 written to Sx  →  D5[(Sx,3),(Sy,1),(Sz,1)]  (merged)
```

---

## 7. Failure Detection — Gossip Protocol

```
Each node sends heartbeats to random nodes periodically.

  S0 ──heartbeat──► S3
  S3 ──heartbeat──► S1
  S1 ──heartbeat──► S4

If S2's heartbeat counter stops increasing:
  S0 notices ──► tells S1, S3
  S1, S3 confirm ──► S2 marked as DOWN
  Info propagates across all nodes

No central master needed. Fully decentralized.
```

---

## 8. Handling Temporary Failures — Hinted Handoff

```
Normal:
  Client ──► S2 (handles request)

S2 goes down:
  Client ──► S3 (handles request temporarily)
                    |
                    | stores a "hint": "this data belongs to S2"
                    |
  S2 comes back online
                    |
  S3 ──pushes data──► S2  (handoff complete)
```

---

## 9. Handling Permanent Failures — Merkle Tree

```
Used to detect which data is out of sync between two replicas.

Keys 1–12 split into 4 buckets:

Bucket1    Bucket2    Bucket3    Bucket4
[1,2,3]   [4,5,6]   [7,8,9]  [10,11,12]
   |          |          |          |
  h1         h2         h3         h4    ← hash each bucket
   \         /           \         /
    \       /             \       /
    hash(h1,h2)         hash(h3,h4)
         \                   /
          \                 /
           hash(root)  ← compare this first

If root matches → both replicas are in sync.
If root differs → drill down to find which bucket differs.
Only sync the different bucket. Efficient!
```

---

## 10. Write Path

```
Client
  |
  | write("key", value)
  v
Node
  |
  ├──► 1. Write to Commit Log (on disk, for crash recovery)
  |
  ├──► 2. Write to Memory Cache (fast)
  |
  └──► 3. When memory is full → flush to SSTable on disk
              (SSTable = Sorted String Table, immutable)
```

---

## 11. Read Path

```
Client
  |
  | read("key")
  v
Node
  |
  ├──► Check Memory Cache
  │       |
  │    found? ──► return to client ✓
  │       |
  │    not found?
  │       |
  ├──► Check Bloom Filter
  │    (tells you WHICH SSTable likely has the key)
  │       |
  ├──► Read from SSTable on disk
  │       |
  └──► Return result to client ✓
```

---

## 12. Full System Architecture (Summary)

```
         Client
           |
           | get(key) / put(key, value)
           v
       Coordinator Node
           |
    ┌──────┼──────┐
    v      v      v
   N1     N2     N3      ← consistent hashing ring
    |      |      |
  data   data   data     ← each node has same responsibilities
    |      |      |
  gossip protocol keeps all nodes aware of each other
  vector clocks resolve conflicts
  merkle trees sync data during failures
```

---

## Key Concepts Summary Table

```
┌─────────────────────────┬──────────────────────────────────────┐
│ Goal                    │ Technique                            │
├─────────────────────────┼──────────────────────────────────────┤
│ Distribute data evenly  │ Consistent Hashing                   │
│ High availability       │ Data Replication (N servers)         │
│ Consistency guarantee   │ Quorum Consensus (W + R > N)         │
│ Conflict resolution     │ Vector Clocks + Versioning           │
│ Failure detection       │ Gossip Protocol                      │
│ Temporary failure       │ Hinted Handoff + Sloppy Quorum       │
│ Permanent failure sync  │ Merkle Tree + Anti-entropy           │
│ Fast writes             │ Commit Log + Memory Cache + SSTable  │
│ Fast reads              │ Memory Cache + Bloom Filter          │
│ Multi-datacenter        │ Replicate across data centers        │
└─────────────────────────┴──────────────────────────────────────┘
```

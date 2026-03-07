# Chapter 4: Design a Rate Limiter — ASCII Flow Diagrams

---

## 1. What is a Rate Limiter?

```
Without Rate Limiter:
  User ──► ──► ──► ──► ──► ──► API Server  ← overloaded, crashes

With Rate Limiter:
  User ──► ──► ──► [Rate Limiter] ──► API Server  ← protected
                        |
                    excess requests
                    blocked (429)
```

---

## 2. Where to Put the Rate Limiter?

```
OPTION 1: Client-side
  [Client + Rate Limiter]  ──► API Server
  Bad. Client can be faked by attackers. No control.

OPTION 2: Server-side
  [Client] ──► [API Server + Rate Limiter]
  Works, but mixes concerns.

OPTION 3: Middleware (recommended)
  [Client] ──► [Rate Limiter Middleware] ──► [API Server]
  Clean separation. Easy to manage.

OPTION 4: API Gateway (cloud)
  [Client] ──► [API Gateway] ──► [API Server]
              (rate limiting
               + auth
               + SSL
               + IP whitelist)
```

---

## 3. How Middleware Works

```
Limit: 2 requests per second

Request 1 ──► Rate Limiter ──► API Server ✓
Request 2 ──► Rate Limiter ──► API Server ✓
Request 3 ──► Rate Limiter ──► BLOCKED  429 Too Many Requests ✗
```

---

## 4. Token Bucket Algorithm

```
Bucket capacity: 4
Refill rate: 2 tokens/second

t=0s   [ T  T  T  T ]   4 tokens full
        request arrives → take 1 token
       [ T  T  T  _ ]   3 tokens left ✓

t=1s   [ T  T  T  _ ] + 2 refilled = [ T  T  T  T ] (capped at 4)
        3 requests arrive → take 3
       [ T  _ _ _ ]   1 token left ✓ ✓ ✓

t=2s   bucket empty, request arrives → BLOCKED ✗

Formula:
  new_tokens     = time_elapsed × refill_rate
  current_tokens = min(capacity, current_tokens + new_tokens)
  if current_tokens >= 1 → allow, subtract 1
  else → reject
```

---

## 5. Leaking Bucket Algorithm

```
Requests pour IN at any rate.
Requests drip OUT at a fixed rate (FIFO queue).

       Incoming requests
       ↓  ↓  ↓  ↓  ↓
  ┌─────────────────┐
  │  Q U E U E      │  ← if full, new requests are DROPPED
  │  [r1][r2][r3]   │
  └────────┬────────┘
           │  fixed rate (e.g. 2/sec)
           ↓  ↓
       API Server

Pros: stable outflow rate
Cons: burst fills queue with old requests → new requests dropped
```

---

## 6. Fixed Window Counter Algorithm

```
Limit: 5 requests per minute
Windows reset at every full minute.

  2:00 ────────────── 2:01 ────────────── 2:02
  |  r r r r r  |  r r r r r  |
       5 ✓           5 ✓

PROBLEM — edge case burst:
  2:00 ─────── 2:00:30 ─── 2:01 ─── 2:01:30 ─── 2:02
               | r r r r r | r r r r r |
                    5            5
  Between 2:00:30 and 2:01:30 → 10 requests pass!
  That is 2x the allowed limit.
```

---

## 7. Sliding Window Log Algorithm

```
Limit: 2 requests per minute
Keeps a log of exact timestamps.

1:00:01 → log: [1:00:01]           size=1 ≤ 2 → ALLOW ✓
1:00:30 → log: [1:00:01, 1:00:30]  size=2 ≤ 2 → ALLOW ✓
1:00:50 → log: [1:00:01, 1:00:30, 1:00:50]  size=3 > 2 → BLOCK ✗
1:01:40 → remove outdated (before 1:00:40)
          log: [1:00:50] → too old, remove
          log: [1:01:40]  size=1 ≤ 2 → ALLOW ✓

Pros: very accurate
Cons: stores timestamps even for rejected requests → memory heavy
```

---

## 8. Sliding Window Counter Algorithm

```
Limit: 7 requests per minute

Previous window (full minute): 5 requests
Current window (30% through):  3 requests
New request arrives at 30% mark.

Rolling window count:
  = current + previous × overlap%
  = 3 + 5 × 0.7
  = 3 + 3.5
  = 6.5 → round down → 6

6 < 7 → ALLOW ✓
(one more request would hit the limit)

Pros: memory efficient, smooths spikes
Cons: approximation only (assumes even distribution in prev window)
```

---

## 9. Algorithm Comparison

```
┌──────────────────────┬───────────┬────────────┬──────────────────────────┐
│ Algorithm            │ Memory    │ Burst OK?  │ Weakness                 │
├──────────────────────┼───────────┼────────────┼──────────────────────────┤
│ Token Bucket         │ efficient │ YES        │ hard to tune 2 params    │
│ Leaking Bucket       │ efficient │ NO         │ burst drops new requests │
│ Fixed Window Counter │ efficient │ edge burst │ boundary spike problem   │
│ Sliding Window Log   │ heavy     │ NO         │ stores all timestamps     │
│ Sliding Window Count │ efficient │ partial    │ approximation only       │
└──────────────────────┴───────────┴────────────┴──────────────────────────┘
```

---

## 10. High-Level Architecture with Redis

```
  Client
    |
    | HTTP Request
    v
Rate Limiter Middleware
    |
    |──► fetch counter from Redis ──► check limit
    |         |                           |
    |      not reached               reached
    |         |                           |
    |         v                           v
    |    API Server ✓              return 429 ✗
    |         |
    └──► increment counter in Redis
         set EXPIRE on counter
```

---

## 11. Rate Limiting Rules (Config)

```
Rules live in config files on disk.
Workers pull rules → store in cache.
Rate limiter reads rules from cache (fast).

  Disk (config files)
       |
       | workers pull periodically
       v
  Cache (in-memory rules)
       |
       | rate limiter reads
       v
  Rate Limiter Middleware
```

Example rule:
```
domain: auth
  key: login
  rate_limit:
    unit: minute
    requests_per_unit: 5
```

---

## 12. HTTP Headers Returned to Client

```
HTTP/1.1 429 Too Many Requests

X-Ratelimit-Limit: 100          ← max requests allowed per window
X-Ratelimit-Remaining: 0        ← how many left in current window
X-Ratelimit-Retry-After: 30     ← seconds to wait before retrying
```

---

## 13. Detailed Request Flow

```
Client
  |
  | request
  v
Rate Limiter Middleware
  |
  ├──► load rules from Cache
  ├──► fetch counter + timestamp from Redis
  |
  ├── limit NOT reached?
  │       |
  │       ├──► forward to API Server ✓
  │       └──► increment counter in Redis
  |
  └── limit reached?
          |
          ├──► return 429 to Client ✗
          └──► optionally enqueue request for later processing
```

---

## 14. Race Condition Problem (Distributed)

```
Redis counter = 3, limit = 4

Thread A reads counter → 3
Thread B reads counter → 3  (at same time)

Thread A: 3+1=4, writes 4 to Redis ✓
Thread B: 3+1=4, writes 4 to Redis ✓

Both passed. But correct counter should be 5.
Limit was bypassed!

Fix: Use Lua scripts in Redis (atomic read + check + write)
     Nobody can interrupt between the steps.
```

---

## 15. Synchronization Problem (Multiple Rate Limiters)

```
WITHOUT synchronization:
  Client 1 ──► Rate Limiter 1 (knows only Client 1's data)
  Client 2 ──► Rate Limiter 2 (knows only Client 2's data)
  Client 1 ──► Rate Limiter 2 ← Rate Limiter 2 has no data for Client 1!
  Rate limiter BROKEN.

WITH centralized Redis:
  Client 1 ──► Rate Limiter 1 ──► Redis (shared)
  Client 2 ──► Rate Limiter 2 ──► Redis (shared)
  All rate limiters share the same counter data.
  WORKS correctly.
```

---

## 16. Full Production Architecture

```
                        Client
                          |
                          v
              ┌─── Rate Limiter Middleware ───┐
              │                               │
              │  ┌─────────┐  ┌───────────┐  │
              │  │  Cache  │  │   Redis   │  │
              │  │ (rules) │  │(counters) │  │
              │  └─────────┘  └───────────┘  │
              └───────────────────────────────┘
                          |
               ┌──────────┴──────────┐
               v                     v
         API Server 1          API Server 2
               |                     |
               └──────────┬──────────┘
                          v
                      Database

Rules: config files on disk → workers → cache
Counters: stored in Redis (shared, fast, atomic)
```

---

## 17. Hard vs Soft Rate Limiting

```
HARD limit: strictly cannot exceed threshold
  Limit: 100 req/min
  Request 101 → BLOCKED. No exceptions.

SOFT limit: can exceed for a short burst
  Limit: 100 req/min
  Request 101–110 → ALLOWED temporarily
  Request 111+ → BLOCKED
```

---

## Key Concepts Summary

```
┌────────────────────────────┬──────────────────────────────────────┐
│ Goal                       │ Solution                             │
├────────────────────────────┼──────────────────────────────────────┤
│ Store counters fast        │ Redis (in-memory, not database)      │
│ Handle burst traffic       │ Token Bucket algorithm               │
│ Stable outflow             │ Leaking Bucket algorithm             │
│ Simple counting            │ Fixed Window Counter                 │
│ Accurate limiting          │ Sliding Window Log                   │
│ Memory efficient + smooth  │ Sliding Window Counter               │
│ Race condition             │ Lua scripts in Redis (atomic)        │
│ Multiple servers in sync   │ Centralized Redis store              │
│ Inform client of limit     │ HTTP headers (Remaining, Retry-After)│
│ Low latency                │ Rules cached in memory               │
│ Multi-region               │ Edge servers + eventual consistency  │
└────────────────────────────┴──────────────────────────────────────┘
```




Token Bucket Algorithm.

---
Story:

Imagine you have a cookie jar. The jar can hold a maximum of 5 cookies.
Every second, a kind baker puts 2 fresh cookies into the jar.
But if the jar is already full, the extra cookies are thrown away — the jar cannot overflow.

Now every time a friend comes and asks for a cookie, you check the jar.
If there is at least 1 cookie, you give it to them and they are happy.
If the jar is empty, you tell them "sorry, come back later."

The baker does not bake on a timer. He only bakes when a friend arrives and asks.
At that point he quickly calculates — "how long was I away? Let me add the cookies I owe."
Then he checks if there are enough cookies for the friend.

That is the entire algorithm.

- jar          = bucket
- cookies      = tokens
- jar capacity = capacity
- baking rate  = refill_rate
- each friend  = one API request
- giving cookie = allowing the request
- empty jar    = rate limit hit, request rejected
---

function allow_request(bucket){
  let {refill_rate, last_refill_time, capacity, current_available_token } = bucket;

  let time_elapsed = new Date() - last_refill_time;
  let new_token = time_elapsed * refill_rate;
  bucket.current_available_token = Math.min(capacity, new_token + current_available_token);
  bucket.last_refill_time = new Date();

  if(bucket.current_available_token >= 1){
    bucket.current_available_token = bucket.current_available_token - 1;
    return true;
  }

  return false;
}


let bucket = {
  current_available_token: 5,
  capacity: 5,
  last_refill_time: new Date(),
  refill_rate: 2 / 1000 
}


Note:
There is no separate timer. That's the smart part of this algorithm.
Tokens are not generated on a schedule.
Instead, they are calculated on demand — only when a request arrives.


---
Shortcomings of this code:

1. Single server only
   The bucket is a variable in memory. If you run 10 servers, each has its own bucket.
   They don't share data. The rate limiter breaks across servers.
   Fix: Store the bucket in Redis so all servers share the same data.

2. Race condition
   Two requests hitting the server at the same time can both read tokens = 1,
   both pass, and both subtract — bypassing the limit.
   Fix: Use Redis Lua scripts to make read + check + write one atomic operation.

3. No user identification
   This code has one bucket for everyone. In reality every user needs their own bucket.
   Fix: Use a unique key per user in Redis, e.g. bucket:user_123

4. No persistence
   If the server restarts, the bucket is gone. All counters reset.
   Fix: Redis persists data across restarts.

5. No 429 response
   The code returns true/false but in a real API you need to return HTTP 429
   with headers: X-Ratelimit-Remaining, X-Ratelimit-Limit, X-Ratelimit-Retry-After
---


---
Test Cases:

// Test 1: Burst — fire 8 requests instantly
// Expected: first 5 pass (bucket starts full), last 3 fail
console.log("--- Test 1: Burst ---");
for(let i = 0; i < 8; i++){
  console.log(`Request ${i + 1}:`, allow_request(bucket));
}

// Reset bucket
bucket.current_available_token = 0;
bucket.last_refill_time = new Date();

// Test 2: Empty bucket — fire request immediately
// Expected: false (no tokens yet)
console.log("\n--- Test 2: Empty bucket ---");
console.log("Request 1:", allow_request(bucket));

// Test 3: Wait 1 second, then fire requests
// Expected: 2 pass (refill rate is 2/sec), then fail
console.log("\n--- Test 3: Wait 1 second then fire ---");
setTimeout(() => {
  console.log("Request 1:", allow_request(bucket)); // true
  console.log("Request 2:", allow_request(bucket)); // true
  console.log("Request 3:", allow_request(bucket)); // false
}, 1000);
---

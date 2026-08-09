```javascript
const WINDOW_MS = 1000;
const LIMIT = 10;
const buckets = new Map();

function allow(uniqueId) {
  const now = Date.now();
  let q = buckets.get(uniqueId);
  if (!q) {
    q = [];
    buckets.set(uniqueId, q);
  }
  const cutoff = now - WINDOW_MS;
  while (q.length && q[0] <= cutoff) q.shift();
  if (q.length >= LIMIT) return false;
  q.push(now);
  return true;
}

const CAPACITY = 10;
const FILL_RATE = 10;
const tokenBuckets = new Map();

function allowTokenBucket(uniqueId) {
  const now = Date.now();
  let b = tokenBuckets.get(uniqueId);
  if (!b) {
    b = { tokens: CAPACITY, lastRefillMs: now };
    tokenBuckets.set(uniqueId, b);
  } else {
    const elapsedSec = (now - b.lastRefillMs) / 1000;
    if (elapsedSec > 0) {
      b.tokens = Math.min(CAPACITY, b.tokens + elapsedSec * FILL_RATE);
      b.lastRefillMs = now;
    }
  }
  if (b.tokens >= 1) {
    b.tokens -= 1;
    return true;
  }
  return false;
}
```
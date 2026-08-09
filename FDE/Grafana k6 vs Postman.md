# Grafana k6 vs Postman — What k6 Can Do That Postman Can't

**Short answer:** k6 does load/performance testing at scale; Postman does functional/manual API testing. They overlap at the edges, but k6 has a set of capabilities Postman fundamentally isn't built for.

## Comparison Table

| Capability | k6 | Postman |
|---|---|---|
| Simulate thousands/millions of concurrent virtual users (VUs) | Yes — built for this, Go-based engine, low overhead per VU | No — Postman Runner/Newman runs requests sequentially or with limited parallelism; not designed for real concurrency at scale |
| Defined load patterns (ramp-up, sustained, spike, soak tests) | Yes — first-class "executors" (`ramping-vus`, `constant-arrival-rate`, etc.) | No — no concept of shaping load over time |
| Performance SLA assertions (thresholds) | Yes — e.g. `p(95)<200ms`, `error rate<1%`, fails the test run if breached | No — Postman tests only assert functional correctness (status codes, body content), not latency/error-rate budgets |
| Distributed load generation across regions | Yes (via Grafana Cloud k6) — generate load beyond what one machine can produce | No |
| Real-time streaming metrics into Grafana/Prometheus/Datadog | Yes — native, that's the point of "Grafana k6" | No |
| Custom metrics (Counter, Gauge, Rate, Trend) inside a test script | Yes | No |
| Protocol coverage beyond REST — WebSockets, gRPC, browser-level tests | Yes | Partial (WS support exists, gRPC support is limited) |
| Version-controlled test-as-code, first-class in CI/CD as a load gate | Yes — plain JS files, single binary | Partial (Newman runs functional collections in CI, but isn't a load tool) |

## What Postman Is Still Better At

- A GUI for exploratory/manual testing
- Building/organizing/sharing collections visually
- Mock servers
- OAuth flow helpers, environment/variable management UI
- API documentation generation

k6 has no real UI for that kind of poking-around workflow — it's code-first.

## Concrete Tie-In: Testing This Demo's Rate Limiter and Circuit Breaker

The rate limiter (100 requests/min) and circuit breaker (trips after 3 consecutive failures) in [gateway.js](gateway.js) are both **concurrency-dependent** behaviors:

- Sequential `curl` calls in a loop prove the *logic* works, but not that it holds up under real concurrent load — e.g. 50 simultaneous requests racing to increment the rate-limit counter in `rateBuckets`.
- Similarly, the circuit breaker's `onFailure`/`canRequest` state transitions were verified one request at a time; a burst of *parallel* failures hitting the breaker concurrently is a different code path (multiple in-flight requests checking/mutating breaker state before any of them resolve).

Postman can't meaningfully simulate that concurrency. k6 could:
- A script spinning up 50 VUs hammering `POST /orders` simultaneously would validate the rate limiter's behavior under race conditions.
- A scenario that kills `orders-service` mid-test would show whether the breaker trips correctly with several concurrent in-flight requests, rather than the clean sequential trip we exercised manually.

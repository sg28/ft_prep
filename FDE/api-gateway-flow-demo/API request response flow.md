# API Gateway — Request/Response Flow: POST /orders

This walks through **one** API call — `POST /orders` — end-to-end, but breaks open every gateway step (TLS, AuthN, AuthZ, rate limiting, validation, service discovery, routing) so you can see *how* each one actually works internally, not just that it happens.

---

## Deep Dive: What Each Gateway Step Actually Does

### Step 1 — Client sends the request

```
POST /orders HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItMTAxIiwic2NvcGUiOiJvcmRlcnM6d3JpdGUiLCJleHAiOjE3NTQ0OTk5OTl9.xxxxx
Content-Type: application/json

{ "items": [{"sku":"ABC123","qty":2}] }
```

This arrives encrypted (HTTPS) at the gateway's public listener.

---

### Step 2 — TLS Termination

- The gateway holds the server's TLS certificate/private key (or fetches it from a cert manager / KMS).
- It decrypts the incoming TLS stream, turning HTTPS into plain HTTP **inside** the gateway process.
- From here on, traffic to backend services is re-encrypted separately via **mTLS** (mutual TLS) on the internal service mesh — the client's original TLS session ends at the gateway.
- Why: backend services don't need to manage public certs; the gateway is the single point of exposure to the internet.

```
[Client]--HTTPS(TLS1.3)-->[Gateway edge: decrypt]
                              |
                              v
                    plaintext HTTP inside gateway
```

---

### Step 3 — AuthN: Validate JWT

The gateway pulls the `Authorization: Bearer <token>` header and:

1. **Splits** the JWT into header.payload.signature.
2. **Verifies the signature** against the issuer's public key (fetched once from the identity provider's JWKS endpoint, cached).
3. **Checks claims**:
   - `exp` (expiry) — reject if in the past → `401`
   - `iss` (issuer) — must match trusted auth server
   - `aud` (audience) — must match this API
4. If valid, decodes claims into a context object attached to the request:

```json
{ "sub": "usr-101", "scope": "orders:write", "exp": 1754499999 }
```

No database call needed — validation is purely cryptographic + local, so this step is fast (sub-millisecond).

---

### Step 4 — AuthZ: Check RBAC Scope

- The gateway knows (from its route config) that `POST /orders` requires scope `orders:write`.
- It compares that against the `scope` claim decoded in Step 3.
- Match → continue. No match → `403 Forbidden`, request dies here, **never reaches the microservice**.

```
required_scope = "orders:write"
token_scope    = "orders:write"
required_scope in token_scope.split(" ")  →  true → PASS
```

---

### Step 5 — Rate Limiting

- The gateway keys a counter by client identity (e.g. `usr-101` from the JWT `sub`, or by API key / IP).
- Common algorithm: **sliding window** or **token bucket** stored in a fast shared store (Redis).

```
key = "ratelimit:usr-101:orders:write"
current_count = INCR key           # e.g. 47
if current_count == 1: EXPIRE key 60s
if current_count > limit(100/min): reject with 429
```

- Response headers are typically added either way:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 53
X-RateLimit-Reset: 1754500020
```

---

### Step 6 — Request Body Validation

Since this is a `POST` with a body, the gateway validates the payload shape **before** wasting a network hop to the service:

```json
schema: {
  "items": { "type": "array", "minItems": 1,
    "items": { "sku": "string", "qty": "number>0" } }
}
```

- Body `{ "items": [{"sku":"ABC123","qty":2}] }` → valid → continue.
- If `qty` were `0` or missing → `400 Bad Request`, short-circuited at the gateway.

*(Note: mutating requests like `POST` skip cache entirely — there's nothing safe to read or reuse from a cache for a write.)*

---

### Step 7 — Service Discovery

- The gateway doesn't hardcode `orders-service`'s IP. It asks a **service registry** (Consul, Eureka, or Kubernetes DNS/Service):

```
query: "orders-service"
registry response:
  [ {ip: 10.0.4.12, port: 8080, healthy: true},
    {ip: 10.0.4.19, port: 8080, healthy: true},
    {ip: 10.0.4.27, port: 8080, healthy: false}  <- excluded
  ]
```

- Unhealthy instances (failed health checks) are filtered out.
- The gateway picks one via a load-balancing strategy (round-robin, least-connections, etc.) → `10.0.4.12:8080`.

---

### Step 8 — Route + Forward (Token Exchange)

- The gateway rewrites/matches the path to the internal route (e.g. `/orders` → `orders-service/v1/orders`).
- It **strips the client's original JWT** — the microservice should never see or trust user-facing tokens directly.
- It **mints a new internal credential** — either:
  - a short-lived internal service JWT (signed by the gateway's own internal CA), or
  - relies on the mTLS client certificate as the identity itself.
- It forwards the original claims as context (e.g. `X-User-Id: usr-101`) so the service knows *who* acted, without re-doing auth.

```
Forwarded request:
POST http://10.0.4.12:8080/v1/orders
X-User-Id: usr-101
X-Internal-Token: <short-lived internal JWT>
(mTLS client cert presented at connection level)
Body: { "items": [{"sku":"ABC123","qty":2}] }
```

Why strip-and-reissue instead of just passing the client JWT through: it limits blast radius (internal token has a much shorter TTL and narrower audience), and it decouples internal services from the public identity provider entirely.

---

## Full Flow: POST /orders

```
CLIENT                 API GATEWAY                        ORDERS SERVICE         ORDERS DB      MESSAGE BROKER
  │                         │                                    │                   │                │
  │  1. POST /orders         │                                    │                   │                │
  │  Authorization: Bearer   │                                    │                   │                │
  │  <JWT>                   │                                    │                   │                │
  │  Body: {items, qty}      │                                    │                   │                │
  ├────────────────────────►│                                    │                   │                │
  │                         │  2. TLS terminate                  │                   │                │
  │                         │  3. Validate JWT (AuthN)            │                   │                │
  │                         │  4. Check RBAC scope "orders:write" │                   │                │
  │                         │  5. Rate-limit check                 │                   │                │
  │                         │  6. Validate request body            │                   │                │
  │                         │     (schema: items[], qty>0)         │                   │                │
  │                         │     ── invalid → 400 short-circuit ──│                   │                │
  │                         │  7. Resolve service via               │                   │                │
  │                         │     Service Discovery                 │                   │                │
  │                         │  8. Route + forward request           │                   │                │
  │                         │     (strip client JWT, attach         │                   │                │
  │                         │      internal service token, mTLS)    │                   │                │
  │                         ├───────────────────────────────────►│                   │                │
  │                         │                                    │  9. Validate      │                │
  │                         │                                    │      internal token│                │
  │                         │                                    │  10. Business rules│                │
  │                         │                                    │      (stock check) │                │
  │                         │                                    │  11. Insert order  │                │
  │                         │                                    ├──────────────────►│                │
  │                         │                                    │  12. order_id=987 │                │
  │                         │                                    │◄──────────────────┤                │
  │                         │                                    │  13. Publish event │                │
  │                         │                                    │  "order.created"   │                │
  │                         │                                    ├───────────────────────────────────►│
  │                         │                                    │  14. ack           │                │
  │                         │                                    │◄───────────────────────────────────┤
  │                         │  15. 201 Created + Location header  │                   │                │
  │                         │      body: {order_id:987,...}       │                   │                │
  │                         │◄───────────────────────────────────┤                   │                │
  │                         │  16. (mutating call → no cache)     │                   │                │
  │                         │  17. Log + emit metrics/trace span  │                   │                │
  │  18. 201 Created         │                                    │                   │                │
  │  { "order_id":987 }     │                                    │                   │                │
  │◄────────────────────────┤                                    │                   │                │
  │                         │                                    │                   │                │
```

**Key gateway steps:** TLS terminate → AuthN (JWT) → AuthZ (RBAC scope) → rate limit → body validation → service discovery → route/forward (token exchange) → *(downstream: DB write + async event publish)* → log/trace → return.

---

## Common Failure Paths

```
  JWT invalid/expired    → Gateway returns 401 immediately (no downstream call)
  RBAC scope missing     → Gateway returns 403 immediately
  Rate limit exceeded    → Gateway returns 429 immediately
  Body fails validation  → Gateway returns 400 immediately (never reaches service)
  Service discovery fails→ Gateway returns 503 (Service Unavailable)
  Downstream timeout     → Circuit breaker trips → Gateway returns 504 / fallback
  Downstream 5xx         → Gateway logs, may retry (only if idempotent), then surfaces error
```

---

## Node.js Implementation

A runnable version of this exact pipeline lives alongside this doc:

| File | Implements |
|---|---|
| [gateway.js](gateway.js) | TLS termination (real HTTPS listener + dev cert), `authenticate` (AuthN), `requireScope` (AuthZ), `rateLimit`, `validateOrderBody`, `cacheGet`/`cacheSet` (read caching), `discover` (service discovery), `CircuitBreaker` class, `callOrdersService` (token exchange + proxy, wrapped by the breaker) |
| [orders-service.js](orders-service.js) | `verifyInternalToken`, `POST /v1/orders` (stock check stub, in-memory insert, `EventEmitter`-based broker publish, 201), `GET /v1/orders/:id` (read path for the gateway's cache), `POST /v1/test/fail-next/:count` (test hook to force simulated 500s) |
| [make-token.js](make-token.js) | Mints a client JWT with configurable scope (stands in for a real identity provider) |
| [certs/](certs/) | Self-signed dev TLS cert/key (`dev-cert.pem`, `dev-key.pem`) used by the HTTPS listener |
| [package.json](package.json) | `express` + `jsonwebtoken` deps and run scripts |

This now covers every box from the architecture doc: **TLS, AuthN, AuthZ, rate limiting, request validation, caching, routing (service discovery + forward), circuit breaker.**

Verified end-to-end: 201 create, cache MISS→HIT on repeated GETs, 3 consecutive downstream 500s trip the breaker to `open` (503, no downstream call made), and a successful trial after the cooldown closes it again.

### Run it

```bash
cd "ft_prep/FDE/api-gateway-flow-demo"
npm install

# terminal 1
npm run start:orders

# terminal 2
npm run start:gateway

# terminal 3 — create an order (TLS is self-signed, so curl needs -k)
TOKEN=$(node make-token.js)
curl -k -X POST https://localhost:3000/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"sku":"ABC123","qty":2}]}'
# → 201 Created  { "order_id": 987, "status": "created" }

# read it back — first call is a MISS, second is a HIT (X-Cache header)
curl -sk https://localhost:3000/orders/987 -H "Authorization: Bearer $TOKEN" -D - -o /dev/null
curl -sk https://localhost:3000/orders/987 -H "Authorization: Bearer $TOKEN" -D - -o /dev/null

# force the breaker open: make the next 3 downstream GETs fail, then hit 3 fresh ids
curl -X POST http://localhost:4001/v1/test/fail-next/3
for id in 1001 1002 1003; do curl -sk https://localhost:3000/orders/$id -H "Authorization: Bearer $TOKEN" -o /dev/null -w "%{http_code}\n"; done
curl -sk https://localhost:3000/internal/circuit-state   # → {"orders-service":"open"}
curl -sk https://localhost:3000/orders/1004 -H "Authorization: Bearer $TOKEN"  # → 503 circuit_open, no downstream call
```

Notes on where the demo still simplifies vs. a real deployment:
- **TLS** — a self-signed dev cert for `localhost`; production uses a CA-issued cert (often via a cert manager / ACME) and rotates it automatically.
- **JWT secrets** — shared secrets (`CLIENT_JWT_SECRET`, `INTERNAL_JWT_SECRET`); production verifies client JWTs against an identity provider's public JWKS and stores internal signing keys in a KMS/secret manager.
- **Service discovery** — a static, single-instance registry stub; production uses Consul/Eureka/Kubernetes DNS with live health checks.
- **Rate limiting** — an in-memory `Map`; production uses a shared store (Redis) so limits hold across multiple gateway instances.
- **Caching** — an in-memory `Map` with a fixed 60s TTL; production uses Redis/Memcached with per-route TTLs and explicit invalidation on writes.
- **Circuit breaker** — a single in-process `CircuitBreaker` instance; production breakers are usually per-instance-of-the-gateway-process but coordinate trip state via shared telemetry, and thresholds are tuned per downstream dependency.
- **Message broker** — a local `EventEmitter`; production publishes to Kafka/RabbitMQ so other services can subscribe.

'use strict';

/**
 * API Gateway — implements the full pipeline from "API request response
 * flow.md" / "API gatewat architecture.md":
 *   TLS terminate → AuthN (JWT) → AuthZ (RBAC scope) → Rate limit →
 *   Request validation → Cache (reads only) → Service discovery →
 *   Route/forward (token exchange, behind a circuit breaker) → log/trace.
 *
 * Run: node gateway.js   (after orders-service.js is running)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const express = require('express');
const jwt = require('jsonwebtoken');

const PORT = process.env.GATEWAY_PORT || 3000;

// In production these come from a KMS/secret manager, and the client JWT
// is verified against the identity provider's public JWKS, not a shared secret.
const CLIENT_JWT_SECRET = 'client-issuer-secret';
const INTERNAL_JWT_SECRET = 'internal-service-secret';

const app = express();
app.use(express.json());

// ---------------------------------------------------------------------------
// Observability — wraps every request with a trace id and logs the outcome.
// ---------------------------------------------------------------------------
function logAndTrace(req, res, next) {
  const start = Date.now();
  req.traceId = Math.random().toString(36).slice(2, 10);
  res.on('finish', () => {
    console.log(
      `[trace=${req.traceId}] ${req.method} ${req.path} -> ${res.statusCode} (${Date.now() - start}ms)`
    );
  });
  next();
}

// ---------------------------------------------------------------------------
// Step — AuthN: validate the client JWT (signature, issuer, audience, exp)
// ---------------------------------------------------------------------------
function authenticate(req, res, next) {
  const [, token] = (req.headers.authorization || '').split(' ');
  if (!token) return res.status(401).json({ error: 'missing_token' });

  try {
    req.user = jwt.verify(token, CLIENT_JWT_SECRET, {
      issuer: 'https://auth.example.com',
      audience: 'orders-api',
    });
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token', detail: err.message });
  }
}

// ---------------------------------------------------------------------------
// Step — AuthZ: the route requires a specific scope in the token
// ---------------------------------------------------------------------------
function requireScope(scope) {
  return (req, res, next) => {
    const scopes = (req.user.scope || '').split(' ');
    if (!scopes.includes(scope)) {
      return res.status(403).json({ error: 'insufficient_scope', required: scope });
    }
    next();
  };
}

// ---------------------------------------------------------------------------
// Step — Rate limiting: in-memory sliding window keyed by client + route
// ---------------------------------------------------------------------------
const RATE_LIMIT = 100;
const RATE_WINDOW_MS = 60_000;
const rateBuckets = new Map();

function rateLimit(req, res, next) {
  const key = `${req.user.sub}:${req.method}:${req.path}`;
  const now = Date.now();
  let bucket = rateBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + RATE_WINDOW_MS };
    rateBuckets.set(key, bucket);
  }
  bucket.count += 1;

  res.set('X-RateLimit-Limit', String(RATE_LIMIT));
  res.set('X-RateLimit-Remaining', String(Math.max(RATE_LIMIT - bucket.count, 0)));
  res.set('X-RateLimit-Reset', String(Math.floor(bucket.resetAt / 1000)));

  if (bucket.count > RATE_LIMIT) {
    return res.status(429).json({ error: 'rate_limit_exceeded' });
  }
  next();
}

// ---------------------------------------------------------------------------
// Step — Request body validation (mutating requests skip cache entirely)
// ---------------------------------------------------------------------------
function validateOrderBody(req, res, next) {
  const { items } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'invalid_body', detail: 'items[] required' });
  }
  for (const item of items) {
    if (typeof item.sku !== 'string' || !(Number(item.qty) > 0)) {
      return res
        .status(400)
        .json({ error: 'invalid_body', detail: 'each item needs sku:string, qty>0' });
    }
  }
  next();
}

// ---------------------------------------------------------------------------
// Step — Response caching (reads only). A real gateway backs this with
// Redis/Memcached so the cache holds across multiple gateway instances.
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 60_000;
const responseCache = new Map(); // cacheKey -> { body, expiresAt }

function cacheGet(key) {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    responseCache.delete(key);
    return null;
  }
  return entry.body;
}

function cacheSet(key, body) {
  responseCache.set(key, { body, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ---------------------------------------------------------------------------
// Step — Service discovery: static registry stub + round-robin + health filter
// ---------------------------------------------------------------------------
const serviceRegistry = {
  'orders-service': [{ host: '127.0.0.1', port: 4001, healthy: true }],
};
let rrIndex = 0;

function discover(serviceName) {
  const instances = (serviceRegistry[serviceName] || []).filter((i) => i.healthy);
  if (instances.length === 0) return null;
  const instance = instances[rrIndex % instances.length];
  rrIndex += 1;
  return instance;
}

// ---------------------------------------------------------------------------
// Step — Circuit breaker, wrapping calls to a downstream service by name.
// States: closed (normal) -> open (short-circuits everything) -> half-open
// (lets one trial request through) -> closed on success / open on failure.
// ---------------------------------------------------------------------------
class CircuitBreaker {
  constructor({ failureThreshold = 3, cooldownMs = 10_000 } = {}) {
    this.failureThreshold = failureThreshold;
    this.cooldownMs = cooldownMs;
    this.breakers = new Map(); // serviceName -> { state, failures, nextAttempt, trialInFlight }
  }

  _get(serviceName) {
    if (!this.breakers.has(serviceName)) {
      this.breakers.set(serviceName, {
        state: 'closed',
        failures: 0,
        nextAttempt: 0,
        trialInFlight: false,
      });
    }
    return this.breakers.get(serviceName);
  }

  canRequest(serviceName) {
    const b = this._get(serviceName);
    if (b.state === 'closed') return true;

    if (b.state === 'open') {
      if (Date.now() >= b.nextAttempt && !b.trialInFlight) {
        b.state = 'half-open';
        b.trialInFlight = true;
        return true; // let exactly one trial request through
      }
      return false;
    }

    // half-open: only the in-flight trial is allowed
    return false;
  }

  onSuccess(serviceName) {
    const b = this._get(serviceName);
    b.state = 'closed';
    b.failures = 0;
    b.trialInFlight = false;
  }

  onFailure(serviceName) {
    const b = this._get(serviceName);
    b.failures += 1;
    b.trialInFlight = false;
    if (b.state === 'half-open' || b.failures >= this.failureThreshold) {
      b.state = 'open';
      b.nextAttempt = Date.now() + this.cooldownMs;
    }
  }

  stateOf(serviceName) {
    return this._get(serviceName).state;
  }
}

const breaker = new CircuitBreaker({ failureThreshold: 3, cooldownMs: 10_000 });

// ---------------------------------------------------------------------------
// Step — Route + forward: strip client JWT, mint short-lived internal token,
// forward user identity as a header, proxy the request downstream through
// the circuit breaker.
// ---------------------------------------------------------------------------
function mintInternalToken(sub) {
  return jwt.sign({ sub, aud: 'internal-services' }, INTERNAL_JWT_SECRET, {
    expiresIn: '30s',
  });
}

function callOrdersService(req, { method, downstreamPath, body }) {
  const serviceName = 'orders-service';

  return new Promise((resolve, reject) => {
    if (!breaker.canRequest(serviceName)) {
      return reject(Object.assign(new Error('circuit_open'), { code: 'CIRCUIT_OPEN' }));
    }

    const instance = discover(serviceName);
    if (!instance) {
      return reject(Object.assign(new Error('service_unavailable'), { code: 'NO_INSTANCE' }));
    }

    const payload = body !== undefined ? JSON.stringify(body) : undefined;
    const headers = {
      'X-User-Id': req.user.sub,
      'X-Internal-Token': mintInternalToken(req.user.sub),
      'X-Trace-Id': req.traceId,
    };
    if (payload !== undefined) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const proxyReq = http.request(
      { host: instance.host, port: instance.port, path: downstreamPath, method, headers, timeout: 3000 },
      (proxyRes) => {
        let raw = '';
        proxyRes.on('data', (chunk) => (raw += chunk));
        proxyRes.on('end', () => {
          const result = { statusCode: proxyRes.statusCode, headers: proxyRes.headers, body: raw };
          // 5xx counts as a downstream failure for breaker purposes; 2xx/3xx/4xx
          // means the service is up and responded, so the breaker stays closed.
          if (result.statusCode >= 500) {
            breaker.onFailure(serviceName);
            reject(Object.assign(new Error('downstream_5xx'), { code: 'DOWNSTREAM_5XX', result }));
          } else {
            breaker.onSuccess(serviceName);
            resolve(result);
          }
        });
      }
    );

    proxyReq.on('timeout', () => proxyReq.destroy(new Error('downstream_timeout')));
    proxyReq.on('error', (err) => {
      breaker.onFailure(serviceName);
      reject(Object.assign(err, { code: err.code || 'DOWNSTREAM_ERROR' }));
    });

    if (payload !== undefined) proxyReq.write(payload);
    proxyReq.end();
  });
}

function handleProxyError(res, err) {
  if (err.code === 'CIRCUIT_OPEN') {
    return res
      .status(503)
      .json({ error: 'circuit_open', detail: 'orders-service is unhealthy, try again later' });
  }
  if (err.code === 'NO_INSTANCE') {
    return res.status(503).json({ error: 'service_unavailable' });
  }
  if (err.code === 'DOWNSTREAM_5XX') {
    return res.status(502).json({ error: 'downstream_error', detail: err.result.body });
  }
  // timeout / ECONNREFUSED / ECONNRESET etc.
  return res.status(504).json({ error: 'downstream_unavailable', detail: err.message });
}

// ---------------------------------------------------------------------------
// Route wiring
// ---------------------------------------------------------------------------

// POST /orders — write path: no cache, always goes through the breaker.
app.post(
  '/orders',
  logAndTrace,
  authenticate,
  requireScope('orders:write'),
  rateLimit,
  validateOrderBody,
  async (req, res) => {
    try {
      const result = await callOrdersService(req, {
        method: 'POST',
        downstreamPath: '/v1/orders',
        body: req.body,
      });
      res.status(result.statusCode);
      if (result.headers.location) res.set('Location', result.headers.location);
      res.set('Content-Type', 'application/json');
      res.send(result.body);
    } catch (err) {
      handleProxyError(res, err);
    }
  }
);

// GET /orders/:id — read path: cache-first, falls through to the breaker on a miss.
app.get(
  '/orders/:id',
  logAndTrace,
  authenticate,
  requireScope('orders:read'),
  rateLimit,
  async (req, res) => {
    const cacheKey = `GET:/orders/${req.params.id}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      res.set('X-Cache', 'HIT');
      res.set('Content-Type', 'application/json');
      return res.status(200).send(cached);
    }

    try {
      const result = await callOrdersService(req, {
        method: 'GET',
        downstreamPath: `/v1/orders/${req.params.id}`,
      });
      res.set('X-Cache', 'MISS');
      res.set('Content-Type', 'application/json');
      if (result.statusCode === 200) cacheSet(cacheKey, result.body);
      res.status(result.statusCode).send(result.body);
    } catch (err) {
      handleProxyError(res, err);
    }
  }
);

app.get('/internal/circuit-state', (req, res) => {
  res.json({ 'orders-service': breaker.stateOf('orders-service') });
});

// ---------------------------------------------------------------------------
// Step — TLS termination: real HTTPS listener with a dev cert. Everything
// upstream of this line runs over plaintext HTTP inside the process.
// ---------------------------------------------------------------------------
const tlsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'dev-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'dev-cert.pem')),
};

https.createServer(tlsOptions, app).listen(PORT, () => {
  console.log(`API Gateway listening on https://localhost:${PORT} (self-signed dev cert)`);
});

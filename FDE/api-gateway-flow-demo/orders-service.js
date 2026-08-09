'use strict';

/**
 * Orders Service — receives the already-authenticated, already-validated
 * request forwarded by gateway.js. Implements steps 9-15 of the flow:
 *   validate internal token → business rules → insert order →
 *   publish "order.created" event → respond 201.
 *
 * Run: node orders-service.js   (before gateway.js)
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { EventEmitter } = require('events');

const PORT = process.env.ORDERS_PORT || 4001;
const INTERNAL_JWT_SECRET = 'internal-service-secret'; // must match gateway.js

const app = express();
app.use(express.json());

// ---------------------------------------------------------------------------
// Fake message broker (stand-in for Kafka/RabbitMQ)
// ---------------------------------------------------------------------------
const broker = new EventEmitter();
broker.on('order.created', (event) => {
  console.log('[broker] published order.created', event);
});

// ---------------------------------------------------------------------------
// In-memory "database"
// ---------------------------------------------------------------------------
const ordersDb = [];
let nextOrderId = 987;

// ---------------------------------------------------------------------------
// Step 9 — validate the internal token minted by the gateway
// ---------------------------------------------------------------------------
function verifyInternalToken(req, res, next) {
  const token = req.headers['x-internal-token'];
  if (!token) return res.status(401).json({ error: 'missing_internal_token' });

  try {
    jwt.verify(token, INTERNAL_JWT_SECRET, { audience: 'internal-services' });
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid_internal_token', detail: err.message });
  }
}

app.post('/v1/orders', verifyInternalToken, (req, res) => {
  const userId = req.headers['x-user-id'];
  const { items } = req.body;

  // Step 10 — business rules (stock check stub — always passes here)
  const inStock = items.every(() => true);
  if (!inStock) {
    return res.status(409).json({ error: 'out_of_stock' });
  }

  // Step 11 — insert order
  const order = {
    order_id: nextOrderId++,
    user_id: userId,
    items,
    status: 'created',
    created_at: new Date().toISOString(),
  };
  ordersDb.push(order);

  // Step 13 — publish async event
  broker.emit('order.created', { order_id: order.order_id, user_id: userId });

  // Step 15 — respond
  res
    .status(201)
    .set('Location', `/orders/${order.order_id}`)
    .json({ order_id: order.order_id, status: order.status });
});

// Test hook: makes circuit-breaker tripping reproducible on demand
// (a real breaker trips on real timeouts/5xxs — this just simulates one).
// POST /v1/test/fail-next/3  ->  the next 3 GET /v1/orders/:id calls return 500.
let failNextCount = 0;
app.post('/v1/test/fail-next/:count', (req, res) => {
  failNextCount = Number(req.params.count) || 0;
  res.json({ failNextCount });
});

// Read path used by the gateway's cache-then-forward flow for GET /orders/:id.
app.get('/v1/orders/:id', verifyInternalToken, (req, res) => {
  if (failNextCount > 0) {
    failNextCount -= 1;
    return res.status(500).json({ error: 'simulated_failure' });
  }
  const order = ordersDb.find((o) => o.order_id === Number(req.params.id));
  if (!order) return res.status(404).json({ error: 'not_found' });
  res.status(200).json(order);
});

app.listen(PORT, () => console.log(`Orders Service listening on :${PORT}`));

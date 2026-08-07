'use strict';

/**
 * Mints a client JWT that satisfies gateway.js's authenticate() +
 * requireScope() checks. Stands in for a real identity provider
 * (Auth0/Okta/Cognito) in this demo.
 *
 * Run: node make-token.js                    (both scopes, for testing)
 *      node make-token.js orders:write        (write-only token)
 */

const jwt = require('jsonwebtoken');

const CLIENT_JWT_SECRET = 'client-issuer-secret'; // must match gateway.js
const scope = process.argv[2] || 'orders:write orders:read';

const token = jwt.sign(
  { sub: 'usr-101', scope },
  CLIENT_JWT_SECRET,
  {
    issuer: 'https://auth.example.com',
    audience: 'orders-api',
    expiresIn: '1h',
  }
);

console.log(token);

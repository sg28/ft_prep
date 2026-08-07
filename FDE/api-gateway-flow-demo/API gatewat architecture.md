# API Gateway Architecture

## Glossary (full forms, first use expanded below)

| Acronym | Full Form |
|---|---|
| TLS | Transport Layer Security |
| mTLS | Mutual Transport Layer Security |
| SSL | Secure Sockets Layer (predecessor to TLS; "SSL Offload" is legacy terminology for TLS termination) |
| HTTPS | HyperText Transfer Protocol Secure |
| AuthN | Authentication |
| AuthZ | Authorization |
| JWT | JSON Web Token |
| OAuth2 | Open Authorization, version 2 |
| RBAC | Role-Based Access Control |
| ABAC | Attribute-Based Access Control |
| WAF | Web Application Firewall |
| CDN | Content Delivery Network |
| DNS | Domain Name System |
| L4 / L7 | Layer 4 (Transport) / Layer 7 (Application) — OSI model network layers |
| DB | Database |

```
                                   ┌────────────────────────────┐
                                   │          CLIENTS            │
                                   │  Web App │ Mobile │ 3rd-Party│
                                   └──────────────┬───────────────┘
                                                  │  HTTPS
                                                  ▼
                              ┌───────────────────────────────────┐
                              │              DNS / CDN              │
                              │        (Edge caching, WAF)          │
                              └──────────────────┬────────────────┘
                                                  ▼
                              ┌───────────────────────────────────┐
                              │        LOAD BALANCER (L4/L7)        │
                              └──────────────────┬────────────────┘
                                                  ▼
╔═══════════════════════════════════════════════════════════════════════════╗
║                              API GATEWAY                                  ║
║                                                                           ║
║   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               ║
║   │  TLS Termination│ │  Authentication │ │  Authorization │              ║
║   │   (SSL Offload) │→│  (OAuth2/JWT)   │→│   (RBAC/ABAC)  │              ║
║   └───────────────┘  └───────────────┘  └───────┬───────┘               ║
║                                                    ▼                      ║
║   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               ║
║   │  Rate Limiting │←│   Request       │→│   Request      │              ║
║   │  / Throttling  │  │   Validation    │  │  Transformation│             ║
║   └───────────────┘  └───────────────┘  └───────┬───────┘               ║
║                                                    ▼                      ║
║   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               ║
║   │    Caching     │  │    Routing /    │  │  Circuit       │             ║
║   │   (Response)   │←│   Path Matching │→│  Breaker       │              ║
║   └───────────────┘  └───────┬───────┘  └───────────────┘               ║
║                                ▼                                         ║
║   ┌───────────────────────────────────────────────────────┐            ║
║   │        Logging / Metrics / Tracing (Observability)      │            ║
║   └───────────────────────────────────────────────────────┘            ║
╚══════════════════════════════════╤════════════════════════════════════╝
                                    │  (Internal routing, mTLS)
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
     ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
     │   Service A      │  │   Service B      │  │   Service C      │
     │ (Auth Service)   │  │ (Orders Service) │  │ (Users Service)  │
     └────────┬────────┘  └────────┬────────┘  └────────┬────────┘
              │                     │                     │
              ▼                     ▼                     ▼
     ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
     │   Auth DB        │  │   Orders DB      │  │   Users DB       │
     └─────────────────┘  └─────────────────┘  └─────────────────┘

              ┌─────────────────────────────────────────────┐
              │        Service Discovery (Consul/Eureka)      │
              │              & Config Server                  │
              └─────────────────────────────────────────────┘
                       (queried by API Gateway for
                        dynamic backend endpoints)

              ┌─────────────────────────────────────────────┐
              │     Message Broker (Kafka / RabbitMQ)          │
              │   (async events between services, webhooks)    │
              └─────────────────────────────────────────────┘
```

## Layer Breakdown

### 1. Client Layer
- Web, mobile, and third-party consumers hit the gateway over HTTPS (HyperText Transfer Protocol Secure).

### 2. Edge Layer
- **CDN (Content Delivery Network) / WAF (Web Application Firewall)** — caches static content, blocks malicious traffic.
- **Load Balancer** — distributes traffic across gateway instances (L4/L7 = Layer 4 / Layer 7, the OSI model's Transport and Application layers).

### 3. API Gateway Core
- **TLS (Transport Layer Security) Termination** — decrypts incoming HTTPS.
- **Authentication (AuthN)** — validates identity (OAuth2 = Open Authorization v2, JWT = JSON Web Token, API keys).
- **Authorization (AuthZ)** — enforces access policy (RBAC = Role-Based Access Control / ABAC = Attribute-Based Access Control).
- **Rate Limiting / Throttling** — protects backend from abuse/overload.
- **Request Validation** — schema checks, sanitization.
- **Request/Response Transformation** — protocol translation, payload shaping.
- **Routing** — path/header-based dispatch to correct microservice.
- **Caching** — reduces load for repeated GETs.
- **Circuit Breaker** — fails fast when a downstream service is unhealthy.
- **Observability** — centralized logging, metrics, distributed tracing.

### 4. Service Layer
- Independent microservices, each owning its own datastore (database-per-service pattern).

### 5. Supporting Infrastructure
- **Service Discovery** — gateway resolves live service instances dynamically.
- **Config Server** — centralized configuration for gateway and services.
- **Message Broker** — decouples services via async events.

## Common Gateway Responsibilities Summary
| Concern         | Component                     |
|------------------|-------------------------------|
| Security         | TLS (Transport Layer Security), AuthN (Authentication), AuthZ (Authorization), WAF (Web Application Firewall) |
| Traffic Control   | Rate limiting, Load balancing  |
| Resilience        | Circuit breaker, Retries       |
| Performance       | Caching, Compression           |
| Visibility        | Logging, Metrics, Tracing      |
| Flexibility       | Routing, Transformation        |

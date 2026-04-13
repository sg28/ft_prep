# SOC Agent Platform — World Class System Architecture
## Billion Dollar Company Design

> Strategy: The architecture is the foundation. The **data moat + feedback flywheel** is the business.
> Every design decision below compounds over time — more customers → more data → smarter model → more automation → lower cost → more customers.

---

```
╔══════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                    MULTI-TENANT CONTROL PLANE                                       ║
║                                                                                                      ║
║   Customer A (Tenant)        Customer B (Tenant)        Customer C (Tenant)                         ║
║   ┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐                        ║
║   │ Isolated pipeline│       │ Isolated pipeline│       │ Isolated pipeline│   ...N tenants         ║
║   │ Isolated RAG ctx │       │ Isolated RAG ctx │       │ Isolated RAG ctx │                        ║
║   │ Isolated models  │       │ Isolated models  │       │ Isolated models  │                        ║
║   │ Per-tenant SLA   │       │ Per-tenant SLA   │       │ Per-tenant SLA   │                        ║
║   └──────────────────┘       └──────────────────┘       └──────────────────┘                        ║
║                                                                                                      ║
║   Tenant isolation: data never crosses boundaries | Per-tenant cost accounting | RBAC per tenant    ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝
                                              │
                                              │  (scoped per tenant below)
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              LAYER 1 — REAL-TIME STREAMING INGESTION                                │
│                                                                                                     │
│  Sources:                                                                                           │
│  Cloud Logs    SIEM Events    Endpoint Agents    Threat Feeds    Network Flows    Identity Events   │
│      │              │               │                │               │                 │            │
│      └──────────────┴───────────────┴────────────────┴───────────────┴─────────────────┘            │
│                                          │                                                          │
│                                          ▼                                                          │
│                          ┌───────────────────────────────┐                                         │
│                          │   Kafka / Kinesis Stream       │  ← high throughput, ordered, durable   │
│                          │   Partitioned per tenant       │                                         │
│                          └───────────────┬───────────────┘                                         │
│                                          │                                                          │
│              ┌───────────────────────────┼───────────────────────────┐                             │
│              ▼                           ▼                           ▼                             │
│   ┌──────────────────┐      ┌────────────────────────┐   ┌────────────────────────┐               │
│   │  NORMALIZATION   │      │     ENRICHMENT          │   │   PROMPT INJECTION     │               │
│   │                  │      │                        │   │   SANITIZATION         │               │
│   │ Schema mapping   │      │ GeoIP, User identity   │   │                        │               │
│   │ OCSF standard    │      │ Asset ownership        │   │ ⚠ Log events are       │               │
│   │ format           │      │ Threat intel lookup    │   │   attacker-controlled  │               │
│   │                  │      │ Vulnerability context  │   │                        │               │
│   │                  │      │                        │   │ Escape, sanitize,      │               │
│   │                  │      │                        │   │ structure BEFORE       │               │
│   │                  │      │                        │   │ touching LLM           │               │
│   └──────────────────┘      └────────────────────────┘   └────────────────────────┘               │
│              │                           │                           │                             │
│              └───────────────────────────┴───────────────────────────┘                             │
│                                          │                                                          │
│                                          ▼                                                          │
│                          ┌───────────────────────────────┐                                         │
│                          │   DETECTION RULE EVALUATION   │                                         │
│                          │                               │                                         │
│                          │  Python rules (Panther DSL)   │                                         │
│                          │  Sigma rule translation       │                                         │
│                          │  Threshold + correlation      │                                         │
│                          │  Alert deduplication          │                                         │
│                          └───────────────┬───────────────┘                                         │
│                                          │  Alert fired (severity + metadata)                      │
└──────────────────────────────────────────┼──────────────────────────────────────────────────────── ┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              LAYER 2 — ALERT ROUTING & PRIORITIZATION                               │
│                                                                                                     │
│                          ┌───────────────────────────────┐                                         │
│                          │      ALERT ROUTER              │                                         │
│                          │                               │                                         │
│                          │  Critical (P0) ──────────────▶│──▶ Synchronous agent (< 30s SLA)       │
│                          │  High     (P1) ──────────────▶│──▶ Priority queue   (< 5 min SLA)      │
│                          │  Medium   (P2) ──────────────▶│──▶ Standard queue   (< 30 min SLA)     │
│                          │  Low      (P3) ──────────────▶│──▶ Batch queue      (< 4 hr SLA)       │
│                          │                               │                                         │
│                          │  Dedup: same alert < 5 min    │                                         │
│                          │  Correlation: chain alerts    │                                         │
│                          │  into single incident         │                                         │
│                          └───────────────┬───────────────┘                                         │
│                                          │                                                          │
│              ┌───────────────────────────┼────────────────────────────┐                            │
│              ▼                           ▼                            ▼                            │
│    ┌─────────────────┐       ┌───────────────────────┐    ┌───────────────────────┐               │
│    │  FALLBACK PATH  │       │   AGENT JOB QUEUE     │    │  LLM API DOWN?        │               │
│    │                 │       │   (async workers)     │    │                       │               │
│    │  If LLM down:   │       │                       │    │  Circuit breaker      │               │
│    │  deterministic  │       │  Worker pool scales   │    │  → deterministic      │               │
│    │  rules auto-    │       │  with alert volume    │    │    rules fallback     │               │
│    │  triage P0/P1   │       │                       │    │  → page on-call       │               │
│    └─────────────────┘       └───────────────┬───────┘    └───────────────────────┘               │
└─────────────────────────────────────────────┼───────────────────────────────────────────────────── ┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 LAYER 3 — AGENTIC CORE                                              │
│                                                                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────────────────────────┐  │
│   │                              AGENT ORCHESTRATOR                                              │  │
│   │                                                                                              │  │
│   │   Step 1: Context Pre-loading          Step 2: Planning                                     │  │
│   │   ┌─────────────────────────┐          ┌──────────────────────────────┐                    │  │
│   │   │ • Alert metadata        │          │ Decide execution plan:       │                    │  │
│   │   │ • Entity history (EDR)  │──────────▶ • Which tools to call?      │                    │  │
│   │   │ • Similar past alerts   │          │ • Deterministic first?       │                    │  │
│   │   │ • SOC playbooks (RAG)   │          │ • Parallel tool calls?       │                    │  │
│   │   │ • Tenant-specific rules │          │ • How many LLM steps?        │                    │  │
│   │   └─────────────────────────┘          └──────────────────────────────┘                    │  │
│   │                                                      │                                      │  │
│   │                           ┌──────────────────────────┼──────────────────────┐               │  │
│   │                           │                          │                      │               │  │
│   │                           ▼                          ▼                      ▼               │  │
│   │             ┌─────────────────────┐   ┌─────────────────────┐  ┌─────────────────────┐    │  │
│   │             │  DETERMINISTIC      │   │   LLM REASONING     │  │   TOOL EXECUTION    │    │  │
│   │             │  STEPS (fast, free) │   │   (Claude / GPT-4)  │  │   via MCP           │    │  │
│   │             │                     │   │                     │  │                     │    │  │
│   │             │ • IOC blocklist hit │   │  Structured output: │  │ • Threat intel API  │    │  │
│   │             │ • Known CVE match   │   │  {                  │  │ • IP/domain lookup  │    │  │
│   │             │ • Allowlist check   │   │   verdict,          │  │ • WHOIS / BGP       │    │  │
│   │             │ • Dedup check       │   │   confidence,       │  │ • Query log store   │    │  │
│   │             │ • Severity rules    │   │   reasoning,        │  │ • Run detection code│    │  │
│   │             │                     │   │   evidence[],       │  │ • SOAR actions      │    │  │
│   │             │ Run first — free,   │   │   next_action,      │  │ • Ticket creation   │    │  │
│   │             │ fast, explainable   │   │   human_needed      │  │                     │    │  │
│   │             └─────────────────────┘   │  }                  │  │ ⚠ RBAC enforced    │    │  │
│   │                                       └─────────────────────┘  │   per tool per     │    │  │
│   │                                                                 │   tenant           │    │  │
│   │                                                                 └─────────────────────┘    │  │
│   │                                                                                              │  │
│   │   Step 5: Post-Inference Processing                                                          │  │
│   │   • Validate structured output schema                                                        │  │
│   │   • Confidence calibration (per-tenant baseline)                                             │  │
│   │   • Audit log every decision + evidence chain (compliance)                                  │  │
│   │   • Token cost accounting per tenant                                                         │  │
│   └─────────────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                    ┌─────────────────────────┼──────────────────────────┐
                    │                         │                          │
                    ▼                         ▼                          ▼
┌───────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────────────────┐
│   LAYER 4A                │  │   LAYER 4B               │  │   LAYER 4C                           │
│   RAG / RETRIEVAL         │  │   PROMPT ENGINEERING     │  │   MEMORY & STATE STORE               │
│                           │  │                          │  │                                      │
│  Per-tenant vector store  │  │  Composable modules:     │  │  Short-term (Redis):                 │
│  ┌─────────────────────┐  │  │  ┌────────────────────┐  │  │  • Current alert context             │
│  │ Query embedding     │  │  │  │ Base System Prompt │  │  │  • Tool call history                 │
│  └──────────┬──────────┘  │  │  └────────────────────┘  │  │  • Intermediate reasoning steps      │
│             │             │  │  ┌────────────────────┐  │  │                                      │
│             ▼             │  │  │ Role Module        │  │  │  Long-term (Postgres):               │
│  ┌─────────────────────┐  │  │  └────────────────────┘  │  │  • Entity history (user/IP/host)     │
│  │ Hybrid search:      │  │  │  ┌────────────────────┐  │  │  • Past verdicts + outcomes          │
│  │ Vector + BM25       │  │  │  │ Tenant Context     │  │  │  • Analyst feedback labels           │
│  └──────────┬──────────┘  │  │  │ Module             │  │  │  • Override history                  │
│             │             │  │  └────────────────────┘  │  │                                      │
│             ▼             │  │  ┌────────────────────┐  │  │  Threat Graph (Neo4j):               │
│  ┌─────────────────────┐  │  │  │ Task Module        │  │  │  • Entity relationships              │
│  │ Cross-encoder       │  │  │  └────────────────────┘  │  │  • Attack path mapping               │
│  │ re-ranking          │  │  │  ┌────────────────────┐  │  │  • IOC clustering                    │
│  └──────────┬──────────┘  │  │  │ Output Schema      │  │  │                                      │
│             │             │  │  │ Module             │  │  │  ⚠ Tenant data never                 │
│             ▼             │  │  └────────────────────┘  │  │    crosses boundaries                │
│  ┌─────────────────────┐  │  │                          │  └──────────────────────────────────────┘
│  │ Token budget mgmt   │  │  │  Tested independently    │
│  │ (stay < 200K limit) │  │  │  Version controlled      │
│  └─────────────────────┘  │  │  A/B tested per tenant   │
│                           │  └──────────────────────────┘
│  Knowledge sources        │
│  (per tenant):            │
│  • Past alerts + verdicts │
│  • SOC playbooks          │
│  • Detection rules        │
│  • Threat intel docs      │
│  • Incident reports       │
└───────────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              LAYER 5 — OUTPUT & DECISION LAYER                                      │
│                                                                                                     │
│   Confidence >= 0.92          Confidence 0.70–0.92         Confidence < 0.70                       │
│          │                            │                            │                               │
│          ▼                            ▼                            ▼                               │
│  ┌───────────────────┐    ┌───────────────────────┐    ┌───────────────────────┐                  │
│  │  FULLY AUTOMATED  │    │   ANALYST ASSIST      │    │   HUMAN REQUIRED      │                  │
│  │                   │    │                       │    │                       │                  │
│  │ • Auto-close      │    │ • Pre-filled verdict  │    │ • Escalate to senior  │                  │
│  │ • Auto-contain    │    │ • Evidence summary    │    │ • Full context packet │                  │
│  │   (block IP/user) │    │ • Suggested actions   │    │ • SLA breach alert    │                  │
│  │ • Auto-ticket     │    │ • 1-click confirm or  │    │                       │                  │
│  │ • Notify via      │    │   override            │    │                       │                  │
│  │   PagerDuty/Slack │    │                       │    │                       │                  │
│  └───────────────────┘    └───────────────────────┘    └───────────────────────┘                  │
│                                       │                                                            │
│                            Analyst Decision captured:                                              │
│                            Confirm / Override (with reason) / Escalate                            │
│                            ↓ every decision is a training signal                                   │
└──────────────────────────────────────────────┬──────────────────────────────────────────────────── ┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                    LAYER 6 — DETECTION-AS-CODE GENERATION PIPELINE                                  │
│                                                                                                     │
│   "I see a new attack pattern — generate a detection rule for it"                                   │
│                                                                                                     │
│   Analyst observation                                                                               │
│          │                                                                                          │
│          ▼                                                                                          │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │  Code Generation Agent                                                                    │     │
│   │                                                                                          │     │
│   │  1. Understand attack pattern (natural language or alert context)                        │     │
│   │  2. Generate Panther Python detection rule                                               │     │
│   │  3. Auto-test against last 90 days of historical logs                                   │     │
│   │  4. Report: X true positives, Y false positives, estimated noise level                  │     │
│   │  5. Analyst approves → rule deployed to production                                      │     │
│   │  6. Rule monitored for drift — auto-retired if FP rate > threshold                      │     │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                               │
                                               ▼
╔═════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                    LAYER 7 — THE MOAT: FEEDBACK FLYWHEEL + INTELLIGENCE NETWORK                    ║
║                                                                                                     ║
║   This is what separates a product from a billion dollar company.                                   ║
║                                                                                                     ║
║   ┌────────────────────────────────────────────────────────────────────────────────────────────┐   ║
║   │                           FEEDBACK FLYWHEEL                                                │   ║
║   │                                                                                            │   ║
║   │    More customers                                                                          │   ║
║   │         │                                                                                  │   ║
║   │         ▼                                                                                  │   ║
║   │    More analyst decisions (labeled data)                                                   │   ║
║   │         │                                                                                  │   ║
║   │         ▼                                                                                  │   ║
║   │    Fine-tuned model (better accuracy per customer vertical)                                │   ║
║   │         │                                                                                  │   ║
║   │         ▼                                                                                  │   ║
║   │    More automation (lower analyst override rate)                                           │   ║
║   │         │                                                                                  │   ║
║   │         ▼                                                                                  │   ║
║   │    Lower cost per alert → better margins → lower price → more customers  ──────────────┐  │   ║
║   │                                                                          (loops back)   │  │   ║
║   └────────────────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                                     ║
║   ┌────────────────────────────────────────────────────────────────────────────────────────────┐   ║
║   │                       CROSS-TENANT THREAT INTELLIGENCE NETWORK                             │   ║
║   │                                                                                            │   ║
║   │   Customer A detects new malware IOC                                                       │   ║
║   │          │                                                                                 │   ║
║   │          ▼  (anonymized, privacy-preserving)                                               │   ║
║   │   Threat Graph updated                                                                     │   ║
║   │          │                                                                                 │   ║
║   │          ▼                                                                                 │   ║
║   │   All other customers protected within minutes                                             │   ║
║   │                                                                                            │   ║
║   │   After 500 enterprise customers: proprietary threat graph that no open-source             │   ║
║   │   model or new entrant can replicate. This IS the moat.                                    │   ║
║   └────────────────────────────────────────────────────────────────────────────────────────────┘   ║
╚═════════════════════════════════════════════════════════════════════════════════════════════════════╝
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                         LAYER 8 — PRODUCTION EVAL & RELIABILITY                                     │
│                                                                                                     │
│   Offline Evals                Online Metrics              Reliability                              │
│   ┌───────────────────┐        ┌───────────────────┐       ┌───────────────────────────────────┐   │
│   │ Golden datasets   │        │ Override rate      │       │ Circuit breakers (LLM API down)   │   │
│   │ per tenant        │        │ per tenant        │       │ Fallback to deterministic rules    │   │
│   │                   │        │                   │       │ 99.99% uptime SLA                 │   │
│   │ Regression suite  │        │ Classification    │       │ Multi-region active-active         │   │
│   │ on every deploy   │        │ distribution      │       │ Zero data loss (WAL + replication) │   │
│   │                   │        │ drift alert       │       └───────────────────────────────────┘   │
│   │ Prompt drift      │        │                   │                                               │
│   │ detection         │        │ Latency P50/P99   │       Compliance                             │
│   │                   │        │ per severity tier │       ┌───────────────────────────────────┐   │
│   │ A/B prompt tests  │        │                   │       │ Full audit trail (every decision)  │   │
│   │ per tenant        │        │ Token cost /      │       │ Explainable verdicts               │   │
│   │                   │        │ alert (margin     │       │ SOC 2 Type II                      │   │
│   │ Fine-tune eval    │        │ tracking)         │       │ FedRAMP (gov customers)            │   │
│   │ before rollout    │        │                   │       │ GDPR / data residency              │   │
│   └───────────────────┘        └───────────────────┘       └───────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                         SECURITY BOUNDARIES — DEFENSE IN DEPTH

   [Ingestion]       [Sanitization]    [Tool Execution]   [LLM Boundary]      [Output]
       │                   │                 │                  │                 │
   Kafka partitioned   Escape/structure  RBAC per tool     Input validation  Human-in-loop
   per tenant          attacker content  per tenant        Output schema     for low conf.
   No cross-tenant     before LLM        No arbitrary      Confidence        Full audit log
   data access         touch             code exec         calibration       every decision


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                              MCP (Model Context Protocol) — Tool Layer

   All external tools exposed to the agent via standardized MCP interface (per-tenant scoped):

   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │  Threat Intel│  │  SIEM Query  │  │  IP/Domain   │  │  Detection   │  │  SOAR /      │
   │  (VirusTotal │  │  Tool        │  │  Lookup      │  │  Code Runner │  │  Ticketing   │
   │   Shodan...) │  │              │  │  (WHOIS/BGP) │  │              │  │  (Jira/SN)   │
   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
          │                 │                 │                  │                 │
          └─────────────────┴─────────────────┴──────────────────┴─────────────────┘
                                              │
                              MCP Server (tenant-scoped, RBAC enforced)
                                              │
                                     Agent Orchestrator


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                                  LAYERS AT A GLANCE

   Layer 1  →  Real-Time Streaming Ingestion       (Kafka, normalization, enrichment, sanitization)
   Layer 2  →  Alert Routing & Prioritization      (SLA tiers, dedup, correlation, fallback paths)
   Layer 3  →  Agentic Core                        (orchestrator, deterministic + LLM + tools)
   Layer 4  →  RAG / Prompts / Memory              (per-tenant retrieval, composable prompts, graph)
   Layer 5  →  Output & Decision Layer             (confidence routing, human-in-loop, audit)
   Layer 6  →  Detection-as-Code Generation        (auto-generate, test, deploy, retire rules)
   Layer 7  →  Feedback Flywheel + Threat Network  (THE MOAT — compounds with every customer)
   Layer 8  →  Eval, Reliability & Compliance      (99.99% SLA, SOC2, FedRAMP, full audit trail)
```

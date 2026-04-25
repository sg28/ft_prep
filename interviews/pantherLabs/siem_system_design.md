# AI-First Enterprise SIEM — World Class System Design
## Designed for 10,000 enterprise customers | 1T events/day | Billion Dollar Company

---

## North Star Metrics (drives every design decision)

```
Mean Time to Triage:     15 min → 30 seconds  (AI-assisted) → < 5 sec (automated)
False Positive Rate:     95% → < 5% reach analyst
Mean Time to Detect:     197 days → < 5 minutes
Automation Rate:         0% → 80% alerts auto-resolved
Analyst Override Rate:   N/A → < 5% (AI right 95% of the time)
```

---

## The Full System

```
╔══════════════════════════════════════════════════════════════════════════════════════════════╗
║                    AI-FIRST ENTERPRISE SIEM — COMPLETE ARCHITECTURE                          ║
╚══════════════════════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 0 — MULTI-TENANT CONTROL PLANE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                         │
│  Tenant A          Tenant B          Tenant C          ...10,000 Tenants               │
│  ┌───────────┐     ┌───────────┐     ┌───────────┐                                     │
│  │ Isolated  │     │ Isolated  │     │ Isolated  │     Hard guarantees:                │
│  │ pipeline  │     │ pipeline  │     │ pipeline  │     • Data never crosses tenants    │
│  │ Isolated  │     │ Isolated  │     │ Isolated  │     • Per-tenant cost accounting    │
│  │ RAG store │     │ RAG store │     │ RAG store │     • Per-tenant SLA tracking       │
│  │ Isolated  │     │ Isolated  │     │ Isolated  │     • Per-tenant model tuning       │
│  │ models    │     │ models    │     │ models    │     • RBAC per tenant per user      │
│  └───────────┘     └───────────┘     └───────────┘                                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 1 — DATA COLLECTION & INGESTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  DATA SOURCES (everything that generates logs):
  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
  │  Cloud   │ │Endpoints │ │ Network  │ │ Identity │ │  SaaS    │ │ Custom   │
  │ AWS/GCP/ │ │CrowdStrike│ │Firewalls │ │Okta / AD │ │Salesforce│ │ Apps via │
  │  Azure   │ │Sentinel  │ │Zeek/Snort│ │  Azure AD│ │ Workday  │ │ webhook  │
  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
       │            │            │             │            │            │
       └────────────┴────────────┴─────────────┴────────────┴────────────┘
                                          │
                                          ▼
  ┌───────────────────────────────────────────────────────────────────────────────────┐
  │                         COLLECTION TIER                                            │
  │                                                                                   │
  │  Agent-based          Agentless            API Pull           Webhook Push        │
  │  (installed on        (log forwarding       (poll external     (sources push      │
  │   endpoint)            via syslog/S3)        APIs on schedule)  to our endpoint)  │
  │                                                                                   │
  │  Backpressure handling — if downstream is slow, buffer here, never drop          │
  │  At-least-once delivery guarantee                                                 │
  └───────────────────────────────┬───────────────────────────────────────────────────┘
                                  │
                                  ▼
  ┌───────────────────────────────────────────────────────────────────────────────────┐
  │                    KAFKA — STREAMING BACKBONE                                      │
  │                                                                                   │
  │  Partitioned per tenant — no cross-tenant data on same partition                 │
  │  Retention: 7 days (replay capability)                                           │
  │  Throughput: 1T events/day = ~11M events/second peak                             │
  │  Consumer groups: normalization, enrichment, archive — all consume independently │
  └───────────────────────────────┬───────────────────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
  ┌───────────────┐     ┌──────────────────┐     ┌───────────────────┐
  │ NORMALIZATION │     │   ENRICHMENT      │     │  ARCHIVE WRITER   │
  │               │     │                  │     │                   │
  │ Raw → OCSF    │     │ + GeoIP          │     │ Raw logs →        │
  │ standard      │     │ + Threat Intel   │     │ S3/GCS cold store │
  │ schema        │     │ + Identity ctx   │     │                   │
  │               │     │ + Asset context  │     │ Compliance:       │
  │ Per-source    │     │ + UEBA scores    │     │ 7 year retention  │
  │ mappers       │     │                  │     │ immutable         │
  │ versioned     │     │ Parallel fanout  │     │ tamper-evident    │
  │               │     │ Redis cache      │     │                   │
  │ ⚠ Sanitize    │     │ < 500ms SLA      │     │ Queryable via     │
  │ attacker      │     │                  │     │ Athena/BigQuery   │
  │ controlled    │     │                  │     │                   │
  │ content HERE  │     │                  │     │                   │
  └───────┬───────┘     └────────┬─────────┘     └───────────────────┘
          │                      │
          └──────────────────────┘
                       │
                       ▼
  ┌───────────────────────────────────────────────────────────────────────────────────┐
  │                         HOT LOG STORE                                              │
  │                                                                                   │
  │  Last 90 days of enriched, normalized events                                     │
  │  Optimized for fast query (ClickHouse / Apache Druid)                            │
  │  Column-oriented — fast aggregations, time-range queries                         │
  │  Per-tenant partitioned — queries never touch other tenant data                  │
  │  Powers: agent tool calls, analyst investigation, detection rule testing          │
  └───────────────────────────────────────────────────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 2 — DETECTION ENGINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Enriched event stream (from Kafka)
          │
          ▼
  ┌───────────────────────────────────────────────────────────────────────────────────┐
  │                         DETECTION RULE ENGINE                                      │
  │                                                                                   │
  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                  │
  │  │  RULE-BASED     │  │  THRESHOLD &    │  │  ML ANOMALY     │                  │
  │  │  DETECTION      │  │  CORRELATION    │  │  DETECTION      │                  │
  │  │                 │  │                 │  │                 │                  │
  │  │ Python rules    │  │ Sliding window  │  │ UEBA models     │                  │
  │  │ (Panther DSL)   │  │ counters        │  │ per user/entity │                  │
  │  │                 │  │                 │  │                 │                  │
  │  │ Sigma rule      │  │ Cross-event     │  │ Baseline:       │                  │
  │  │ translation     │  │ correlation     │  │ login time,     │                  │
  │  │                 │  │                 │  │ location, vol   │                  │
  │  │ MITRE ATT&CK    │  │ Alert chains:   │  │                 │                  │
  │  │ mapped          │  │ recon→exploit   │  │ Flags: 2+ std   │                  │
  │  │                 │  │ →exfil          │  │ devs from norm  │                  │
  │  │ Git versioned   │  │                 │  │                 │                  │
  │  │ CI/CD tested    │  │                 │  │                 │                  │
  │  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘                  │
  │           └───────────────────┬┘                    │                           │
  │                               └────────────────────┘                            │
  │                                        │                                         │
  │                                        ▼                                         │
  │                          ┌─────────────────────────┐                            │
  │                          │   ALERT DEDUPLICATION    │                            │
  │                          │   & CORRELATION          │                            │
  │                          │                         │                            │
  │                          │ Dedup key per rule       │                            │
  │                          │ Chain related alerts     │                            │
  │                          │ into single incident     │                            │
  │                          └─────────────┬───────────┘                            │
  └────────────────────────────────────────┼────────────────────────────────────────┘
                                           │
                       1T events/day → ~1,000 alerts/day per tenant


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 3 — ALERT ROUTING & PRIORITIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                                           │
                                           ▼
  ┌───────────────────────────────────────────────────────────────────────────────────┐
  │                              ALERT ROUTER                                          │
  │                                                                                   │
  │   P0 — Critical  ──────────────────────────────▶ Synchronous agent  < 30s SLA   │
  │   P1 — High      ──────────────────────────────▶ Priority queue     < 5min SLA  │
  │   P2 — Medium    ──────────────────────────────▶ Standard queue     < 30min SLA │
  │   P3 — Low       ──────────────────────────────▶ Batch queue        < 4hr SLA   │
  │                                                                                   │
  │   ┌──────────────────────────────────────────────────────────────────────────┐   │
  │   │  FALLBACK CIRCUIT BREAKER                                                │   │
  │   │  LLM API down? → deterministic rules handle P0/P1 automatically         │   │
  │   │  Kafka lag > threshold? → shed P3 load, protect P0/P1                   │   │
  │   └──────────────────────────────────────────────────────────────────────────┘   │
  └───────────────────────────────────────────────────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 4 — AI TRIAGE AGENT (THE CORE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Alert (structured, enriched, prioritized)
          │
          ▼
  ┌───────────────────────────────────────────────────────────────────────────────────┐
  │                           AGENT ORCHESTRATOR                                       │
  │                                                                                   │
  │  ┌─────────────────────────────────────────────────────────────────────────────┐ │
  │  │  STEP 1: CONTEXT PRE-LOADING (parallel, < 200ms)                            │ │
  │  │                                                                             │ │
  │  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │ │
  │  │  │ Alert +      │ │ Entity       │ │ RAG          │ │ Tenant       │      │ │
  │  │  │ Enrichment   │ │ History      │ │              │ │ Config       │      │ │
  │  │  │              │ │ (Postgres)   │ │ • Similar    │ │ (Redis)      │      │ │
  │  │  │ Already done │ │              │ │   alerts     │ │              │      │ │
  │  │  │ in Layer 1   │ │ • Past alerts│ │ • Playbooks  │ │ • Thresholds │      │ │
  │  │  │              │ │ • Past       │ │ • Threat     │ │ • Trusted IPs│      │ │
  │  │  │              │ │   verdicts   │ │   intel      │ │ • VIP users  │      │ │
  │  │  │              │ │ • Risk score │ │ • Detections │ │ • Auto-      │      │ │
  │  │  │              │ │              │ │              │ │   containment│      │ │
  │  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘      │ │
  │  └─────────────────────────────────────────────────────────────────────────────┘ │
  │                                        │                                          │
  │                                        ▼                                          │
  │  ┌─────────────────────────────────────────────────────────────────────────────┐ │
  │  │  STEP 2: PLANNING                                                           │ │
  │  │                                                                             │ │
  │  │  Can deterministic logic resolve?                                           │ │
  │  │  ├── Known bad IOC          → AUTO BLOCK     (no LLM)  ─────────────────┐  │ │
  │  │  ├── Trusted IP/user        → AUTO CLOSE     (no LLM)  ─────────────────┤  │ │
  │  │  ├── Exploit match on asset → AUTO ESCALATE  (no LLM)  ─────────────────┤  │ │
  │  │  └── Ambiguous              → plan tools + LLM          ──────────────┐  │  │ │
  │  │                                                          60–70% end ─┘  │  │ │
  │  │                                                          here            │  │ │
  │  └────────────────────────────────────────────────────────────┬────────────┘ │
  │                                                               │              │
  │                                        ▼                      │              │
  │  ┌─────────────────────────────────────────────────────────────────────────┐ │  │
  │  │  STEP 3: PARALLEL TOOL CALLING (via MCP)                                │ │  │
  │  │                                                                         │ │  │
  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │ │  │
  │  │  │ Threat   │ │ Query    │ │ IP/Domain│ │ CVE      │ │ HR/IdP   │    │ │  │
  │  │  │ Intel    │ │ Hot Log  │ │ Lookup   │ │ Check    │ │ Context  │    │ │  │
  │  │  │ API      │ │ Store    │ │ WHOIS/   │ │          │ │ Travel / │    │ │  │
  │  │  │          │ │          │ │ BGP      │ │          │ │ Leave    │    │ │  │
  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │ │  │
  │  │  All called simultaneously — latency = slowest single call            │ │  │
  │  └─────────────────────────────────────────────────────────────────────────┘ │  │
  │                                        │                                      │  │
  │                                        ▼                                      │  │
  │  ┌─────────────────────────────────────────────────────────────────────────┐ │  │
  │  │  STEP 4: LLM REASONING                                                  │ │  │
  │  │                                                                         │ │  │
  │  │  Input: alert + entity history + RAG results + tool results             │ │  │
  │  │  All structured typed JSON — never raw strings                         │ │  │
  │  │                                                                         │ │  │
  │  │  Output (strict schema enforced):                                       │ │  │
  │  │  {                                                                      │ │  │
  │  │    verdict: MALICIOUS | BENIGN | NEEDS_INVESTIGATION                   │ │  │
  │  │    confidence: 0.0–1.0                                                 │ │  │
  │  │    severity: P0 | P1 | P2 | P3                                         │ │  │
  │  │    reasoning: "step by step"                                           │ │  │
  │  │    evidence: ["fact1", "fact2"]   ← must cite prompt data              │ │  │
  │  │    recommended_action: "string"                                        │ │  │
  │  │    human_needed: true | false                                          │ │  │
  │  │  }                                                                     │ │  │
  │  │                                                                         │ │  │
  │  │  Only 20–30% of alerts reach here                                      │ │  │
  │  └─────────────────────────────────────────────────────────────────────────┘ │  │
  │                                        │                                      │  │
  │                                        ▼                                      │  │
  │  ┌─────────────────────────────────────────────────────────────────────────┐ │  │
  │  │  STEP 5: POST-INFERENCE PROCESSING                                      │ │  │
  │  │                                                                         │ │  │
  │  │  • Validate output schema — fail fast if malformed                     │ │  │
  │  │  • Calibrate confidence against tenant baseline                        │ │  │
  │  │  • Write immutable audit log (every decision, every token)             │ │  │
  │  │  • Token cost accounting per tenant                                    │ │  │
  │  └─────────────────────────────────────────────────────────────────────────┘ │  │
  │                                        │                  ◄────────────────────┘  │
  └────────────────────────────────────────┼────────────────────────────────────────  ┘
                                           │


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 5 — OUTPUT & HUMAN INTERFACE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                                           │
              ┌────────────────────────────┼────────────────────────────┐
              │                            │                            │
              ▼                            ▼                            ▼
  Confidence >= 0.92              Confidence 0.70–0.92          Confidence < 0.70
  ┌─────────────────────┐        ┌─────────────────────┐        ┌─────────────────────┐
  │   AUTO-ACTION        │        │   ANALYST ASSIST    │        │   HUMAN REQUIRED    │
  │                     │        │                     │        │                     │
  │ • Block IP/user     │        │ • Pre-filled verdict│        │ • Senior analyst    │
  │ • Isolate host      │        │ • Evidence summary  │        │ • Full context pack │
  │ • Revoke session    │        │ • Suggested action  │        │ • SLA breach alert  │
  │ • Create P0 ticket  │        │ • 1-click confirm   │        │ • PagerDuty page    │
  │ • Notify via Slack/ │        │   or override       │        │                     │
  │   PagerDuty         │        │                     │        │                     │
  └─────────────────────┘        └──────────┬──────────┘        └─────────────────────┘
                                            │
                                   Analyst decision:
                                   Confirm / Override / Escalate
                                   + optional note
                                            │
                                            ▼
                              ┌─────────────────────────┐
                              │  Every decision is a    │
                              │  TRAINING SIGNAL        │
                              │  → feeds Layer 7        │
                              └─────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 6 — DETECTION-AS-CODE PIPELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  "I see a new attack pattern — generate a detection for it"

  Analyst describes pattern (natural language)
          │
          ▼
  ┌───────────────────────────────────────────────────────────────────────────────────┐
  │                      CODE GENERATION AGENT                                         │
  │                                                                                   │
  │  1. Understand attack pattern from description or alert context                  │
  │  2. Generate Python detection rule (Panther DSL)                                 │
  │  3. Auto-backtest against last 90 days in hot log store                         │
  │     → report: X true positives, Y false positives, noise estimate               │
  │  4. Analyst reviews + approves                                                   │
  │  5. Rule deployed via CI/CD to production                                        │
  │  6. Rule monitored continuously                                                  │
  │     → auto-retire if FP rate > threshold                                        │
  │     → auto-alert if rule stops firing (may indicate attacker adaptation)        │
  └───────────────────────────────────────────────────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 7 — THE MOAT: FEEDBACK FLYWHEEL + THREAT INTELLIGENCE NETWORK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ┌───────────────────────────────────────────────────────────────────────────────────┐
  │                          FEEDBACK FLYWHEEL                                         │
  │                                                                                   │
  │   More customers                                                                  │
  │        │                                                                          │
  │        ▼                                                                          │
  │   More analyst decisions (labeled training data)                                 │
  │        │                                                                          │
  │        ▼                                                                          │
  │   ┌────────────────────────────────────────────────────────────────┐             │
  │   │  THREE LEARNING LOOPS                                          │             │
  │   │                                                                │             │
  │   │  Loop 1: RAG index updated                                     │             │
  │   │  Every resolved alert → embedded → added to vector store      │             │
  │   │  → future similar alerts have better context                  │             │
  │   │  → immediate effect, no retraining needed                     │             │
  │   │                                                                │             │
  │   │  Loop 2: Classical ML retrained                               │             │
  │   │  Analyst verdicts → UEBA model improves                       │             │
  │   │  → better risk scores → fewer alerts reach LLM                │             │
  │   │  → runs nightly                                               │             │
  │   │                                                                │             │
  │   │  Loop 3: LLM fine-tuning                                      │             │
  │   │  High-confidence analyst verdicts → fine-tune dataset         │             │
  │   │  → LLM learns tenant-specific patterns                        │             │
  │   │  → runs weekly per tenant                                     │             │
  │   └────────────────────────────────────────────────────────────────┘             │
  │        │                                                                          │
  │        ▼                                                                          │
  │   Better model → more automation → lower cost per alert                         │
  │        │                                                                          │
  │        ▼                                                                          │
  │   Lower price → more customers ──────────────────────────────────(loop back)    │
  └───────────────────────────────────────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────────────────────────────────────────┐
  │                    CROSS-TENANT THREAT INTELLIGENCE NETWORK                        │
  │                                                                                   │
  │  Customer A detects new malware IOC                                              │
  │       │  (anonymized, privacy-preserving, opt-in)                               │
  │       ▼                                                                          │
  │  Proprietary Threat Graph updated (Neo4j)                                        │
  │       │                                                                          │
  │       ▼                                                                          │
  │  All 10,000 customers protected within minutes                                  │
  │                                                                                  │
  │  After 2 years: threat graph with signal from 10,000 enterprise SOCs            │
  │  No open-source feed, no competitor can replicate this                          │
  │  → This IS the billion dollar moat                                              │
  └───────────────────────────────────────────────────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 8 — CISO DASHBOARD & COMPLIANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ┌───────────────────────────────────────────────────────────────────────────────────┐
  │  REAL-TIME METRICS DASHBOARD                                                       │
  │                                                                                   │
  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐               │
  │  │ Automation Rate  │  │ Mean Time to     │  │ Analyst Override │               │
  │  │                  │  │ Triage           │  │ Rate             │               │
  │  │      82%         │  │                  │  │                  │               │
  │  │  ████████████░░  │  │    4.2 sec       │  │      4.1%        │               │
  │  │  Target: 80%  ✓  │  │  Target: <5s  ✓  │  │  Target: <5%  ✓  │               │
  │  └──────────────────┘  └──────────────────┘  └──────────────────┘               │
  │                                                                                   │
  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐               │
  │  │ False Positive   │  │ MTTD             │  │ Cost per Alert   │               │
  │  │ Rate             │  │                  │  │                  │               │
  │  │      3.8%        │  │   3.1 minutes    │  │    $0.003        │               │
  │  │  Target: <5%  ✓  │  │  Target: <5m  ✓  │  │  (vs $15 manual) │               │
  │  └──────────────────┘  └──────────────────┘  └──────────────────┘               │
  └───────────────────────────────────────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────────────────────────────────────────┐
  │  COMPLIANCE & AUDIT                                                                │
  │                                                                                   │
  │  • Full immutable audit trail — every agent decision, every token, every action  │
  │  • Explainable verdicts — every alert has a human-readable reasoning chain       │
  │  • SOC 2 Type II certified                                                       │
  │  • FedRAMP authorized (government customers)                                     │
  │  • GDPR compliant — data residency per region                                   │
  │  • One-click compliance report generation (ISO 27001, NIST, PCI-DSS)            │
  └───────────────────────────────────────────────────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 9 — PRODUCTION RELIABILITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ┌───────────────────────────────────────────────────────────────────────────────────┐
  │  Reliability                    Evals                    Observability            │
  │  ┌───────────────────┐          ┌───────────────────┐    ┌───────────────────┐   │
  │  │ 99.99% uptime SLA │          │ Offline:          │    │ Per-alert latency │   │
  │  │ Multi-region      │          │ Golden datasets   │    │ Token cost/tenant │   │
  │  │ active-active     │          │ Regression suite  │    │ Override rate     │   │
  │  │                   │          │ Prompt drift      │    │ Queue depth       │   │
  │  │ Circuit breakers  │          │ detection         │    │ Error rate        │   │
  │  │ LLM API down →    │          │                   │    │                   │   │
  │  │ deterministic     │          │ Online:           │    │ Alerts on:        │   │
  │  │ fallback          │          │ Classification    │    │ Drift > threshold │   │
  │  │                   │          │ distribution      │    │ Latency P99 spike │   │
  │  │ Zero data loss    │          │ drift detection   │    │ FP rate increase  │   │
  │  │ WAL + replication │          │ A/B prompt tests  │    │                   │   │
  │  └───────────────────┘          └───────────────────┘    └───────────────────┘   │
  └───────────────────────────────────────────────────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATA STORES — WHAT LIVES WHERE AND WHY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ┌──────────────┬───────────────────────────┬────────────────────────────────────────┐
  │ Store        │ What lives here           │ Why this store                         │
  ├──────────────┼───────────────────────────┼────────────────────────────────────────┤
  │ Kafka        │ Raw + enriched event      │ High throughput streaming backbone     │
  │              │ streams                   │ Durable, replayable, partitioned       │
  ├──────────────┼───────────────────────────┼────────────────────────────────────────┤
  │ ClickHouse   │ Hot logs — last 90 days   │ Column store, fast aggregations        │
  │              │ normalized events         │ Sub-second queries on billions of rows │
  ├──────────────┼───────────────────────────┼────────────────────────────────────────┤
  │ S3 / GCS     │ Cold archive — all logs   │ Cheap, infinite scale, compliance     │
  │              │ 7 year retention          │ Queryable via Athena/BigQuery          │
  ├──────────────┼───────────────────────────┼────────────────────────────────────────┤
  │ Postgres     │ Entity history, verdicts  │ Strong consistency, relational joins   │
  │              │ tenant config             │ ACID transactions                      │
  ├──────────────┼───────────────────────────┼────────────────────────────────────────┤
  │ Redis        │ Hot cache — enrichment    │ Sub-millisecond reads                 │
  │              │ tenant config, sessions   │ TTL per data type                     │
  ├──────────────┼───────────────────────────┼────────────────────────────────────────┤
  │ pgvector /   │ RAG vector store          │ Semantic similarity search            │
  │ Pinecone     │ per-tenant isolated       │ ANN index for fast retrieval          │
  ├──────────────┼───────────────────────────┼────────────────────────────────────────┤
  │ Neo4j        │ Threat graph              │ Graph traversal for attack paths      │
  │              │ Entity relationships      │ Entity relationship queries            │
  └──────────────┴───────────────────────────┴────────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECURITY BOUNDARIES — DEFENSE IN DEPTH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [Collection]     [Normalization]   [Tool Execution]  [LLM Boundary]    [Output]
       │                 │                 │                 │               │
  TLS in transit    Sanitize          RBAC per tool     Input validation  Human-in-loop
  mTLS per tenant   attacker          per tenant        Output schema     for low conf.
  No raw log        content           No arbitrary      Confidence        Full audit log
  access to         before LLM        code exec         calibration       every decision
  other tenants     touch             Max 5 tools/call  No raw strings    Immutable trail


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYERS AT A GLANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Layer 0  →  Multi-Tenant Control Plane        Isolation, cost accounting, RBAC
  Layer 1  →  Data Collection & Ingestion       Kafka, normalize, enrich, sanitize, archive
  Layer 2  →  Detection Engine                  Rules + ML anomaly + correlation + dedup
  Layer 3  →  Alert Routing                     SLA tiers, circuit breakers, fallback
  Layer 4  →  AI Triage Agent                   Pre-load → Plan → Tools → LLM → Post-process
  Layer 5  →  Output & Human Interface          Confidence routing, analyst assist, audit
  Layer 6  →  Detection-as-Code Pipeline        Generate, backtest, deploy, monitor rules
  Layer 7  →  Feedback Flywheel + Threat Graph  THE MOAT — compounds with every customer
  Layer 8  →  CISO Dashboard & Compliance       Metrics, SOC2, FedRAMP, audit trail
  Layer 9  →  Production Reliability            99.99% SLA, evals, observability


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DISTRIBUTED SYSTEMS DEEP DIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  The hard problems that don't show up in the architecture diagram.

  ─────────────────────────────────────────────────────────────────────────────────────────
  1. EXACTLY-ONCE vs AT-LEAST-ONCE — AND THE DEDUP PROBLEM
  ─────────────────────────────────────────────────────────────────────────────────────────

  We guarantee at-least-once delivery from Kafka. This means the same event can appear
  twice — network retry, consumer crash mid-commit, rebalance during processing.

  Problem: If normalization processes an event twice, we fire two alerts for one incident.
           At 11M events/sec, dedup state is massive.

  Solution:
  ┌──────────────────────────────────────────────────────────────────────────────────────┐
  │  Idempotency key = SHA256(tenant_id + source + event_id + timestamp)                │
  │                                                                                      │
  │  Normalization workers write to ClickHouse with ON CONFLICT DO NOTHING              │
  │  (ClickHouse: ReplacingMergeTree deduplicates on insert key)                        │
  │                                                                                      │
  │  Alert dedup: Redis SET NX with TTL per (rule_id + entity_id + dedup_window)        │
  │  → Only first writer wins, all duplicates dropped                                   │
  │  → TTL = dedup window (e.g. 5 min for P0, 1 hr for P3)                             │
  │                                                                                      │
  │  Kafka consumer offset committed AFTER successful write — never before              │
  │  → Crash before commit = reprocess (idempotent write handles duplicate)             │
  └──────────────────────────────────────────────────────────────────────────────────────┘

  Trade-off accepted: at-least-once + idempotent writes > exactly-once Kafka transactions
  Reason: Kafka exactly-once (transactions) adds ~30% latency overhead at our throughput.
          Idempotent writes at the store layer are cheaper and sufficient.


  ─────────────────────────────────────────────────────────────────────────────────────────
  2. ORDERING ACROSS PARALLEL CONSUMER GROUPS
  ─────────────────────────────────────────────────────────────────────────────────────────

  Normalization and Enrichment are separate consumer groups on the same Kafka topic.
  They process in parallel — enrichment can finish before normalization for the same event.

  Problem: Detection engine needs BOTH normalized schema AND enrichment context.
           If it reads too early, it gets a half-enriched event.

  Solution:
  ┌──────────────────────────────────────────────────────────────────────────────────────┐
  │  Two-phase write model:                                                              │
  │                                                                                      │
  │  Phase 1: Normalization worker writes to ClickHouse (raw normalized record)         │
  │           Sets Redis key: norm_done:{event_id} = 1, TTL 60s                        │
  │                                                                                      │
  │  Phase 2: Enrichment worker reads normalized record from ClickHouse,                │
  │           merges enrichment fields, writes enriched record back                     │
  │           Sets Redis key: enrich_done:{event_id} = 1, TTL 60s                      │
  │                                                                                      │
  │  Detection engine consumer group: reads from a SECOND Kafka topic                  │
  │  "enriched-events" — only populated after both phases complete                      │
  │                                                                                      │
  │  Enrichment worker is the single writer to "enriched-events" topic                 │
  │  → ordering guarantee restored within tenant partition                              │
  └──────────────────────────────────────────────────────────────────────────────────────┘

  This is the "fan-out then join" pattern. The enriched-events topic is the join point.


  ─────────────────────────────────────────────────────────────────────────────────────────
  3. DISTRIBUTED SLIDING WINDOWS (threshold & correlation detection)
  ─────────────────────────────────────────────────────────────────────────────────────────

  Threshold rules: "5 failed logins for same user in 60 seconds"
  This requires stateful counting across a distributed worker pool.

  Problem: If 3 normalization workers each see some of the 5 login events, no single
           worker reaches the threshold. Distributed state coordination is needed.

  Solution:
  ┌──────────────────────────────────────────────────────────────────────────────────────┐
  │  Redis for sliding window counters:                                                  │
  │                                                                                      │
  │  Key: window:{tenant_id}:{rule_id}:{entity_id}:{window_bucket}                     │
  │  Value: sorted set (event timestamps) — ZRANGEBYSCORE for window membership         │
  │  TTL: window duration + 10% buffer                                                  │
  │                                                                                      │
  │  All detection workers for a tenant hash to the SAME Redis shard                   │
  │  (consistent hashing on tenant_id) — single source of truth per tenant             │
  │                                                                                      │
  │  INCR is atomic in Redis — no race condition on the counter                        │
  │                                                                                      │
  │  On Redis node failure:                                                              │
  │  → Redis Cluster with replica promotion (< 1s failover via Sentinel)               │
  │  → In-flight window state for that shard is lost                                   │
  │  → Acceptable: we may miss a threshold breach during the ~1s failover window       │
  │  → For P0 rules: secondary ClickHouse query as fallback (slower, not real-time)    │
  └──────────────────────────────────────────────────────────────────────────────────────┘

  Trade-off: Redis window state loss on failure < 1s is accepted over the complexity of
  distributed consensus (Flink/Spark Structured Streaming) for this use case.
  For customers requiring zero-miss guarantees: Flink offered as premium tier.


  ─────────────────────────────────────────────────────────────────────────────────────────
  4. CLICKHOUSE WRITE THROUGHPUT — BATCHING STRATEGY
  ─────────────────────────────────────────────────────────────────────────────────────────

  ClickHouse is optimized for bulk inserts. Row-by-row inserts at 11M events/sec would
  overwhelm the merge tree and cause write amplification.

  Problem: Normalization workers process events one-by-one from Kafka.
           Direct insert per event = millions of tiny inserts = ClickHouse thrash.

  Solution:
  ┌──────────────────────────────────────────────────────────────────────────────────────┐
  │  Buffer layer in each normalization worker:                                          │
  │                                                                                      │
  │  • Accumulate events in memory: flush when EITHER condition is met:                 │
  │    - Buffer size >= 50,000 rows   (size threshold)                                  │
  │    - Buffer age  >= 500ms         (time threshold)                                  │
  │                                                                                      │
  │  • 500ms flush interval → hot log store is at most 500ms stale                     │
  │  • Acceptable for detection (rules run on enriched-events Kafka topic anyway)       │
  │                                                                                      │
  │  • ClickHouse async_insert mode as secondary option:                                │
  │    server-side buffering, flush managed by ClickHouse itself                        │
  │                                                                                      │
  │  • ReplicatedMergeTree with 2 replicas:                                             │
  │    write to one, async replication to second                                        │
  │    quorum writes (wait_for_async_insert=1) for P0 tenant data only                 │
  └──────────────────────────────────────────────────────────────────────────────────────┘

  Query freshness trade-off: 500ms lag is fine for investigation queries.
  Detection runs off Kafka (real-time), not ClickHouse — so detection is not affected.


  ─────────────────────────────────────────────────────────────────────────────────────────
  5. MULTI-REGION ACTIVE-ACTIVE — CONFLICT RESOLUTION
  ─────────────────────────────────────────────────────────────────────────────────────────

  Two regions (e.g. us-east-1, us-west-2) both accept writes. A P0 alert fires in both
  regions simultaneously for the same tenant event (due to Kafka replication lag).

  Problem: Two agent workers in two regions produce two verdicts for the same alert.
           Which one wins? Entity history in Postgres could diverge.

  Solution:
  ┌──────────────────────────────────────────────────────────────────────────────────────┐
  │  Tenant pinned to PRIMARY region for Postgres writes:                               │
  │  • Entity history, verdicts, analyst decisions → single-region Postgres (primary)  │
  │  • Read replicas in secondary region for low-latency reads                         │
  │  • This is active-active for ingestion + detection, active-passive for state        │
  │                                                                                      │
  │  Alert ownership via distributed lock (Redis SETNX with 30s TTL):                  │
  │  • First region to acquire lock owns the alert for triage                          │
  │  • Second region sees lock exists → defers, monitors for lock release              │
  │  • Lock released after verdict written to Postgres                                  │
  │                                                                                      │
  │  Kafka: cross-region replication via MirrorMaker2 (async, ~100ms lag)             │
  │  • Ingestion is truly active-active (both regions ingest from local sources)       │
  │  • Events replicated to partner region for DR                                       │
  │                                                                                      │
  │  On primary region failure:                                                          │
  │  • DNS failover to secondary (< 60s)                                               │
  │  • Secondary promotes read replica → new primary                                   │
  │  • RPO: ~100ms (MirrorMaker lag) | RTO: ~60s                                      │
  └──────────────────────────────────────────────────────────────────────────────────────┘

  Honest trade-off: "active-active" is a simplification. Ingestion is truly active-active.
  State (Postgres) is active-passive per tenant. This is the right trade-off — distributed
  consensus across regions for every verdict write is not worth the latency cost.


  ─────────────────────────────────────────────────────────────────────────────────────────
  6. AGENT HORIZONTAL SCALING — STATELESS WORKERS
  ─────────────────────────────────────────────────────────────────────────────────────────

  The AI triage agent is multi-step: context load → plan → tool calls → LLM → post-process.
  This takes 2–30 seconds. Workers must be horizontally scalable without sticky sessions.

  Problem: If the worker dies mid-investigation, the in-flight alert is lost.
           If workers are stateful, you can't scale freely.

  Solution:
  ┌──────────────────────────────────────────────────────────────────────────────────────┐
  │  All worker state externalized to Redis:                                             │
  │                                                                                      │
  │  Redis key: agent_state:{alert_id}                                                  │
  │  Value: {step, tool_results_so_far, partial_reasoning, retry_count}                │
  │  TTL: 5 minutes (max investigation budget)                                           │
  │                                                                                      │
  │  Workers are fully stateless — pull job from queue, load state from Redis,          │
  │  execute next step, write state back, repeat                                         │
  │                                                                                      │
  │  Worker crash recovery:                                                              │
  │  • Job queue (SQS / Kafka) has visibility timeout = 60s                             │
  │  • If worker doesn't ACK within 60s → job requeued                                 │
  │  • New worker picks up job, loads partial state from Redis, resumes from last step  │
  │  • Idempotent tool calls (read-only tools trivially safe; write tools use           │
  │    idempotency keys passed to SOAR/ticketing APIs)                                  │
  │                                                                                      │
  │  Scaling: worker pool auto-scales on queue depth (KEDA + Kubernetes)               │
  │  • P0 queue: dedicated always-on workers (never cold start)                         │
  │  • P3 queue: scale to zero when empty                                               │
  └──────────────────────────────────────────────────────────────────────────────────────┘


  ─────────────────────────────────────────────────────────────────────────────────────────
  7. KAFKA CONSUMER LAG MONITORING & BACKPRESSURE
  ─────────────────────────────────────────────────────────────────────────────────────────

  ┌──────────────────────────────────────────────────────────────────────────────────────┐
  │  Lag monitoring:                                                                     │
  │  • Per consumer group, per partition offset lag tracked via Kafka consumer API      │
  │  • Exported to Prometheus → Grafana alert if lag > 30s worth of events             │
  │                                                                                      │
  │  Backpressure response (tiered):                                                     │
  │  Lag < 10s    → normal operation                                                    │
  │  Lag 10–30s   → scale up normalization workers (KEDA triggers)                     │
  │  Lag 30–60s   → shed P3 (low priority) detection rules temporarily                 │
  │  Lag > 60s    → alert on-call, pause non-critical consumer groups                  │
  │                Protect P0/P1 pipeline at all costs                                  │
  │                                                                                      │
  │  Kafka retention = 7 days → can always replay if a consumer group falls far behind │
  └──────────────────────────────────────────────────────────────────────────────────────┘


  ─────────────────────────────────────────────────────────────────────────────────────────
  8. COLD START — NEW TENANT WITH NO HISTORY
  ─────────────────────────────────────────────────────────────────────────────────────────

  A brand new tenant has: no RAG history, no entity baselines, no fine-tuned model.

  ┌──────────────────────────────────────────────────────────────────────────────────────┐
  │  Day 0 bootstrapping:                                                                │
  │                                                                                      │
  │  RAG store: seeded with:                                                            │
  │  • Panther's curated SOC playbook library (generic, not tenant-specific)           │
  │  • MITRE ATT&CK technique descriptions                                             │
  │  • Public threat intel reports                                                       │
  │                                                                                      │
  │  UEBA baselines: cold start period = first 14 days                                 │
  │  • During cold start: ML anomaly detection disabled                                 │
  │  • Rule-based + threshold detection only (lower FP risk without baseline)          │
  │  • Baseline built from first 14 days of observed behavior                          │
  │                                                                                      │
  │  LLM: base model used (no fine-tuning) with vertical prompt module                 │
  │  • Industry vertical detected from onboarding (finance, healthcare, tech...)       │
  │  • Vertical-specific prompt module loaded (higher risk tolerance calibration)       │
  │                                                                                      │
  │  After 30 days: first fine-tune run, RAG populated with resolved alerts            │
  │  After 90 days: full system operating at designed accuracy targets                 │
  └──────────────────────────────────────────────────────────────────────────────────────┘


  ─────────────────────────────────────────────────────────────────────────────────────────
  9. COST MODEL PER TENANT
  ─────────────────────────────────────────────────────────────────────────────────────────

  ┌────────────────────────────────────┬───────────────────┬────────────────────────────┐
  │ Cost driver                        │ Who pays          │ Control lever              │
  ├────────────────────────────────────┼───────────────────┼────────────────────────────┤
  │ Kafka ingest (per GB)              │ Tenant            │ Data volume pricing tier   │
  │ ClickHouse storage (per TB/month)  │ Tenant            │ Hot window config (30/90d) │
  │ S3 cold archive                    │ Tenant            │ Retention policy setting   │
  │ LLM tokens (per alert routed)      │ Panther           │ Deterministic pre-filter   │
  │   (only 20-30% reach LLM)         │                   │ reduces LLM calls 70%      │
  │ Redis (per tenant state)           │ Panther (shared)  │ TTL tuning per data type   │
  │ Normalization workers (CPU)        │ Panther (shared)  │ Worker pool bin-packing    │
  └────────────────────────────────────┴───────────────────┴────────────────────────────┘

  Pricing model: per-GB ingested + per-alert-resolved (outcome pricing)
  • Aligns incentives: we win when automation rate is high (low cost to us, high value to them)
  • LLM cost = biggest variable → deterministic pre-filter is the margin protection mechanism


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE BILLION DOLLAR FORMULA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Architecture  →  gets you to market
  Reliability   →  gets you enterprise contracts
  Feedback loop →  gets you a moat
  Threat graph  →  makes the moat unassailable
  Compliance    →  unlocks government + finance verticals

  The architecture is 20% of the company.
  The data flywheel is 80%.
```

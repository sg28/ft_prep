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

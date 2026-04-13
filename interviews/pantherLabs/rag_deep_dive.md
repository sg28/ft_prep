# RAG — Retrieval Augmented Generation
## Deep Dive

> Core idea: The LLM knows everything about the world from pre-training.
> RAG gives it knowledge about YOUR specific world — your alerts, your customers, your history.

---

## Where RAG Came From & Why We Need It

Before RAG existed, there were two ways to give an LLM specific knowledge:

### Approach 1: Put Everything in the Prompt
```
PROMPT:
"Here are all 50,000 past alerts from the last 2 years.
 Here are all 200 SOC playbooks.
 Here are all threat intel reports.
 Now analyze this alert..."

Problems:
✗ Context window limit — can't fit 50,000 alerts
✗ Costs thousands of dollars per query
✗ LLM gets confused with too much information
✗ Slow — processing 2 years of data every single time
```

### Approach 2: Fine-tune the LLM on Your Data
```
Train the LLM on your historical alerts
So it "knows" your data in its weights

Problems:
✗ Takes hours/days to retrain
✗ Costs tens of thousands of dollars
✗ New alert added today? Retrain again.
✗ Can't update in real time
✗ Model "forgets" old knowledge as it learns new
```

### The Insight That Created RAG (2020, Facebook AI Research)
> *"What if instead of giving the LLM all the knowledge — we just found the relevant pieces and gave it only those?"*

```
Instead of:
"Here are 50,000 alerts. Now answer."

Do this:
1. Find the 5 most relevant alerts
2. "Here are 5 relevant alerts. Now answer."

Same LLM. Far better results. Fraction of the cost.
```

**RAG = Retrieval Augmented Generation**
- **Retrieval** — find the relevant pieces
- **Augmented** — add them to the prompt
- **Generation** — LLM generates answer with that context

---

## Where RAG Sits in the Full System

```
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                         BILLION DOLLAR SOC PLATFORM                                 ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

 EXTERNAL WORLD                          YOUR INFRASTRUCTURE
 ┌─────────────────────────────┐         ┌──────────────────────────────────────────┐
 │  Cloud Logs                 │         │  SIEM   Endpoints   Identity   Network   │
 └─────────────────────────────┘         └──────────────────────────────────────────┘
              │                                              │
              └──────────────────────┬───────────────────────┘
                                     │
                                     ▼
              ┌──────────────────────────────────────────────────┐
              │            LAYER 1: INGESTION                     │
              │   Kafka Stream → Normalize → Enrich → Sanitize    │
              └──────────────────────────┬───────────────────────┘
                                         │
                                         ▼
              ┌──────────────────────────────────────────────────┐
              │         LAYER 2: DETECTION RULE EVALUATION        │
              │   Python Rules → Sigma → Threshold → Dedup        │
              │                                                   │
              │   10,000,000 events/day → 500 alerts/day          │
              └──────────────────────────┬───────────────────────┘
                                         │
                                         ▼
╔════════════════════════════════════════════════════════════════════════════════════╗
║                         LAYER 3: AGENTIC CORE                                      ║
║                                                                                    ║
║  Alert arrives                                                                     ║
║       │                                                                            ║
║       ▼                                                                            ║
║  ┌─────────────────────────────────────────────────────────────────────────────┐  ║
║  │                      STEP 1: CONTEXT PRE-LOADING                            │  ║
║  │                                                                             │  ║
║  │   Alert          Entity           ┌─────────────────────────────────────┐  │  ║
║  │   Metadata  +    History    +     │           ★ RAG LAYER ★             │  │  ║
║  │   (enriched)     (Postgres/       │                                     │  │  ║
║  │                   Redis)          │  Query → Embed → Search → Rerank   │  │  ║
║  │                              +    │                                     │  │  ║
║  │                                   │  Retrieves:                        │  │  ║
║  │   Tenant                          │  • Similar past alerts              │  │  ║
║  │   Config    +                     │  • SOC playbooks                   │  │  ║
║  │   (Redis)                         │  • Threat intel docs               │  │  ║
║  │                                   │  • Detection rule context          │  │  ║
║  │                                   └─────────────────────────────────────┘  │  ║
║  │                                              │                              │  ║
║  │                        ALL assembled in parallel < 200ms                   │  ║
║  └──────────────────────────────────┬──────────────────────────────────────── ┘  ║
║                                     │                                             ║
║                                     ▼                                             ║
║  ┌──────────────────────────────────────────────────────────────────────────────┐ ║
║  │                         STEP 2: PLANNING                                     │ ║
║  │   Can deterministic logic resolve?                                           │ ║
║  │   YES (60–70%) → auto-resolve, skip LLM entirely                            │ ║
║  │   NO            → plan tool calls + LLM steps                               │ ║
║  └──────────────────────────────────┬───────────────────────────────────────── ┘ ║
║                                     │                                             ║
║                                     ▼                                             ║
║  ┌──────────────────────────────────────────────────────────────────────────────┐ ║
║  │                      STEP 3: TOOL CALLING (via MCP)                          │ ║
║  │   Threat Intel   Query Logs   IP Lookup   CVE Check   SOAR Actions           │ ║
║  │   All called in parallel — results fed back to LLM                          │ ║
║  └──────────────────────────────────┬───────────────────────────────────────── ┘ ║
║                                     │                                             ║
║                                     ▼                                             ║
║  ┌──────────────────────────────────────────────────────────────────────────────┐ ║
║  │                         STEP 4: LLM REASONING                                │ ║
║  │                                                                              │ ║
║  │   Receives:                         Outputs:                                 │ ║
║  │   • Alert (enriched)                {                                        │ ║
║  │   • Entity history          ──────▶   verdict: "MALICIOUS"                  │ ║
║  │   • RAG results (similar             confidence: 0.96,                      │ ║
║  │     alerts + playbooks               reasoning: "...",                      │ ║
║  │     + threat intel)                  evidence: [...],                       │ ║
║  │   • Tool call results                recommended_action: "..."              │ ║
║  │                                    }                                        │ ║
║  │   Only 20–30% of alerts reach here                                         │ ║
║  └──────────────────────────────────┬───────────────────────────────────────── ┘ ║
║                                     │                                             ║
║                                     ▼                                             ║
║  ┌──────────────────────────────────────────────────────────────────────────────┐ ║
║  │               STEP 5: POST INFERENCE + STEP 6: ROUTING                       │ ║
║  │   Validate schema → Calibrate confidence → Audit log → Route by confidence   │ ║
║  └──────────────────────────────────┬───────────────────────────────────────── ┘ ║
╚════════════════════════════════════════════════════════════════════════════════════╝
                                      │
              ┌───────────────────────┼─────────────────────────┐
              │                       │                         │
              ▼                       ▼                         ▼
     Confidence > 0.92        Confidence 0.70–0.92      Confidence < 0.70
     AUTO-ACTION              ANALYST ASSIST            HUMAN REQUIRED
     Block/Close/Ticket       Pre-filled verdict        Escalate + SLA alert


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ RAG INTERNALS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


  WHAT GETS INDEXED (offline, continuously updated):
  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
  │ Past Alerts     │  │ SOC Playbooks   │  │ Threat Intel    │  │ Detection Rules │
  │ + Verdicts      │  │                 │  │ Documents       │  │ Library         │
  │                 │  │                 │  │                 │  │                 │
  │ Highest signal  │  │ Your procedures │  │ World knowledge │  │ Why rules fired │
  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘
           │                   │                    │                    │
           └───────────────────┴────────────────────┴────────────────────┘
                                           │
                                           ▼
                              ┌────────────────────────┐
                              │    TEXT CHUNKING        │
                              │    ~512 tokens/chunk    │
                              │    with overlap         │
                              └────────────┬───────────┘
                                           │
                                           ▼
                              ┌────────────────────────┐
                              │    EMBEDDING MODEL      │
                              │    text → vector        │
                              │    [0.23, -0.87, ...]   │
                              │    captures meaning     │
                              └────────────┬───────────┘
                                           │
                                           ▼
                              ┌────────────────────────┐
                              │    VECTOR STORE         │
                              │    pgvector / Pinecone  │
                              │    per-tenant isolated  │
                              └────────────────────────┘


  WHAT HAPPENS AT QUERY TIME (per alert, < 200ms):

  New Alert
      │
      ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │  RETRIEVAL PIPELINE                                                       │
  │                                                                          │
  │  Alert summary                                                           │
  │       │                                                                  │
  │       ├──── Embedding model ──── Vector search ──┐                      │
  │       │     (semantic)           top K similar    │                      │
  │       │                                           ├── FUSION ── Rerank  │
  │       └──── BM25 keyword ────── Exact matches ───┘             │        │
  │             (exact IOCs)                                        │        │
  │                                                                 ▼        │
  │                                                        Top 5 most        │
  │                                                        relevant docs     │
  │                                                                 │        │
  │                                                        Token budget      │
  │                                                        management        │
  │                                                                 │        │
  │                                                        Inject into       │
  │                                                        LLM prompt        │
  └──────────────────────────────────────────────────────────────────────────┘


  THE COMPOUNDING EFFECT (why this becomes a moat):

  Day 1:    100 alerts indexed    → LLM has thin context → lower accuracy
  Month 1:  3,000 alerts indexed  → LLM has decent context → improving
  Year 1:   50,000 alerts indexed → LLM has rich context → high accuracy
  Year 2:   500K alerts, 500      → Proprietary dataset no
            enterprise customers   competitor can replicate
                                  → THIS IS THE MOAT
```

---

---

## The Problem RAG Solves

```
Without RAG:

LLM prompt: "Analyze this alert for jsmith"

LLM knows:
✓ What Tor exit nodes are
✓ What LockBit ransomware does
✓ What credential stuffing looks like

LLM does NOT know:
✗ That jsmith was flagged 3 months ago
✗ That your last Impossible Travel alert was MALICIOUS
✗ What YOUR SOC playbook says to do
✗ What YOUR tenant considers normal behavior

→ Generic verdict. Low accuracy.


With RAG:

LLM prompt: "Analyze this alert for jsmith"
            + [jsmith's history retrieved from your DB]
            + [last 5 similar alerts retrieved from vector store]
            + [your SOC playbook retrieved from knowledge base]

LLM now knows everything above PLUS your specific context

→ Specific, accurate verdict.
```

RAG bridges the gap between **world knowledge** (pre-training) and **your knowledge** (your data).

---

## How RAG Works — The Simple Version

```
Question / Query
      │
      ▼
Convert to embedding (vector)
      │
      ▼
Search vector store for similar embeddings
      │
      ▼
Retrieve top K most relevant documents
      │
      ▼
Inject retrieved documents into LLM prompt
      │
      ▼
LLM reasons with question + retrieved context
      │
      ▼
Answer grounded in YOUR data
```

---

## Step by Step — The Full Pipeline

### Step 1: Indexing (happens offline, before any query)

Before you can retrieve anything, you need to store it in a way that supports similarity search.

```
YOUR DATA SOURCES:
├── Past alerts + verdicts
├── SOC playbooks
├── Threat intel documents
├── Detection rule library
└── Incident reports


For each document:

"Impossible Travel alert - jsmith - Feb 2026
 Verdict: MALICIOUS. Confirmed account compromise.
 Attacker used Tor exit node, accessed PII database."

         │
         ▼
  TEXT CHUNKING
  Break into meaningful chunks
  (~512 tokens each, with overlap)

         │
         ▼
  EMBEDDING MODEL
  Convert text → vector (list of numbers)
  that captures semantic meaning

  "Impossible Travel, Tor, PII, MALICIOUS"
         │
         ▼
  [0.23, -0.87, 0.45, 0.12, ... 1536 numbers]
  This vector represents the MEANING of the text

         │
         ▼
  VECTOR STORE (pgvector / Pinecone)
  Store vector + original text + metadata
  {
    vector: [0.23, -0.87, 0.45, ...],
    text: "Impossible Travel alert - jsmith...",
    metadata: {
      tenant_id: "acme-corp",
      date: "2026-02-10",
      verdict: "MALICIOUS",
      rule_id: "impossible_travel_v2"
    }
  }
```

This happens for **every document** in your knowledge base. Build the index once, query it millions of times.

---

### Step 2: Retrieval (happens at query time, per alert)

When a new alert arrives:

```
New alert:
"Impossible Travel - bwilliams - Moscow, Tor exit node,
 prod-db-02, 3am, 3 failed MFA"

         │
         ▼
  QUERY EMBEDDING
  Convert alert summary → vector

  [0.21, -0.91, 0.43, 0.09, ... 1536 numbers]

         │
         ▼
  SIMILARITY SEARCH
  Find vectors closest to query vector
  in the vector store

  Cosine similarity:
  ┌────────────────────────────────┬────────────┐
  │ Document                       │ Similarity │
  ├────────────────────────────────┼────────────┤
  │ jsmith Impossible Travel Feb   │   0.94     │ ← very similar
  │ kpatel Impossible Travel Jan   │   0.87     │ ← similar
  │ Large Data Export - Finance    │   0.61     │ ← somewhat similar
  │ Phishing attempt - Marketing   │   0.23     │ ← not similar
  └────────────────────────────────┴────────────┘

         │
         ▼
  RETURN TOP K (k=5 typically)
  The 5 most semantically similar documents
```

---

### Step 3: Augmentation (inject into prompt)

```python
prompt = f"""
Analyze this alert:
<alert_data>
{current_alert}
</alert_data>

Similar past alerts for reference:
<similar_alerts>
{retrieved_documents}
</similar_alerts>

Relevant SOC playbook:
<playbook>
{retrieved_playbook}
</playbook>
"""
```

The LLM now reasons with YOUR historical context baked in.

---

## Why Vectors? Why Not Just Text Search?

This is the key insight of RAG.

```
TEXT SEARCH (keyword matching):
Query:    "Tor exit node credential stuffing PII"
Matches:  documents containing those exact words
Misses:   "anonymizing proxy brute force sensitive database"
          ← same meaning, different words → NOT FOUND

VECTOR SEARCH (semantic matching):
Query:    "Tor exit node credential stuffing PII"
Converts: to meaning vector
Matches:  documents with SIMILAR MEANING
Finds:    "anonymizing proxy brute force sensitive database"
          ← different words, same meaning → FOUND
```

Vectors capture **meaning**, not just words.

```
"car" and "automobile" → vectors very close together
"car" and "cybersecurity" → vectors far apart

"credential stuffing" and "brute force password attack"
→ vectors close together → RAG finds both
```

---

## The Four Knowledge Sources in Our SOC System

### 1. Past Alerts + Verdicts (highest signal)
```
What's stored:
- Alert summary
- Enrichment context
- Analyst verdict
- Analyst notes
- Actions taken

Why it matters:
"Last time this exact pattern occurred → MALICIOUS"
Gives LLM concrete precedent from YOUR environment
```

### 2. SOC Playbooks (structured guidance)
```
What's stored:
- Response procedures per alert type
- Investigation steps
- Escalation criteria
- Auto-containment rules

Why it matters:
LLM doesn't have to figure out what to do
It follows YOUR specific procedures
```

### 3. Threat Intelligence Documents (world knowledge)
```
What's stored:
- Threat actor profiles
- Attack technique descriptions
- IOC context and attribution
- MITRE ATT&CK technique details

Why it matters:
LLM gets current, specific threat context
Not just general pre-training knowledge
```

### 4. Detection Rules Library (institutional knowledge)
```
What's stored:
- Detection rule code + description
- Rule rationale
- Known false positive patterns
- Tuning history

Why it matters:
LLM understands why a rule fired
Can reason about false positive likelihood
```

---

## Multi-Layered Retrieval

Simple RAG does one vector search. World-class RAG does multiple targeted searches:

```python
def retrieve_context(alert):

    # Layer 1: Find similar past alerts
    similar_alerts = vector_search(
        query=alert.summary,
        collection="past_alerts",
        filters={"tenant_id": alert.tenant_id},
        top_k=5
    )

    # Layer 2: Find relevant playbook
    playbook = vector_search(
        query=f"{alert.rule_name} {alert.mitre_techniques}",
        collection="playbooks",
        top_k=1
    )

    # Layer 3: Find relevant threat intel
    threat_context = vector_search(
        query=f"{alert.threat_actor} {alert.attack_technique}",
        collection="threat_intel",
        top_k=3
    )

    # Layer 4: Exact lookup (not vector) for entity history
    entity_history = db.query(
        "SELECT * FROM entity_history WHERE ip=? OR user=?",
        alert.src_ip, alert.user_id
    )

    # All run in PARALLEL
    return merge(similar_alerts, playbook, threat_context, entity_history)
```

Each layer retrieves a different type of knowledge. Together they give the LLM a complete picture.

---

## Re-ranking — Getting the Right Results

Vector search returns the most similar documents.
But similar ≠ most useful.

```
Query: "Impossible travel Finance user PII database"

Raw vector search results:
1. Impossible Travel - jsmith - MALICIOUS (sim: 0.94)  ← relevant
2. Impossible Travel - kpatel - BENIGN   (sim: 0.87)  ← relevant
3. Impossible Travel - IT admin - BENIGN (sim: 0.85)  ← less relevant (different dept)
4. VPN anomaly - Finance user  (sim: 0.82)            ← somewhat relevant
5. Large data export - Finance (sim: 0.79)            ← less relevant

After re-ranking with cross-encoder
(re-ranks by relevance to THIS specific alert):
1. Impossible Travel - jsmith - MALICIOUS  ← Finance, PII, Tor → most relevant
2. Impossible Travel - kpatel - BENIGN     ← similar context
3. VPN anomaly - Finance user              ← same dept, relevant
4. Impossible Travel - IT admin            ← moved down (different dept)
5. Large data export - Finance             ← moved down (different alert type)
```

Re-ranking uses a **cross-encoder model** — slower than vector search but more accurate at judging true relevance.

---

## Hybrid Search — Best of Both Worlds

Production systems combine vector search AND keyword search:

```
VECTOR SEARCH                   KEYWORD SEARCH (BM25)
semantic similarity             exact term matching
"finds related concepts"        "finds exact IOCs"

"credential stuffing"    +      "185.220.101.45"
finds semantically              finds exact IP match
similar attacks                 in past alerts

           │                           │
           └─────────────┬─────────────┘
                         ▼
                  FUSION / RE-RANKING
                  combine both result sets
                  score and re-rank
                         │
                         ▼
                  Best of semantic
                  AND exact matching
```

**Why you need both:**
- Vector search alone misses exact IOC matches (IP, hash, domain)
- Keyword search alone misses semantically similar cases with different wording
- Together: high recall AND high precision

---

## Token Budget Management

You can't inject everything retrieved into the prompt — context windows have limits and tokens cost money.

```python
TOKEN_BUDGET = 8000  # tokens reserved for retrieved context

def fit_to_budget(retrieved_docs, budget):

    # Priority order
    sections = [
        ("similar_alerts",  retrieved_docs.alerts,   3000),  # highest signal
        ("playbook",        retrieved_docs.playbook,  1500),  # always useful
        ("threat_intel",    retrieved_docs.threats,   2000),  # important context
        ("entity_history",  retrieved_docs.history,   1000),  # always include
        ("detection_rules", retrieved_docs.rules,      500),  # nice to have
    ]

    prompt_context = ""
    tokens_used = 0

    for name, content, max_tokens in sections:
        allowed = min(max_tokens, budget - tokens_used)
        if allowed <= 0:
            break
        section = truncate(content, allowed)
        prompt_context += format_section(name, section)
        tokens_used += len(section)

    return prompt_context
```

**Rule:** Never truncate high-signal sections (similar alerts, entity history) to fit low-signal ones (detection rules). Priority order matters.

---

## Per-Tenant Isolation — Critical for Multi-Tenancy

```
Customer A's past alerts → Customer A's vector store ONLY
Customer B's past alerts → Customer B's vector store ONLY

When agent triages Customer A alert:
  vector_search(
      query=alert.summary,
      filters={"tenant_id": "customer-a"}  ← ALWAYS scoped
  )

Customer A NEVER gets results from Customer B's data
Even if Customer B had an identical alert last week
```

This is a **hard architectural requirement.** A single misconfigured filter exposes one customer's security posture to another. That's a company-ending breach of trust.

---

## RAG vs Fine-tuning — When to Use Which

```
RAG                                 Fine-tuning
────────────────────────────────────────────────────────
Add new knowledge without           Teach new behavior
retraining                          or style

"Here are our SOC playbooks"        "Always output in
→ inject at query time              this specific format"
→ no training needed                → baked into weights

Good for:                           Good for:
• Frequently changing data          • Stable patterns
• Customer-specific context         • Output format
• Historical alert lookup           • Domain-specific tone
• Large knowledge bases             • Reducing prompt length

Updates: instant                    Updates: hours of training
Cost: per query                     Cost: upfront training
```

**In our SOC system — use both:**
- RAG for alert history, playbooks, threat intel (changes frequently)
- Fine-tuning for verdict style, output format, tenant-specific patterns (stable)

---

## What Breaks If RAG Is Bad

| Problem | Impact |
|---|---|
| Poor chunking | Retrieved context is cut mid-sentence — LLM gets incomplete information |
| No tenant isolation | Customer data leaks across tenants — catastrophic |
| No re-ranking | LLM gets similar but not relevant results — wrong verdict |
| Token budget ignored | Prompt exceeds context window — API error, alert dropped |
| Stale index | LLM reasons from outdated playbooks — wrong actions |
| No hybrid search | Exact IOC matches missed — known bad actors slip through |

---

## The Compounding Value

Every resolved alert makes RAG better:

```
Alert resolved today
      │
      ▼
Verdict + analyst notes stored
      │
      ▼
Embedded and added to vector store
      │
      ▼
Future similar alert retrieves this as context
      │
      ▼
LLM reasons with one more data point
      │
      ▼
Verdict more accurate than yesterday
```

After 2 years across 500 enterprise customers:
- Vector store contains millions of resolved alerts
- Every alert type has dozens of precedents
- LLM rarely sees a truly novel situation
- Accuracy compounds — **this is the data moat**

---

## Layers at a Glance

```
INDEXING (offline):
Raw data → Chunking → Embedding → Vector Store

RETRIEVAL (per alert):
Alert → Query Embedding → Vector Search + BM25
      → Re-ranking → Token Budget Fitting
      → Inject into prompt

KNOWLEDGE SOURCES:
Past alerts + verdicts    ← highest signal
SOC playbooks             ← structured guidance
Threat intelligence       ← world knowledge
Detection rule library    ← institutional knowledge

KEY PROPERTIES:
Per-tenant isolated       ← multi-tenancy safety
Hybrid search             ← semantic + exact
Re-ranked                 ← relevance not just similarity
Token budgeted            ← cost controlled
Continuously updated      ← compounds over time
```

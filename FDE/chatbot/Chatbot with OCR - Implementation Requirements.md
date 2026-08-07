# Chatbot with OCR — What's Required to Build It

Ties together everything covered so far: [../OCR/How OCR Works.md](../OCR/How OCR Works.md) (the OCR pipeline itself), [../OCR/Chatbot File Upload OCR Flow.md](../OCR/Chatbot File Upload OCR Flow.md) (how OCR plugs into a chat product), and [../api-gateway-flow-demo/](../api-gateway-flow-demo/) (the gateway concerns — auth, rate limiting, TLS — that sit in front of this whole system).

---

## High-Level Architecture

```
                          ┌────────────┐
                          │   CLIENT    │  Web/mobile chat UI (User Interface)
                          └──────┬─────┘
                                 │ HTTPS
                                 ▼
                    ┌─────────────────────────┐
                    │       API GATEWAY         │  ← same concerns as the
                    │  TLS, AuthN, AuthZ,       │    api-gateway-flow-demo
                    │  rate limiting, routing   │    built earlier
                    └────────────┬────────────┘
                                 ▼
        ┌────────────────────────────────────────────────┐
        │              CHATBOT BACKEND (Node.js)           │
        │   Chat Endpoint (/chat) │ File Upload (/files)    │
        │   Session/History Manager                         │
        └───┬───────────────┬───────────────┬──────────────┘
            │               │               │
            ▼               ▼               ▼
   ┌────────────────┐ ┌───────────┐ ┌─────────────────┐
   │  SLM Prompt      │ │  File      │ │  Chat History     │
   │  Optimizer        │ │  Storage   │ │  Database          │
   │  (Small Language  │ │  (S3)      │ │  (Postgres/Mongo)  │
   │  Model — see       │ └─────┬─────┘ └─────────────────┘
   │  dedicated diagram  │       ▼
   │  below)              │  ┌───────────────┐
   └─────────┬───────────┘  │  OCR ENGINE     │  Tesseract.js (local, free)
             │              │  (only if no    │  or a cloud Document AI API
             ▼              │   text layer)   │  (AWS Textract / Google Vision)
   ┌──────────────────┐    └───────┬───────┘
   │  Vector Database    │◄─────────┘
   │  (RAG = Retrieval-   │   Chunking + Embeddings happen
   │   Augmented           │   between OCR output and here
   │   Generation)          │
   └─────────┬────────────┘
             │
             ▼
   ┌──────────────────┐
   │   LLM Provider      │  OpenAI / Anthropic / Gemini API
   │   generates the      │  (the "big model" — see comparison
   │   final answer         │   with the SLM below)
   └──────────────────┘
```

---

## Required Components

### 1. Core Chat Components

| Component                              | What it does                                                                  | Why you need it                                                |
| -------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Frontend chat UI                       | Message input, streaming response display, file upload button                 | The actual product surface                                     |
| Backend API server                     | Receives chat messages, orchestrates everything below                         | Ties the whole system together                                 |
| LLM (Large Language Model) integration | Calls OpenAI/Anthropic/Gemini's API with the conversation + retrieved context | This is what actually generates responses                      |
| Streaming response handling            | Server-Sent Events or WebSocket to stream tokens back as they're generated    | Users expect word-by-word output, not a long blocking wait     |
| Session/conversation history           | Stores past messages per conversation so the bot has memory                   | Without this, every message is a fresh, context-less request   |
| User authentication                    | Identifies who's chatting, ties files/history to the right user               | Prevents one user from seeing another's uploaded files/history |

### 2. File Upload + OCR Components

| Component                                  | What it does                                                                                               | Why you need it                                                                                                |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| File upload endpoint                       | Accepts the file, validates type/size                                                                      | Entry point for documents                                                                                      |
| File storage                               | Persists the raw uploaded file (S3, or local disk for a prototype)                                         | OCR and later re-processing need the original file                                                             |
| File-type router                           | Checks: does this file already have a text layer (regular PDF/docx)? If yes, extract directly and skip OCR | Most uploads aren't scanned images — running OCR on everything wastes time and hurts accuracy                 |
| OCR (Optical Character Recognition) engine | Extracts text from image-based files (scans, photos, screenshots)                                          | This is the actual "reading the document" step — see [How OCR Works.md](../OCR/How OCR Works.md)              |
| Async job queue                            | Runs OCR in the background instead of blocking the upload request                                          | Large scanned PDFs can take seconds to minutes — must not block the HTTP response                             |
| Text chunking                              | Splits extracted text into context-window-sized pieces                                                     | An LLM can't take a 50-page document in one prompt                                                             |
| Embeddings generation                      | Converts each chunk into a vector representation                                                           | Needed to search "which parts of this document are relevant to the question"                                   |
| Vector database                            | Stores chunk embeddings, supports similarity search                                                        | Powers RAG — retrieving only relevant chunks per question instead of dumping the whole file into every prompt |

### 3. SLM (Small Language Model) — Prompt Optimization Layer

**Chosen model: Microsoft Phi-4-mini (3.8B parameters).** It's widely regarded as one of the strongest small models available — it punches well above its parameter count on reasoning benchmarks (often beating models several times its size), it's open-weight (self-hostable, no per-token API cost), and at 3.8B parameters it's small enough to run cheaply and fast — which matters because this component runs on *every single message*, not once per conversation. (Alternatives worth knowing about: Google Gemma 3, Alibaba's Qwen2.5 — all strong, actively-developed small models; Phi-4-mini is the one named here.)

**Why a small model instead of just using the main LLM for this too:** this step is pure overhead that runs before the real answer-generation call. Using a frontier model (GPT/Claude/Gemini-class) for it would roughly double LLM cost and latency on every message, for a task that doesn't need frontier-level reasoning — it needs to be fast and cheap. This is the same "tiered model" pattern production RAG systems commonly use: a small model filters/prepares, a large model answers.

**What it actually does in this pipeline:**

```
User question + conversation history
              │
              ▼
   ┌───────────────────────┐
   │  SLM: Query Rewriting    │  Condenses multi-turn conversation + the
   │                            │  new question into one standalone,
   │                            │  well-formed retrieval query.
   │                            │  e.g. "what about the second one?" + history
   │                            │  → "What is the cancellation policy in
   │                            │     section 4 of the uploaded contract?"
   └────────────┬──────────────┘
                ▼
      Vector DB similarity search
      (using the optimized query)
                │
                ▼
   ┌───────────────────────┐
   │  SLM: Injection           │  Screens the retrieved chunks — which
   │  Screening                 │  came from OCR'd, UNTRUSTED document
   │                            │  content — for embedded instructions
   │                            │  trying to hijack the main LLM
   │                            │  (e.g. hidden text in a scanned PDF that
   │                            │   reads "ignore previous instructions...")
   └────────────┬──────────────┘
                ▼
   Clean, optimized prompt → sent to the main LLM Provider
```

This second sub-step matters specifically *because* of OCR: once documents are a trusted-looking source of context, their extracted text becomes part of the LLM's prompt — and a malicious or booby-trapped document is a real prompt-injection vector. Running it through a cheap, fast SLM screening pass before it reaches the main LLM is far cheaper than adding this as another job for the expensive model.

### 4. Cross-Cutting Concerns (reuse from the API gateway work)

These aren't chatbot- or OCR-specific — they're the same concerns already built out in [../api-gateway-flow-demo/gateway.js](../api-gateway-flow-demo/gateway.js):

| Concern                         | Why it applies here too                                                                              |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| TLS (Transport Layer Security)  | Chat messages and uploaded files are sensitive — must be encrypted in transit                       |
| AuthN/AuthZ                     | Same JWT (JSON Web Token) + scope pattern — a user should only access their own conversations/files |
| Rate limiting                   | Prevents one user from spamming the (expensive) LLM and OCR endpoints                                |
| Request validation              | Reject malformed uploads/messages before they reach expensive downstream calls                       |
| Circuit breaker                 | If the LLM provider, SLM, or OCR service goes down, fail fast instead of hanging requests            |
| Observability (logging/tracing) | Debugging "why did this OCR job fail" or "why was this answer wrong" needs traceability              |

### 5. Known Gaps — Not Yet Covered

The sections above get a chatbot with OCR and RAG (Retrieval-Augmented Generation) working end-to-end, but a production system needs more. These weren't part of the original design pass:

| Category | What's missing | Why it matters |
|---|---|---|
| Tool use / function calling | Nothing lets the LLM actually *do* something — e.g. the Jira lookup discussed earlier (`getJiraIssue(143)`) | Without it, the bot can only talk about retrieved text, never take action or fetch live external data |
| MCP (Model Context Protocol) | Not named anywhere as the mechanism for exposing external tools (Jira, Google Drive, internal APIs) to the LLM | Likely how "AI connected to Jira" actually gets implemented in practice |
| RAG quality evaluation | No way to measure whether retrieval is actually returning relevant chunks | Flying blind on whether the vector database is doing its job |
| PII (Personally Identifiable Information) handling | OCR'd documents (contracts, forms) can contain SSNs, card numbers, etc. — no detection/redaction step | Storing/embedding/sending PII to an LLM provider is a real compliance risk |
| Content moderation / jailbreak detection | Injection screening covers *documents*, but nothing screens the user's own messages for abuse/jailbreak attempts | A user can still try to manipulate the bot directly, not just via a poisoned document |
| Multi-tenancy / data isolation | Vector DB design doesn't mention namespacing/partitioning by user or organization | Without it, one user's retrieval could leak another user's private chunks |
| Data deletion / retention | No handling of what happens to vector DB entries when a user deletes an uploaded file | GDPR "right to be forgotten" and basic data hygiene both require this |
| Conversation memory management | Chat history storage exists, but nothing handles history itself outgrowing the context window | Same context-limit problem RAG solves for documents, unaddressed for the conversation itself |
| LLM provider fallback | Circuit breaker was designed for the gateway/OCR demo, never applied to the LLM call itself | Single point of failure on the most critical call in the system if the provider has an outage |
| Semantic response caching | Regular caching was covered for the gateway; nothing caches *similar* (not identical) LLM answers | Repeated/near-duplicate questions re-pay full LLM cost every time |
| Prompt versioning/management | The SLM does query rewriting, but there's no system for storing, versioning, or A/B testing system prompts | Prompt changes today are just editing a string in code, with no rollback or comparison |
| File upload security | Malware/virus scanning of uploaded files isn't mentioned | Upload endpoints are a classic attack surface beyond type/size validation |
| Testing strategy | No unit/integration tests, and the load-testing angle from [../api-gateway-flow-demo/Grafana k6 vs Postman.md](../api-gateway-flow-demo/Grafana%20k6%20vs%20Postman.md) was never connected here | The chat/upload endpoints have the same concurrency-testing needs as the gateway demo |
| Orchestration framework | No framework named for wiring retrieval + prompting + tool calls together | Hand-rolled glue code (shown in [RAG.md](RAG.md)) works, but reimplements retries/streaming/agent loops a framework already solves |

**On the orchestration framework specifically:** `langchain` (full-featured — chains, memory, agent/tool-calling abstractions) and the `Vercel AI SDK` (lighter, TypeScript-native, strongest at streaming) are the two realistic Node.js choices. LangChain if you need the fuller agent/tool-calling story (relevant once MCP/tool-use is added); Vercel AI SDK if the priority is clean streaming and provider-agnostic calls without a heavy abstraction layer.

**On tool use / MCP specifically:** this is the piece that would let the chatbot go beyond "answer from retrieved documents" into "answer from retrieved documents *or* call out to live systems like Jira." It's a separate capability from RAG — RAG retrieves static, pre-indexed content; tool use lets the LLM decide, per-message, to call a live API and use the result. Both can coexist in the same chat endpoint.

---

## Suggested Node.js Tech Stack

| Need                                 | Package/Service                                                                                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Backend framework                    | `express` (already used in the gateway demo) or `fastify`                                                                           |
| LLM provider SDK                     | `@anthropic-ai/sdk`, `openai`, or `@google/generative-ai`                                                                         |
| SLM (Small Language Model) inference | `ollama` (run Phi-4-mini locally, exposes a local HTTP API — simplest) or `node-llama-cpp` (in-process, no separate server to run) |
| Streaming to client                  | Server-Sent Events (native`res.write`) or `ws` for WebSocket                                                                        |
| File upload handling                 | `multer` (multipart form parsing)                                                                                                     |
| File storage                         | `@aws-sdk/client-s3`, or local `fs` for a prototype                                                                                 |
| OCR (free, local)                    | `tesseract.js`                                                                                                                        |
| OCR (paid, higher accuracy)          | `@aws-sdk/client-textract` or `@google-cloud/vision`                                                                                |
| Async job queue                      | `bullmq` (Redis-backed) — needed once OCR/embedding jobs shouldn't block requests                                                    |
| Chunking                             | Simple custom logic, or`langchain`'s text splitters                                                                                   |
| Embeddings                           | Your LLM provider's embeddings endpoint (e.g. OpenAI`text-embedding-3-small`)                                                         |
| Vector database                      | `pgvector` (Postgres extension, simplest to self-host), Pinecone, or Chroma                                                           |
| Chat history storage                 | Postgres/MySQL (relational, simple) or MongoDB (if message shape varies)                                                                |
| Auth/JWT                             | `jsonwebtoken` (already used in the gateway demo)                                                                                     |

---

## Phased Build Plan

```
Phase 1 — Bare chatbot (no files)
  Backend endpoint → LLM API call → streamed response.
  Chat history stored per conversation. No OCR, no RAG, no SLM yet.

Phase 2 — File upload, text-only files
  Add /files endpoint. Handle plain-text/native-PDF uploads by extracting
  text directly (no OCR needed yet). Inject extracted text into the prompt
  for small files.

Phase 3 — Add OCR for image/scanned uploads
  Route image-based files through tesseract.js. Add async job handling
  so uploads don't block on OCR completion.

Phase 4 — Add RAG for large documents
  Add chunking + embeddings + vector DB. Switch from "stuff whole file
  into prompt" to "retrieve relevant chunks per question."

Phase 5 — Add the SLM prompt-optimization layer
  Self-host Phi-4-mini (via Ollama). Insert query rewriting before
  retrieval, and injection screening on retrieved chunks before they
  reach the main LLM.

Phase 6 — Production hardening
  Layer in the gateway concerns: TLS, rate limiting, circuit breaker,
  observability — everything already demonstrated in api-gateway-flow-demo.
```

---

## Open Decisions to Make Before Building

- **Local OCR (Tesseract.js, free) vs cloud OCR (Textract/Vision, paid but more accurate)** — depends on expected document quality; see the earlier discussion on accuracy trade-offs.
- **Self-hosted vector DB (pgvector) vs managed (Pinecone)** — pgvector is simplest if you already run Postgres; Pinecone removes operational overhead at a cost.
- **Sync vs async OCR** — for a prototype, synchronous (block until done) is simpler to build; for anything beyond small files, async with a job queue is required.
- **Self-hosted SLM (Phi-4-mini via Ollama, free but you manage the server) vs a cheap hosted small-model API tier** — self-hosting avoids per-call cost and keeps document content off a third party for the injection-screening step, at the cost of running/scaling your own inference server.

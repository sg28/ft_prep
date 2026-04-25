"""
SOC RAG Retrieval Pipeline
Layer 4A — Retrieval Augmented Generation for alert triage

Covers:
  - Document indexing (chunking + embedding)
  - Hybrid search: vector similarity (semantic) + BM25 (exact keyword)
  - Reciprocal Rank Fusion to merge both result sets
  - Cross-encoder re-ranking for true relevance
  - Token budget management
  - Per-tenant isolation (hard architectural requirement)

Interview focus: Staff AI Engineer, SOC Agent Platform @ Panther Labs
"""

from __future__ import annotations

import math
import re
import time
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Optional


# ─────────────────────────────────────────────────────────────────────────────
# SHARED TYPES
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class Document:
    """
    A unit stored in the vector index.
    One source document (e.g. a past alert) becomes N chunks.
    """
    doc_id:    str
    tenant_id: str
    text:      str
    metadata:  dict        # verdict, rule_id, timestamp, source_type, etc.
    vector:    list[float] = field(default_factory=list)  # populated at index time


@dataclass
class RetrievedContext:
    """Everything the LLM will receive as context for one alert."""
    similar_alerts:  list[Document]
    playbook:        list[Document]
    threat_intel:    list[Document]
    entity_history:  list[Document]


# ─────────────────────────────────────────────────────────────────────────────
# STAGE 1 — CHUNKING
# ─────────────────────────────────────────────────────────────────────────────

CHUNK_SIZE    = 512   # tokens (approximated as words here for simplicity)
CHUNK_OVERLAP = 64    # overlap so context isn't cut mid-sentence


def chunk_document(text: str, doc_id: str, tenant_id: str,
                   metadata: dict) -> list[Document]:
    """
    Split a long document into overlapping chunks.

    Why overlap? A sentence at the boundary of two chunks would otherwise be
    split — the LLM would see incomplete context. Overlap ensures every
    sentence appears whole in at least one chunk.

    In production: use a tokenizer (tiktoken) for exact token counts.
    Here we approximate with word count.
    """
    words  = text.split()
    chunks = []
    start  = 0
    idx    = 0

    while start < len(words):
        end       = min(start + CHUNK_SIZE, len(words))
        chunk_text = " ".join(words[start:end])
        chunks.append(Document(
            doc_id    = f"{doc_id}_chunk_{idx}",
            tenant_id = tenant_id,
            text      = chunk_text,
            metadata  = {**metadata, "chunk_idx": idx, "parent_doc_id": doc_id},
        ))
        if end == len(words):
            break
        start += CHUNK_SIZE - CHUNK_OVERLAP
        idx   += 1

    return chunks


# ─────────────────────────────────────────────────────────────────────────────
# STAGE 2 — EMBEDDING
# ─────────────────────────────────────────────────────────────────────────────

class EmbeddingModel:
    """
    Stub for a real embedding model (OpenAI text-embedding-3-small,
    Cohere embed-v3, or a self-hosted sentence-transformers model).

    In production:
    - Batched async calls to the embedding API
    - Results cached in Redis (TTL ~24h) — same text → same vector
    - Dimensionality: 1536 (OpenAI) or 768 (sentence-transformers)

    Here: deterministic fake embeddings so the math works without an API key.
    """
    DIMS = 8  # toy dimensionality; real = 1536

    def embed(self, text: str) -> list[float]:
        """
        Fake but deterministic: hash text into a unit vector.
        Real implementation: POST to embedding API or local model inference.
        """
        words  = text.lower().split()
        vec    = [0.0] * self.DIMS
        for i, word in enumerate(words):
            for j, ch in enumerate(word):
                vec[(i + j) % self.DIMS] += ord(ch) / 1000.0
        # Normalize to unit vector (required for cosine similarity)
        mag = math.sqrt(sum(x * x for x in vec)) or 1.0
        return [x / mag for x in vec]

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Batch embedding — one API call instead of N."""
        return [self.embed(t) for t in texts]


def cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    # Both vectors are already unit-normalized, so no need to divide by magnitudes
    return dot


# ─────────────────────────────────────────────────────────────────────────────
# STAGE 3 — VECTOR STORE (in-memory, per-tenant)
# ─────────────────────────────────────────────────────────────────────────────

class VectorStore:
    """
    In-memory vector store scoped per tenant.

    Production equivalent: pgvector (Postgres extension) or Pinecone.
    - pgvector: keeps data in your own infra, strong SQL filter support
    - Pinecone: managed, scales to billions of vectors, metadata filtering

    Key design: tenant_id is ALWAYS a filter, never optional.
    A missing filter = data leak across tenants = catastrophic.
    """

    def __init__(self):
        # {tenant_id: [Document, ...]}
        self._store: dict[str, list[Document]] = defaultdict(list)

    def add(self, doc: Document) -> None:
        """Index a pre-embedded document."""
        assert doc.vector, "Document must be embedded before indexing"
        self._store[doc.tenant_id].append(doc)

    def search(self,
               query_vector: list[float],
               tenant_id: str,
               top_k: int = 10,
               source_type: Optional[str] = None) -> list[tuple[Document, float]]:
        """
        Cosine similarity search, scoped to a single tenant.

        source_type filter lets us search only past_alerts, or only playbooks, etc.
        In pgvector this becomes: WHERE metadata->>'source_type' = 'past_alert'
        """
        candidates = self._store[tenant_id]
        if source_type:
            candidates = [d for d in candidates
                          if d.metadata.get("source_type") == source_type]

        scored = [(doc, cosine_similarity(query_vector, doc.vector))
                  for doc in candidates]
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]


# ─────────────────────────────────────────────────────────────────────────────
# STAGE 4 — BM25 KEYWORD INDEX
# ─────────────────────────────────────────────────────────────────────────────

class BM25Index:
    """
    BM25 (Best Match 25) — the gold standard keyword ranking algorithm.
    Used by Elasticsearch, Lucene, and most production search engines.

    Why alongside vector search?
    Vector search finds semantically similar text.
    BM25 finds exact term matches — critical for IOCs like IPs, hashes, domains.

    Example:
      Query: "185.220.101.45"  (a Tor exit node IP)
      Vector search: might miss it if the alert text is short / different phrasing
      BM25: exact match → guaranteed hit

    Parameters:
      k1 = 1.5  — term frequency saturation (higher = more weight to repeated terms)
      b  = 0.75 — document length normalization (0=none, 1=full)
    """
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b  = b
        # {tenant_id: {doc_id: [tokens]}}
        self._corpus:   dict[str, dict[str, list[str]]] = defaultdict(dict)
        # {tenant_id: {term: {doc_id: count}}}
        self._tf:       dict[str, dict[str, dict[str, int]]] = defaultdict(lambda: defaultdict(dict))
        # {tenant_id: {term: doc_count}}
        self._df:       dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
        self._doc_lens: dict[str, dict[str, int]] = defaultdict(dict)
        self._avg_lens: dict[str, float] = {}
        # keep reference to Document objects
        self._docs:     dict[str, dict[str, Document]] = defaultdict(dict)

    def _tokenize(self, text: str) -> list[str]:
        return re.findall(r'\b\w+\b', text.lower())

    def add(self, doc: Document) -> None:
        tid    = doc.tenant_id
        tokens = self._tokenize(doc.text)
        self._corpus[tid][doc.doc_id]   = tokens
        self._doc_lens[tid][doc.doc_id] = len(tokens)
        self._docs[tid][doc.doc_id]     = doc

        term_counts: dict[str, int] = defaultdict(int)
        for t in tokens:
            term_counts[t] += 1
        for term, count in term_counts.items():
            self._tf[tid][term][doc.doc_id] = count
            self._df[tid][term] += 1

        # Recompute average doc length (could batch this in production)
        lens = list(self._doc_lens[tid].values())
        self._avg_lens[tid] = sum(lens) / len(lens)

    def search(self, query: str, tenant_id: str,
               top_k: int = 10,
               source_type: Optional[str] = None) -> list[tuple[Document, float]]:
        """Return top_k documents ranked by BM25 score."""
        tid       = tenant_id
        N         = len(self._corpus.get(tid, {}))
        if N == 0:
            return []

        avg_dl    = self._avg_lens.get(tid, 1.0)
        query_tks = self._tokenize(query)
        scores:   dict[str, float] = defaultdict(float)

        for term in query_tks:
            df_t = self._df[tid].get(term, 0)
            if df_t == 0:
                continue
            # IDF — inverse document frequency (how rare is this term?)
            idf = math.log((N - df_t + 0.5) / (df_t + 0.5) + 1)

            for doc_id, tf in self._tf[tid].get(term, {}).items():
                dl    = self._doc_lens[tid][doc_id]
                # BM25 term frequency normalization
                tf_norm = (tf * (self.k1 + 1)) / (
                    tf + self.k1 * (1 - self.b + self.b * dl / avg_dl)
                )
                scores[doc_id] += idf * tf_norm

        results = []
        for doc_id, score in sorted(scores.items(), key=lambda x: x[1], reverse=True):
            doc = self._docs[tid].get(doc_id)
            if doc and (source_type is None or
                        doc.metadata.get("source_type") == source_type):
                results.append((doc, score))
            if len(results) >= top_k:
                break

        return results


# ─────────────────────────────────────────────────────────────────────────────
# STAGE 5 — RECIPROCAL RANK FUSION
# ─────────────────────────────────────────────────────────────────────────────

def reciprocal_rank_fusion(
    result_lists: list[list[tuple[Document, float]]],
    k: int = 60
) -> list[tuple[Document, float]]:
    """
    Merge multiple ranked result lists into one without needing to normalize scores.

    RRF formula: score(d) = Σ 1 / (k + rank(d))
      k=60 is the standard constant (dampens the impact of top ranks slightly)

    Why RRF over score normalization?
    - Vector scores (cosine 0–1) and BM25 scores (0–∞) are on different scales
    - Normalizing requires knowing the max score upfront — tricky in streaming
    - RRF only uses rank position, not raw scores → scale-invariant, robust

    Example with 2 lists:
      Vector rank 1 → 1/(60+1) = 0.0164
      BM25   rank 1 → 1/(60+1) = 0.0164
      Combined score = 0.0328  ← boosted for appearing top in both
    """
    fused: dict[str, float] = defaultdict(float)
    doc_map: dict[str, Document] = {}

    for result_list in result_lists:
        for rank, (doc, _score) in enumerate(result_list):
            fused[doc.doc_id]   += 1.0 / (k + rank + 1)
            doc_map[doc.doc_id]  = doc

    merged = [(doc_map[doc_id], score)
              for doc_id, score in sorted(fused.items(),
                                          key=lambda x: x[1], reverse=True)]
    return merged


# ─────────────────────────────────────────────────────────────────────────────
# STAGE 6 — CROSS-ENCODER RE-RANKING
# ─────────────────────────────────────────────────────────────────────────────

class CrossEncoder:
    """
    Re-ranks candidates by true relevance to the query.

    Bi-encoder (vector search): encodes query and document independently.
      Fast — O(1) per query against pre-computed vectors.
      Approximate — loses query-document interaction signal.

    Cross-encoder: encodes (query, document) TOGETHER.
      Slow — must run inference for every (query, doc) pair.
      Accurate — sees full interaction between query and document.

    Production pattern:
      1. Bi-encoder retrieves top 50 candidates cheaply   ← coarse filter
      2. Cross-encoder re-ranks top 50 → returns top 5   ← precise ranking

    Real cross-encoder: sentence-transformers/ms-marco-MiniLM-L-6-v2
    Here: stub that scores based on keyword overlap weighted by position.
    """

    def rerank(self, query: str, candidates: list[tuple[Document, float]],
               top_k: int = 5) -> list[tuple[Document, float]]:
        """
        Re-score each (query, document) pair and return top_k.
        In production: single batched inference call to the cross-encoder model.
        """
        query_terms = set(query.lower().split())
        rescored = []

        for doc, _prior_score in candidates:
            score = self._score(query_terms, doc.text)
            # Boost documents where the verdict matches suspicious signals
            if doc.metadata.get("verdict") in ("malicious", "suspicious"):
                score *= 1.2
            rescored.append((doc, score))

        rescored.sort(key=lambda x: x[1], reverse=True)
        return rescored[:top_k]

    def _score(self, query_terms: set[str], doc_text: str) -> float:
        """
        Stub scoring: term overlap with position decay.
        Real cross-encoder: transformer model scoring the full (query, doc) pair.
        """
        words = doc_text.lower().split()
        score = 0.0
        for i, word in enumerate(words):
            if word in query_terms:
                # Earlier matches weighted higher (position decay)
                score += 1.0 / math.log2(i + 2)
        return score


# ─────────────────────────────────────────────────────────────────────────────
# STAGE 7 — TOKEN BUDGET MANAGEMENT
# ─────────────────────────────────────────────────────────────────────────────

# Approximate tokens per word — real production uses tiktoken
WORDS_PER_TOKEN = 0.75

# Token allocations per section — total must stay under context window budget
BUDGET = {
    "similar_alerts":  3000,   # highest signal — most tokens
    "playbook":        1500,   # always useful — fixed size
    "threat_intel":    2000,   # important context
    "entity_history":  1000,   # always include
}
TOTAL_BUDGET = sum(BUDGET.values())   # 7500 tokens reserved for RAG context


def _approx_tokens(text: str) -> int:
    return int(len(text.split()) / WORDS_PER_TOKEN)


def _truncate_to_tokens(text: str, max_tokens: int) -> str:
    words      = text.split()
    max_words  = int(max_tokens * WORDS_PER_TOKEN)
    if len(words) <= max_words:
        return text
    return " ".join(words[:max_words]) + " [truncated]"


def fit_to_token_budget(context: RetrievedContext) -> str:
    """
    Assemble retrieved context into a prompt string that fits the token budget.

    Priority order matters:
    - similar_alerts first — concrete precedents are highest signal for verdict
    - entity_history always included — per-user/IP context is critical
    - playbook before threat_intel — our procedures over general world knowledge
    - Never truncate high-signal sections to fit low-signal ones

    In production: use tiktoken for exact counts, not approximations.
    """
    sections = [
        ("similar_alerts", context.similar_alerts,  BUDGET["similar_alerts"]),
        ("entity_history", context.entity_history,  BUDGET["entity_history"]),
        ("playbook",       context.playbook,         BUDGET["playbook"]),
        ("threat_intel",   context.threat_intel,     BUDGET["threat_intel"]),
    ]

    parts        = []
    tokens_used  = 0

    for section_name, docs, section_budget in sections:
        remaining = TOTAL_BUDGET - tokens_used
        if remaining <= 0:
            break

        allowed   = min(section_budget, remaining)
        texts     = [d.text for d in docs]
        combined  = "\n---\n".join(texts)
        truncated = _truncate_to_tokens(combined, allowed)
        tokens_used += _approx_tokens(truncated)

        parts.append(f"<{section_name}>\n{truncated}\n</{section_name}>")

    return "\n\n".join(parts)


# ─────────────────────────────────────────────────────────────────────────────
# RAG PIPELINE — wire all stages together
# ─────────────────────────────────────────────────────────────────────────────

class SOCRagPipeline:
    """
    Full RAG pipeline for SOC alert triage.

    Indexing  (offline):  index_document()
    Retrieval (per alert): retrieve()

    Design decisions:
    - Hybrid search (vector + BM25) → RRF fusion → cross-encoder rerank
    - Per-tenant isolation enforced at every search call
    - Parallel retrieval across knowledge sources (asyncio.gather in prod)
    - Token budget enforced before prompt assembly
    """

    def __init__(self):
        self.embedder     = EmbeddingModel()
        self.vector_store = VectorStore()
        self.bm25_index   = BM25Index()
        self.reranker     = CrossEncoder()

    # ── Indexing ──────────────────────────────────────────────────────────────

    def index_document(self, text: str, doc_id: str,
                       tenant_id: str, metadata: dict) -> int:
        """
        Chunk, embed, and index one document.
        Returns the number of chunks created.

        In production: called from an async worker consuming a Kafka topic
        of new alerts/playbooks/threat-intel as they arrive.
        """
        chunks = chunk_document(text, doc_id, tenant_id, metadata)
        texts  = [c.text for c in chunks]

        # Batch embed — one API call for all chunks
        vectors = self.embedder.embed_batch(texts)

        for chunk, vector in zip(chunks, vectors):
            chunk.vector = vector
            self.vector_store.add(chunk)
            self.bm25_index.add(chunk)

        return len(chunks)

    # ── Retrieval ─────────────────────────────────────────────────────────────

    def _hybrid_search(self,
                       query: str,
                       tenant_id: str,
                       source_type: str,
                       top_k: int = 10) -> list[tuple[Document, float]]:
        """
        Run vector + BM25 in parallel, fuse with RRF.

        In production: asyncio.gather(vector_task, bm25_task)
        Vector search hits pgvector over network; BM25 hits Elasticsearch.
        Both are O(log N) with indexes.
        """
        query_vec     = self.embedder.embed(query)
        vector_results = self.vector_store.search(
            query_vec, tenant_id, top_k=top_k, source_type=source_type)
        bm25_results  = self.bm25_index.search(
            query, tenant_id, top_k=top_k, source_type=source_type)

        fused = reciprocal_rank_fusion([vector_results, bm25_results])
        return fused[:top_k]

    def retrieve(self, alert_summary: str,
                 tenant_id: str,
                 entity_ids: Optional[list[str]] = None) -> RetrievedContext:
        """
        Retrieve all context needed to triage one alert.

        Four parallel searches (one per knowledge source type):
          1. similar_alerts  — past cases with verdicts
          2. playbook        — response procedures
          3. threat_intel    — threat actor / technique context
          4. entity_history  — per-user/IP behavioral history

        In production all four run concurrently via asyncio.gather().
        """
        # 1. Similar past alerts — most important for verdict accuracy
        alert_candidates = self._hybrid_search(
            alert_summary, tenant_id, source_type="past_alert", top_k=20)
        similar_alerts = self.reranker.rerank(
            alert_summary, alert_candidates, top_k=5)

        # 2. Relevant playbook
        playbook_candidates = self._hybrid_search(
            alert_summary, tenant_id, source_type="playbook", top_k=5)
        playbook = self.reranker.rerank(
            alert_summary, playbook_candidates, top_k=1)

        # 3. Threat intel — query with IOC + technique terms for better recall
        threat_query    = f"{alert_summary} threat actor technique IOC"
        threat_candidates = self._hybrid_search(
            threat_query, tenant_id, source_type="threat_intel", top_k=10)
        threat_intel = self.reranker.rerank(
            alert_summary, threat_candidates, top_k=3)

        # 4. Entity history — exact lookup (not vector) for known entities
        #    In prod: SQL query on Postgres entity_history table
        entity_history = self._hybrid_search(
            " ".join(entity_ids or []), tenant_id,
            source_type="entity_history", top_k=5) if entity_ids else []
        entity_history = [doc for doc, _ in entity_history]

        return RetrievedContext(
            similar_alerts = [doc for doc, _ in similar_alerts],
            playbook       = [doc for doc, _ in playbook],
            threat_intel   = [doc for doc, _ in threat_intel],
            entity_history = entity_history,
        )

    def build_rag_context(self, alert_summary: str,
                          tenant_id: str,
                          entity_ids: Optional[list[str]] = None) -> str:
        """
        Full pipeline: retrieve → budget-fit → return prompt-ready context string.
        This string is injected into the LLM prompt alongside the sanitized alert.
        """
        context = self.retrieve(alert_summary, tenant_id, entity_ids)
        return fit_to_token_budget(context)


# ─────────────────────────────────────────────────────────────────────────────
# DEMO
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    pipeline = SOCRagPipeline()
    TENANT   = "acme-corp"

    # ── Index past alerts ────────────────────────────────────────────────────
    past_alerts = [
        ("alert-001",
         "Impossible Travel alert. User jsmith logged in from New York then Moscow "
         "within 20 minutes. Tor exit node detected. Accessed PII database prod-db-02. "
         "Verdict: MALICIOUS. Attacker used compromised credentials. Account suspended.",
         {"source_type": "past_alert", "verdict": "malicious", "rule": "impossible_travel"}),

        ("alert-002",
         "Impossible Travel alert. User kpatel logged in from Chicago then London. "
         "No Tor detected. Normal business travel confirmed with manager. "
         "Verdict: BENIGN. False positive, user was on business trip.",
         {"source_type": "past_alert", "verdict": "benign", "rule": "impossible_travel"}),

        ("alert-003",
         "Privileged AssumeRole from known botnet IP 1.2.3.4. User compromised-user "
         "assumed prod-admin role. Threat intel score 0.95. "
         "Verdict: MALICIOUS. Credentials rotated, incident opened.",
         {"source_type": "past_alert", "verdict": "malicious", "rule": "root_from_unknown_ip"}),
    ]

    for doc_id, text, meta in past_alerts:
        n = pipeline.index_document(text, doc_id, TENANT, meta)
        print(f"Indexed {doc_id}: {n} chunk(s)")

    # ── Index playbooks ──────────────────────────────────────────────────────
    playbook_text = """
    Impossible Travel Response Playbook v2.1
    Step 1: Verify if user has active travel by checking HR system and Slack.
    Step 2: Check if source IP is a known VPN, proxy, or Tor exit node.
    Step 3: Review accessed resources — PII or production systems = escalate immediately.
    Step 4: If Tor confirmed + PII access → suspend account, rotate credentials, open P1.
    Step 5: If business travel confirmed → close as benign, update user allowlist.
    Escalation: All confirmed compromises → Security Lead + Legal within 15 minutes.
    """
    pipeline.index_document(
        playbook_text, "playbook-impossible-travel", TENANT,
        {"source_type": "playbook", "rule": "impossible_travel"})

    # ── Index threat intel ───────────────────────────────────────────────────
    threat_intel_text = """
    Threat Actor: APT-Lazarus credential stuffing campaign (active Q1 2024).
    TTPs: credential stuffing via Tor exit nodes, targets SaaS applications.
    IOC IPs: 185.220.101.0/24 (Tor), 1.2.3.0/24 (known C2 range).
    Common targets: finance sector, healthcare, PII databases.
    Recommended action: block ASN 60729, alert on Tor exit node logins immediately.
    """
    pipeline.index_document(
        threat_intel_text, "threat-intel-lazarus", TENANT,
        {"source_type": "threat_intel", "actor": "APT-Lazarus"})

    # ── Index entity history ─────────────────────────────────────────────────
    entity_text = """
    Entity: bwilliams@acme.com. Last 90 days activity:
    - 3 login failures from unknown IPs (2024-01-10, 2024-01-12, 2024-01-14)
    - Password reset requested 2024-01-13
    - Accessed prod-db-02 twice in last week
    - No travel registered in HR system
    Risk score: 0.72 (elevated)
    """
    pipeline.index_document(
        entity_text, "entity-bwilliams", TENANT,
        {"source_type": "entity_history", "entity": "bwilliams@acme.com"})

    # ── Retrieve context for a new alert ─────────────────────────────────────
    print("\n" + "=" * 70)
    print("NEW ALERT — Impossible Travel: bwilliams, Moscow, Tor, prod-db-02")
    print("=" * 70)

    new_alert = (
        "Impossible Travel detected. User bwilliams logged in from Boston "
        "then Moscow within 15 minutes. Source IP is Tor exit node. "
        "Accessed prod-db-02 at 3am. 3 MFA failures before success."
    )

    # Test: tenant isolation — Customer B should get nothing from ACME's data
    print("\n[ISOLATION TEST] Querying as wrong tenant 'other-corp':")
    wrong_tenant_ctx = pipeline.build_rag_context(new_alert, "other-corp")
    print(f"  Context length: {len(wrong_tenant_ctx)} chars (expected: 0 or near-empty)")

    print("\n[RETRIEVAL] Querying as correct tenant 'acme-corp':")
    rag_context = pipeline.build_rag_context(
        new_alert, TENANT, entity_ids=["bwilliams@acme.com"])

    print(f"\nRAG context assembled ({_approx_tokens(rag_context)} tokens):")
    print("-" * 70)
    print(rag_context[:1200], "...\n")

    # Show what the full LLM prompt looks like
    print("=" * 70)
    print("FINAL LLM PROMPT STRUCTURE:")
    print("=" * 70)
    print("""[SYSTEM PROMPT — static, never interpolated]
You are a SOC analyst. Analyze the alert and respond in JSON.

[ALERT — sanitized via soc_ingestion_pipeline.py]
{ event_type: "authentication", actor: "bwilliams@acme.com", ... }

[RAG CONTEXT — retrieved above]
<similar_alerts>
... jsmith Impossible Travel → MALICIOUS (Tor + PII) ...
... kpatel Impossible Travel → BENIGN (business travel) ...
</similar_alerts>
<entity_history>
... bwilliams: 3 failed logins, elevated risk score 0.72 ...
</entity_history>
<playbook>
... Step 4: Tor confirmed + PII access → suspend account ...
</playbook>
<threat_intel>
... APT-Lazarus: credential stuffing via Tor, targets PII databases ...
</threat_intel>
""")

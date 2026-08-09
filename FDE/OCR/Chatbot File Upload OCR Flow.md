# OCR Flow for a Chatbot File Upload Feature

Two Separate Flows

A chatbot with file upload actually has **two distinct flows** that happen at different times:

1. **Ingestion** — happens once, right after upload (potentially slow: seconds to minutes for a large scanned PDF).
2. **Query** — happens every time the user asks a question, possibly many times against the same uploaded file (must be fast: sub-second to a few seconds).

Conflating these is the most common design mistake — running OCR synchronously inside a chat request would make every question about a file wait on reprocessing it.

---

## Flow 1: Upload → OCR → Ingestion

```
USER            CHATBOT UI         BACKEND               FILE STORAGE        OCR ENGINE
  │                  │                  │                      │                  │
  │ 1. Uploads file   │                  │                      │                  │
  │ (PDF/image/scan)  │                  │                      │                  │
  ├─────────────────►│                  │                      │                  │
  │                  │ 2. Validate      │                      │                  │
  │                  │  (type, size)    │                      │                  │
  │                  │ 3. POST /files   │                      │                  │
  │                  ├─────────────────►│                      │                  │
  │                  │                  │ 4. Store raw file    │                  │
  │                  │                  ├─────────────────────►│                  │
  │                  │                  │ 5. file_id            │                 │
  │                  │                  │◄─────────────────────┤                  │
  │                  │  6. 202 Accepted  │                      │                  │
  │                  │  { file_id,       │                      │                  │
  │                  │    status:        │                      │                  │
  │                  │    "processing" } │                      │                  │
  │                  │◄─────────────────┤                      │                  │
  │ 7. "Processing... │                  │                      │                  │
  │  your file" in UI │                  │                      │                  │
  │◄─────────────────┤                  │                      │                  │
  │                  │                  │ 8. Async job picks up file_id           │
  │                  │                  │ 9. Has a text layer?                    │
  │                  │                  │    (native PDF text) ──YES──► extract directly, skip OCR
  │                  │                  │    (scanned image,   ──NO───►│                  │
  │                  │                  │     no text layer)           │                  │
  │                  │                  ├──────────────────────────────►│                  │
  │                  │                  │                      │        │ 10. OCR pipeline: │
  │                  │                  │                      │        │  preprocess →     │
  │                  │                  │                      │        │  segment →        │
  │                  │                  │                      │        │  recognize →      │
  │                  │                  │                      │        │  postprocess       │
  │                  │                  │  11. extracted text + confidence + bbox per word    │
  │                  │                  │◄──────────────────────────────┤                  │
  │                  │                  │ 12. Chunk text (context-window sized pieces)        │
  │                  │                  │ 13. Generate embeddings per chunk                   │
  │                  │                  │ 14. Store chunks + embeddings + bbox in vector index│
  │                  │                  │ 15. Mark file_id status = "ready"                   │
  │                  │  16. push/poll:  │                      │                  │
  │                  │   status="ready" │                      │                  │
  │                  │◄─────────────────┤                      │                  │
  │ 17. "File ready,  │                  │                      │                  │
  │  ask away" in UI  │                  │                      │                  │
  │◄─────────────────┤                  │                      │                  │
```

**Key decision at step 9:** most files people upload to a chatbot are *not* scanned images — they're normal PDFs, Word docs, or text files that already contain a selectable text layer. Running full OCR on those wastes time and actually loses accuracy (OCR introduces recognition errors; the embedded text layer is already ground truth). So the pipeline always checks for a native text layer first and only falls through to the OCR engine when there isn't one — e.g. a scanned paper document, a photographed whiteboard, or a screenshot.

---

## Flow 2: User Asks a Question About the File

```
USER            CHATBOT UI         BACKEND            VECTOR INDEX        LLM
  │                  │                  │                    │              │
  │ 18. "What does   │                  │                    │              │
  │  section 3 say   │                  │                    │              │
  │  about pricing?" │                  │                    │              │
  ├─────────────────►│                  │                    │              │
  │                  │ 19. POST /chat   │                    │              │
  │                  │  { message,      │                    │              │
  │                  │    file_id }     │                    │              │
  │                  ├─────────────────►│                    │              │
  │                  │                  │ 20. Embed the question             │
  │                  │                  │ 21. Similarity search against      │
  │                  │                  │     this file_id's stored chunks   │
  │                  │                  ├───────────────────►│              │
  │                  │                  │ 22. top-k matching chunks          │
  │                  │                  │     (+ their bbox for citations)   │
  │                  │                  │◄───────────────────┤              │
  │                  │                  │ 23. Build prompt = question +      │
  │                  │                  │     retrieved chunks as context    │
  │                  │                  ├────────────────────────────────────►│
  │                  │                  │                    │  24. LLM reads │
  │                  │                  │                    │   context,     │
  │                  │                  │                    │   generates    │
  │                  │                  │                    │   answer        │
  │                  │                  │  25. streamed response text          │
  │                  │                  │◄────────────────────────────────────┤
  │                  │ 26. stream       │                    │              │
  │                  │  tokens to UI    │                    │              │
  │                  │◄─────────────────┤                    │              │
  │ 27. sees answer, │                  │                    │              │
  │  optionally      │                  │                    │              │
  │  "jump to source"│                  │                    │              │
  │  highlighting the│                  │                    │              │
  │  bbox in original│                  │                    │              │
  │  file             │                  │                    │              │
  │◄─────────────────┤                  │                    │              │
```

**Why retrieval (step 21-22) instead of just dumping the whole file into the prompt:** an LLM (Large Language Model) has a finite context window. A 50-page scanned contract could be far larger than that window, and even when it fits, stuffing in irrelevant pages wastes tokens/cost and can dilute the model's attention. RAG (Retrieval-Augmented Generation) — embedding chunks at ingestion time, then searching for only the most relevant ones per question — keeps each request small and focused. For short files (a one-page receipt), some systems skip retrieval and just inject the full extracted text directly; the two-flow split above still holds either way, only step 21 becomes "use the whole cached extracted text" instead of a vector search.

---

## Where Each OCR Concept from the Base Pipeline Plugs In

| Base OCR stage (see [How OCR Works.md](How OCR Works.md)) | Where it happens in this flow                                                                                                                                     |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pre-processing (grayscale, deskew, binarization)          | Inside "OCR pipeline" step 10, only for image/scan uploads                                                                                                        |
| Layout/page segmentation                                  | Also inside step 10 — determines chunk boundaries later (step 12 often aligns chunks to detected paragraphs/sections, not arbitrary character counts)            |
| Character/text recognition (CNN→RNN/LSTM→CTC)           | Also step 10 — this is literally what produces the extracted text string                                                                                         |
| Post-processing (spell-check, confidence scoring)         | Step 10's output feeding step 11 — low-confidence words can be flagged in the UI or trigger a "please re-upload a clearer scan" prompt                           |
| Output (bounding boxes)                                   | Carried through steps 11 → 14 → 22 → 27, so the chatbot can highlight*where in the original document* an answer came from — a strong trust signal for users |

---

## Failure Modes Specific to This Flow

```
  File has no text layer AND OCR confidence is low  → surface a warning in the UI rather than
                                                        silently answering from garbled text
  File is huge (100+ pages)                          → ingestion must be async (step 8) with a
                                                        job queue; never block the upload request
  User asks a question before ingestion finishes      → backend should reject/queue with a clear
                                                        "still processing" response, not silently
                                                        answer with no context
  Retrieved chunks don't actually contain the answer  → LLM should say "not found in this document"
                                                        rather than hallucinating from its own
                                                        general knowledge — this is a prompt design
                                                        concern, not an OCR concern, but the failure
                                                        looks identical to a user (a wrong answer)
```

---

## Summary

- **Ingestion is a one-time, async, potentially-slow pipeline**: upload → store → (skip OCR if native text exists, else run the full OCR pipeline) → chunk → embed → index.
- **Querying is a repeated, fast, synchronous flow**: question → retrieve relevant chunks → prompt the LLM → stream the answer, optionally citing back to the exact bounding box in the source file.
- The OCR-specific work (pre-processing, segmentation, recognition, post-processing) is entirely contained inside one step of the ingestion flow — everything else is standard file-upload and RAG plumbing around it.

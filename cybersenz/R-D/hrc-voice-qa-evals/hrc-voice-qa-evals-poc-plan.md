# MOMUS — POC Plan

**MOMUS** — Monitoring Outbound Messages for Understanding and Scoring

> In Greek mythology, Momus was the god of criticism and fault-finding. His job was to
> observe living beings at work, evaluate the quality of their performance, and deliver
> a precise verdict on what went well and what went wrong. He did not judge the dead —
> he judged workers. That is exactly what we build here.

---

**Goal:** Automatically evaluate the quality of a completed HRC voice-agent call —
replacing manual listening — using the existing HIPAA-compliant Azure stack.

**What MOMUS does:** Listens to a call between our AI agent (Emily) and a live insurance
rep, judges Emily's performance as if she were an employee, and delivers a scored report
with flagged moments and improvement notes.

**Reference competitor:** Cekura (cekura.ai) — YC-backed, $2.4M raised, does exactly
this for generic voice agents. We build MOMUS internally to stay inside our Azure HIPAA
boundary and tune it to our carrier-specific call flows.

**Outcome of POC:** Given a call UUID, MOMUS produces a structured eval report with a
score, breakdown, and flagged moments — fully automated, fully within Azure.

---

## What we already have (no setup needed)

| Resource | Detail | Status |
|---|---|---|
| Call recordings | 40 WAV files in Azure Blob (`pdfs` container, `calls/<uuid>/`) | ✅ Ready |
| ElevenLabs ASR | Scribe v1 — speaker diarization confirmed working | ✅ Ready |
| Azure OpenAI | `gpt-5.1` deployment on `hrc-11labs.openai.azure.com` | ✅ Ready |
| Azure Blob Storage | `hrcdevstg001` — connection string in `.env` | ✅ Ready |
| Evals framework | `HRC-Voice-Agents/evals/` — scorer + runner pattern already exists | ✅ Ready |
| Python virtualenv | `HRC-Voice-Agents/.venv` — all packages installed | ✅ Ready |
| All credentials | `.env` filled and tested | ✅ Ready |

**No Twilio access needed for POC.** Recordings are already in Azure Blob.

---

## Credentials reference (all in `HRC-Voice-Agents/.env`)

```
ELEVENLABS_API_KEY          — ElevenLabs Scribe ASR
AZURE_OPENAI_API_KEY        — gpt-5.1 judge
AZURE_OPENAI_ENDPOINT       — https://hrc-11labs.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT     — gpt-5.1
AZURE_OPENAI_API_VERSION    — 2024-12-01-preview
AUDIT_BLOB_CONNECTION_STRING — hrcdevstg001 (recordings + eval output)
AUDIT_BLOB_CONTAINER        — pdfs (contains calls/ and pdfs/ prefixes)
```

---

## Call recording structure in Azure Blob

Container: `pdfs` on `hrcdevstg001`

```
calls/<uuid>/voice_recording.wav   — single-agent calls (Women's Health or IVR only)
calls/<uuid>/pl_recording.wav      — provider-line segment of a two-phase call
calls/<uuid>/wh_recording.wav      — Women's Health segment of a two-phase call
pdfs/<uuid>/<uuid>-v1.pdf          — post-call analysis PDF (proof of successful call)
```

**Corpus summary (40 recordings total):**
- 11 substantial calls (5+ minutes), all have matching PDFs → confirmed successful
- Remaining short recordings (<2 min) → failed / incomplete calls (useful as negative examples)
- Largest: `00341b70.../voice_recording.wav` — 83 MB, ~45 minutes

---

## Flow Diagrams

### Diagram 1 — System Context (where eval fits in the big picture)

```
 HRC DASHBOARD
 (client portal)
       │
       │  triggers outbound call
       ▼
 OUTBOUND CALL SYSTEM
 (HRC-Outbound-WebApp)
       │
       │  initiates call via
       ▼
    TWILIO ─────────────────────────────────────────────┐
  (telephony)                                           │
       │                                                │
       │  audio stream (WebSocket)                      │  call audio
       ▼                                                │  stored as WAV
 ELEVENLABS AGENT                                       │
 (Emily 2.0 / Women's Health)                          ▼
       │                              AZURE BLOB STORAGE
       │  speaks to                   pdfs container
       ▼                              ├── calls/<uuid>/voice_recording.wav  ◄─── POC reads from here
  AETNA / CIGNA / BCBS               └── pdfs/<uuid>/<uuid>-v1.pdf
  Insurance Rep or IVR
       │
       │  data collected, call ends
       ▼
 POST-CALL ANALYSIS
 (GPT-5.1 on Azure)
       │
       │  produces
       ▼
 POST-CALL PDF ──► stored to Azure Blob (pdfs/<uuid>/)
                                            │
                                            │
                          ╔═════════════════╧══════════════════╗
                          ║     EVAL PIPELINE  (what we build) ║
                          ║     triggered on completed call     ║
                          ╚════════════════════════════════════╝
                                            │
                                            ▼
                                    eval_report.json
                                    eval_summary.md
                                    (stored back to Azure Blob)
```

---

### Diagram 2 — Eval Pipeline (detailed data flow)

```
INPUT
  call_uuid  (e.g. "00341b70-dcd1-4c5a-9216-66d3dbcf2ab7")
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1 — INGEST                            evals/voice/ingest.py│
│                                                                 │
│  Azure Blob (hrcdevstg001)                                      │
│  pdfs/calls/<uuid>/voice_recording.wav                          │
│       │                                                         │
│       │  download                                               │
│       ▼                                                         │
│  /tmp/<uuid>.wav                                                │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2 — TRANSCRIPTION                 evals/voice/transcribe.py│
│                                                                 │
│  ElevenLabs Scribe v1 API                                       │
│  ├── diarize=True  (speaker separation)                         │
│  └── language=en                                                │
│                                                                 │
│  OUTPUT: transcript.json                                        │
│  {                                                              │
│    "turns": [                                                   │
│      { "speaker": "agent", "start": 0.0,  "text": "Hello..." } │
│      { "speaker": "ivr",   "start": 3.2,  "text": "Press 1…" } │
│      { "speaker": "rep",   "start": 8.1,  "text": "Aetna…"  } │
│    ]                                                            │
│  }                                                              │
└───────────────────────┬─────────────────────────────────────────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
┌──────────────┐ ┌────────────┐ ┌─────────────────────┐
│   STEP 3     │ │   STEP 4   │ │      STEP 4         │
│   METRICS    │ │ (parallel) │ │    FLOW CHECK        │
│              │ │            │ │                      │
│ metrics.py   │ │ metrics.py │ │  flow_check.py       │
│              │ │            │ │                      │
│ pydub/librosa│ │            │ │  Rule-based scan     │
│              │ │            │ │  of transcript for   │
│ - gap times  │ │            │ │  7 checkpoints:      │
│ - latency    │ │            │ │  ✓ IVR navigated     │
│ - interrupts │ │            │ │  ✓ Reached rep       │
│ - hold time  │ │            │ │  ✓ Credentials given │
│ - talk ratio │ │            │ │  ✓ Benefits requested│
│              │ │            │ │  ✓ Fields captured   │
│ metrics.json │ │            │ │  ✓ Call closed       │
└──────┬───────┘ └────────────┘ └──────────┬──────────┘
       │                                    │
       └──────────────┬─────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5 — LLM JUDGE                         evals/voice/judge.py │
│                                                                 │
│  GPT-5.1 on Azure OpenAI (hrc-11labs.openai.azure.com)         │
│  HIPAA boundary maintained — no data leaves Azure               │
│                                                                 │
│  INPUT:  transcript + metrics + flow results + rubric           │
│                                                                 │
│  RUBRIC:                                                        │
│  ┌──────────────────────────────────────┐                       │
│  │ Data completeness       (0–25 pts)   │                       │
│  │ Conversation quality    (0–25 pts)   │                       │
│  │ Navigation efficiency   (0–20 pts)   │                       │
│  │ Error recovery          (0–15 pts)   │                       │
│  │ Call closure            (0–15 pts)   │                       │
│  └──────────────────────────────────────┘                       │
│                                                                 │
│  OUTPUT: scored_eval.json                                       │
│  {                                                              │
│    "total_score": 78,                                           │
│    "dimensions": { ... },                                       │
│    "flagged_moments": [                                         │
│      { "timestamp_s": 342, "issue": "...", "severity": "high" }│
│    ],                                                           │
│    "what_went_well": [...],                                     │
│    "what_to_improve": [...]                                     │
│  }                                                              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6 — REPORT                           evals/voice/report.py │
│                                                                 │
│  Combines all outputs into two files:                           │
│                                                                 │
│  eval_report.json  ──► Azure Blob: evals/<uuid>/eval_report.json│
│  eval_summary.md   ──► human-readable, share with team          │
└─────────────────────────────────────────────────────────────────┘

OUTPUT
  Score: 78/100
  Flagged: 3 moments
  Top issue: missed deductible field (timestamp 5:42)
  Stored: Azure Blob evals/<uuid>/eval_report.json
```

---

### Diagram 3 — HIPAA data boundary

```
╔══════════════════════════════════════════════════════════════╗
║              HIPAA-COMPLIANT BOUNDARY                        ║
║                                                              ║
║   Azure Blob Storage         Azure OpenAI (East US 2)        ║
║   (hrcdevstg001)             (hrc-11labs)                    ║
║   ┌──────────────┐           ┌──────────────────────────┐   ║
║   │ WAV files    │──────────►│ GPT-5.1 judge            │   ║
║   │ eval reports │           │ gpt-4o-transcribe-diarize│   ║
║   └──────────────┘           └──────────────────────────┘   ║
║                                                              ║
║   ElevenLabs (Scribe ASR)                                    ║
║   ┌──────────────┐                                           ║
║   │ Speech-to-   │  ← PHI audio sent here (need BAA check)  ║
║   │ Text only    │                                           ║
║   └──────────────┘                                           ║
║                                                              ║
║   ⚠️  PHI RISK NOTE: ElevenLabs Scribe receives raw call     ║
║   audio containing patient data. Confirm ElevenLabs BAA     ║
║   before production use. Alternative: use Azure             ║
║   gpt-4o-transcribe-diarize (confirmed in same Azure tenant)║
╚══════════════════════════════════════════════════════════════╝

         ✗  No data sent to Twilio (not needed for POC)
         ✗  No data sent to Cekura or any external eval service
         ✗  No PHI in logs or local files beyond /tmp processing
```

---

## Architecture

```
Azure Blob (pdfs container)
    calls/<uuid>/voice_recording.wav
        │
        ▼
[1] Download WAV
    └─ azure-storage-blob SDK
    └─ Write to local /tmp for processing
        │
        ▼
[2] Transcription + Speaker Diarization
    └─ ElevenLabs Scribe v1 API (diarize=True)
    └─ Output: timestamped transcript, speaker-labelled turns
    └─ Speakers: "agent" / "ivr" / "rep" (insurance human rep)
        │
        ▼
[3] Signal-Level Metrics
    └─ pydub + librosa (ffmpeg installed)
    └─ Silence/gap detection (pauses > 2s)
    └─ Turn latency (agent response time after rep speaks)
    └─ Interruptions (overlapping speech)
    └─ Hold time (prolonged silence mid-call)
        │
        ▼
[4] Conversation Flow Checker
    └─ Rule-based against Women's Health / Aetna checkpoint list
    └─ Scan transcript for required steps (IVR nav → human rep → data collected → close)
    └─ Output: pass/fail + evidence turn per checkpoint
        │
        ▼
[5] LLM Judge — gpt-5.1 on Azure OpenAI
    └─ Input: transcript + metrics + flow results + rubric
    └─ Output: score (0–100), per-dimension breakdown,
               flagged moments, what went well, what to improve
        │
        ▼
[6] Eval Report
    └─ eval_report.json  — machine-readable, stored back to Azure Blob
    └─ eval_summary.md   — human-readable, shareable with team
```

---

## Scope

### In scope (POC)
- Download and process WAV recordings from Azure Blob
- Transcribe with speaker diarization via ElevenLabs Scribe
- Compute signal-level metrics from audio
- Check conversation flow against Women's Health / Aetna checkpoints
- LLM judge scoring with structured rubric
- Structured JSON + human-readable report output
- Validate against 10 real calls (hand-check scores against your listening judgment)

### Out of scope (POC)
- Pre-production simulator (synthetic insurer personas)
- Dashboard / UI
- Slack / email alerting
- Automatic trigger on new calls (production hook)
- Multi-carrier rubrics (Cigna, Blue Cross) — start with Women's Health / Aetna only
- Two-phase call handling (`pl_recording` + `wh_recording`) — start with `voice_recording` only

---

## File structure

All eval code lives inside the existing project:

```
HRC-Voice-Agents/
├── .env                          ← credentials (gitignored)
├── .venv/                        ← virtualenv (activate before running)
├── evals/
│   ├── __init__.py
│   ├── scorer.py                 ← existing extraction scorer (don't modify)
│   ├── run_extraction_eval.py    ← existing extraction eval (don't modify)
│   ├── fixtures/                 ← existing extraction fixtures
│   └── voice/                   ← NEW — all voice eval code goes here
│       ├── __init__.py
│       ├── ingest.py             ← download WAV from Azure Blob
│       ├── transcribe.py         ← ElevenLabs Scribe → transcript.json
│       ├── metrics.py            ← signal-level audio metrics
│       ├── flow_check.py         ← conversation flow checkpoint checker
│       ├── judge.py              ← GPT-5.1 LLM judge
│       ├── report.py             ← assemble final eval report
│       ├── run_eval.py           ← single entry point: given UUID → full report
│       └── rubrics/
│           └── womens_health_aetna.md   ← scoring rubric
```

**How to activate the virtualenv:**
```bash
cd HRC-Voice-Agents
source .venv/bin/activate
```

**How to run the eval (once built):**
```bash
python -m evals.voice.run_eval <call-uuid>
```

---

## Phases

### Phase 0 — Corpus preparation (Day 1)

No setup needed — recordings already in Azure Blob. This phase is just labelling.

- [ ] Pick 10 calls from the corpus (see UUIDs below)
- [ ] For each call: download WAV locally, listen for 5–10 minutes (or full if short)
- [ ] Hand-label each call: `good` / `bad` / `borderline` + brief notes on why
- [ ] Save labels to `evals/voice/corpus_labels.json` — this is your ground truth

**Recommended corpus (mix of durations and outcomes):**

| UUID (first 8 chars) | Duration | Type | Why include |
|---|---|---|---|
| `00341b70` | 45m | voice | Longest call — full workflow |
| `50739fe6` | 24m | voice | Long, good reference |
| `28f33695` | 18m | voice | Mid-length |
| `f9fc250f` | 14m | voice | Mid-length |
| `322d737e` | 14m | voice | Mid-length |
| `618ae01b` | 8m | voice | Shorter complete call |
| `158f6955` | 5m | voice | Borderline length |
| `b4153e37` | 2m | voice | Likely incomplete |
| `e932e8b6` | 1m | voice | Likely failed |
| `375e9d02` | 36s | voice | Failed call (negative example) |

### Phase 1 — Ingest (Day 1–2)

Create `evals/voice/ingest.py`:

- [ ] Connect to Azure Blob using `AUDIT_BLOB_CONNECTION_STRING`
- [ ] Given a `call_uuid`, download `calls/<uuid>/voice_recording.wav` to `/tmp/<uuid>.wav`
- [ ] Return local file path
- [ ] Handle missing blob (call may not have a recording) gracefully

**Test:** Download `00341b70.../voice_recording.wav` and confirm file is ~83 MB.

### Phase 2 — Transcription (Days 2–3)

Create `evals/voice/transcribe.py`:

- [ ] Upload WAV to ElevenLabs Scribe v1 with `diarize=True`
- [ ] Parse response into structured transcript:

```json
{
  "call_uuid": "00341b70-...",
  "duration_s": 2729,
  "turns": [
    { "speaker": "agent", "start": 0.0, "end": 3.2, "text": "Hello, this is Emily..." },
    { "speaker": "rep",   "start": 4.5, "end": 8.1, "text": "Thank you for calling Aetna..." },
    { "speaker": "ivr",   "start": 0.0, "end": 2.1, "text": "Press 1 for eligibility..." }
  ]
}
```

- [ ] Map ElevenLabs speaker labels (`speaker_0`, `speaker_1`) to roles (`agent`/`rep`/`ivr`)
  - Agent is identifiable: consistent voice, speaks first, uses the agent script
  - IVR: short prompts, automated tone, early in call
  - Rep: everything else
- [ ] Save to `transcript.json`
- [ ] Test on 3 calls — read the transcript and verify speaker labels make sense

**Note on cost:** ElevenLabs Scribe charges per minute of audio. A 45-minute call = ~45 mins billed. Run on short calls first during development.

### Phase 3 — Signal Metrics (Day 3)

Create `evals/voice/metrics.py`:

- [ ] Compute from transcript timestamps (no audio re-processing needed):
  - `avg_agent_response_latency_ms` — time between rep's turn ending and agent starting
  - `silence_gaps` — list of gaps > 2s with `{start, end, duration_s}`
  - `interruptions` — turns where speaker switch happened before previous speaker finished
  - `total_hold_time_s` — gaps > 10s (likely on hold)
  - `total_turns` — count of speaker turns
  - `agent_talk_ratio` — fraction of total duration where agent is speaking
- [ ] Save to `metrics.json`
- [ ] Spot-check on 2 calls: do the numbers feel right?

**Output:**
```json
{
  "avg_agent_response_latency_ms": 1240,
  "silence_gaps": [{"start": 342.1, "end": 358.7, "duration_s": 16.6}],
  "interruptions": 3,
  "total_hold_time_s": 94,
  "total_turns": 87,
  "agent_talk_ratio": 0.42
}
```

### Phase 4 — Conversation Flow Checker (Days 4–5)

Create `evals/voice/flow_check.py` and `evals/voice/rubrics/womens_health_aetna.md`.

**Women's Health / Aetna checkpoint list (draft — review with Rajvir):**

| # | Checkpoint | How to detect |
|---|---|---|
| 1 | IVR navigated to correct department | Keywords: "eligibility", "benefits", "provider services" in early turns |
| 2 | Reached a human rep | Rep speaker appears after IVR segment |
| 3 | Agent identified caller (NPI / practice name) | Keywords: NPI number, "Huntington Reproductive", tax ID |
| 4 | Patient credentials provided (DOB, member ID) | Date patterns, "date of birth", "member ID" |
| 5 | Eligibility / benefits requested | Keywords: "eligibility", "benefits", "covered", "IVF", "infertility" |
| 6 | Required fields captured | Cross-reference against post-call PDF fields |
| 7 | Call closed correctly | Agent sign-off phrase present; no abrupt silence at end |

- [ ] Implement keyword/phrase matching per checkpoint (fast, no LLM cost)
- [ ] Output: pass/fail + the transcript turn that satisfied or failed each checkpoint
- [ ] Test on 5 calls

**Output:**
```json
{
  "checkpoints": [
    { "id": 1, "name": "IVR navigated", "passed": true,  "evidence_turn": 3 },
    { "id": 2, "name": "Reached human rep", "passed": true,  "evidence_turn": 12 },
    { "id": 7, "name": "Call closed correctly", "passed": false, "evidence_turn": null }
  ],
  "checkpoints_passed": 6,
  "checkpoints_total": 7
}
```

### Phase 5 — LLM Judge (Days 5–7)

Create `evals/voice/judge.py`. This is the core of the eval.

**Scoring rubric (Women's Health / Aetna):**

| Dimension | Weight | What we measure |
|---|---|---|
| Data completeness | 25 | All required fields captured in the call |
| Conversation quality | 25 | Natural phrasing, no loops, humanistic tone |
| Navigation efficiency | 20 | IVR and rep interaction handled without retries |
| Error recovery | 15 | Graceful handling of misheard input, wrong dept, hold |
| Call closure | 15 | Proper sign-off, no abrupt drop |

- [ ] Build judge prompt combining transcript + metrics + flow results + rubric
- [ ] Call `gpt-5.1` on Azure OpenAI
- [ ] Parse structured JSON response

**Judge prompt structure:**
```
You are a QA evaluator for HIPAA-compliant AI voice agents calling US health insurers
on behalf of fertility clinics. Evaluate the following call.

[TRANSCRIPT]
...

[SIGNAL METRICS]
...

[FLOW CHECKPOINT RESULTS]
...

[SCORING RUBRIC]
...

Return JSON:
{
  "total_score": 0-100,
  "dimensions": {
    "data_completeness":     { "score": 0-25, "rationale": "..." },
    "conversation_quality":  { "score": 0-25, "rationale": "..." },
    "navigation_efficiency": { "score": 0-20, "rationale": "..." },
    "error_recovery":        { "score": 0-15, "rationale": "..." },
    "call_closure":          { "score": 0-15, "rationale": "..." }
  },
  "flagged_moments": [
    { "timestamp_s": 342, "issue": "...", "severity": "high|medium|low" }
  ],
  "what_went_well": ["...", "..."],
  "what_to_improve": ["...", "..."],
  "one_line_summary": "..."
}
```

- [ ] Test on all 10 corpus calls
- [ ] Compare LLM scores against your Phase 0 hand-labels
- [ ] Adjust rubric weights and prompt if scores feel off

**Note on cost:** gpt-5.1 charges per token. A 45-minute transcript is large — consider
truncating to the first and last 10 minutes for very long calls during development.

### Phase 6 — Report Assembly (Day 7–8)

Create `evals/voice/report.py`:

- [ ] Combine transcript + metrics + flow + judge into final report
- [ ] Write `eval_report.json` back to Azure Blob: `evals/<uuid>/eval_report.json`
- [ ] Write `eval_summary.md` locally for human review

**`eval_summary.md` format:**
```markdown
# Eval Report — <uuid>
**Date:** 2026-06-XX  **Duration:** 45m 29s  **Score: 78/100**

## Score Breakdown
| Dimension | Score |
|---|---|
| Data completeness | 22/25 |
...

## Flagged Moments
- [5:42] Agent repeated NPI number incorrectly — rep had to ask twice (medium)
- [28:11] 16s silence after hold — no acknowledgement to rep (low)

## What Went Well
- IVR navigation completed in first attempt
- Natural phrasing throughout

## What to Improve
- Missed capturing deductible amount
- Abrupt close — no confirmation of received information
```

### Phase 7 — Entry Point + Validation (Days 8–10)

Create `evals/voice/run_eval.py`:

- [ ] Single command: `python -m evals.voice.run_eval <call-uuid>`
- [ ] Runs full pipeline: ingest → transcribe → metrics → flow → judge → report
- [ ] Logs progress at each step
- [ ] Handles failures gracefully (partial results saved, not silent crash)

**Validation:**
- [ ] Run on all 10 corpus calls
- [ ] Review scores with Rajvir: do they match intuition?
- [ ] Tune rubric and prompt based on feedback
- [ ] Confirm all output stays within Azure (no PHI to external services)

**Demo to Gautam + Rajvir:**
- Pick one call, run `run_eval.py` live
- Walk through `eval_summary.md` output
- Show flagged moments with timestamps

---

## How to run (once built)

```bash
# Navigate to project
cd /path/to/HRC-Voice-Agents

# Activate virtualenv
source .venv/bin/activate

# Run eval on a specific call
python -m evals.voice.run_eval 00341b70-dcd1-4c5a-9216-66d3dbcf2ab7

# Output:
# evals/voice/output/00341b70-.../eval_report.json
# evals/voice/output/00341b70-.../eval_summary.md
```

---

## Success criteria

POC is successful if:
1. Pipeline runs end-to-end on a real call without manual intervention
2. LLM judge scores align with hand-labels on at least 8 of 10 corpus calls (±15 points)
3. Flagged moments correspond to real issues (verifiable by listening to the timestamp)
4. Total runtime per call is under 5 minutes
5. All data stays within Azure / ElevenLabs (no PHI leaves the HIPAA boundary)
6. Rajvir agrees the scores feel right

---

## Estimated timeline

| Phase | Days | Depends on |
|---|---|---|
| 0 — Corpus labelling | 1 | Nothing — start here |
| 1 — Ingest | 1 | Phase 0 |
| 2 — Transcription | 2 | Phase 1 |
| 3 — Signal metrics | 1 | Phase 2 |
| 4 — Flow checker | 2 | Phase 2 + checkpoint list review with Rajvir |
| 5 — LLM judge | 3 | Phases 3 + 4 + rubric sign-off |
| 6 — Report assembly | 1 | Phase 5 |
| 7 — Validation + demo | 2 | All phases + Rajvir's time |
| **Total** | **~10 working days** | |

---

## What this unlocks after POC

- **Backfill** — run evals on all 40 historical calls; establish a quality baseline
- **Production hook** — trigger eval automatically after every new call completes
- **Per-carrier rubrics** — extend to Cigna, Blue Cross with their specific checkpoints
- **Two-phase call support** — handle `pl_recording` + `wh_recording` split calls
- **Pre-production simulator** — synthetic insurer personas to test before go-live
  (this is the Cekura-equivalent feature; the most complex, highest-value addition)
- **Dashboard** — surface scores in Confluence or lightweight internal UI
- **Product** — if the eval engine is solid, it becomes a sellable service to other
  voice-agent companies facing the same HIPAA constraints

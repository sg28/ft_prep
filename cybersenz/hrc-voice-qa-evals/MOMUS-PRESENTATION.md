# MOMUS
## Automated Voice Call Quality Assurance
**Huntington Reproductive Center — June 2026**

---

## The Problem

HRC's AI voice agent (Emily) calls health insurers daily to verify patient benefits.

**Today:** Nobody listens back to these calls. If Emily misses a required field — deductible, prior auth, OOP max — the clinic finds out when it becomes a problem downstream.

**MOMUS fixes that.** Every call is scored automatically the moment it ends.

---

## What is MOMUS?

**M**onitoring **O**utbound **M**essages for **U**nderstanding and **S**coring

An automated pipeline that takes a completed call recording and produces a quality score and actionable report — with no human review required.

---

## How It Works

```
Call ends
    ↓
1. INGEST        Grab the recording from Azure
    ↓
2. TRANSCRIBE    ElevenLabs Scribe API — audio → text, speaker-labeled
                 (Agent / IVR / Insurance Rep)
    ↓
3. METRICS       Measure response latency, hold time, interruptions
    ↓
4. FLOW CHECK    7 mandatory checkpoints — did Emily hit every required step?
    ↓
5. JUDGE         GPT-5.1 scores the call across 5 dimensions (out of 100)
    ↓
6. REPORT        Human-readable summary + structured JSON uploaded to Azure
```

---

## The Source Code

All code lives in `R-D/hrc-voice-qa-evals/`. One file per pipeline step.

```
evals/voice/
├── ingest.py       Step 1 — connects to Azure Blob, lists and downloads recordings
├── transcribe.py   Step 2 — sends audio to ElevenLabs, labels each speaker
├── metrics.py      Step 3 — computes latency, hold time, interruptions from timestamps
├── flow_check.py   Step 4 — checks 7 compliance checkpoints via keyword matching
├── judge.py        Step 5 — builds the prompt, calls GPT-5.1, returns scored JSON
├── report.py       Step 6 — writes summary report locally, uploads JSON to Azure
├── run_eval.py     Entry point — the CLI that ties all steps together
└── rubrics/
    └── womens_health_aetna.md   The scoring rules for GPT-5.1 (editable, no code change)
```

### How each file works in plain English

| File | What it does |
|---|---|
| `ingest.py` | Talks to Azure Blob. Can list all 18 recordings or download one specific call. Deletes the WAV after the eval — no audio stored locally. |
| `transcribe.py` | Sends the WAV to ElevenLabs Scribe. Gets back every word with a timestamp and speaker label. Groups words into turns and figures out which speaker is Emily, which is the IVR, and which is the insurance rep. Saves the result so it never re-calls ElevenLabs on the same call. |
| `metrics.py` | No API calls — pure math on timestamps. Measures how fast Emily responds, how long she's on hold, whether anyone got interrupted, how much of the call she talked vs. listened. |
| `flow_check.py` | Reads the transcript and checks 7 required steps. Each checkpoint has a list of keywords to look for. Pass = keyword found in the right speaker's turn. Fail = never said. |
| `judge.py` | Assembles the full transcript, metrics, and flow results into a prompt. Sends it to GPT-5.1 with the scoring rubric. Gets back a structured JSON score — consistent, explainable, repeatable. |
| `report.py` | Takes all the scores and writes a clean markdown summary (`eval_summary.md`) you can open and read. Also writes a machine-readable JSON and uploads it to Azure Blob for the dashboard or any downstream system. |
| `run_eval.py` | The file you actually run. Has 4 commands: `list` (see all recordings), `uuids` (just the IDs), `run <uuid>` (eval one call), `batch --new-only` (eval everything not yet scored). |
| `rubrics/womens_health_aetna.md` | Not code — a plain-English document that tells GPT-5.1 exactly how to score each dimension. Want to change the scoring criteria? Edit this file. No code changes needed. |

### Output — every eval run produces 5 files

```
output/{eval_id}/
├── transcript.json     Full labeled transcript with speaker turns and timestamps
├── metrics.json        Signal metrics (latency, hold time, gaps, interruptions)
├── flow.json           Checkpoint results with evidence quotes from the transcript
├── eval_report.json    Complete structured report — uploaded to Azure Blob
└── eval_summary.md     Human-readable report — score, rationale, flagged moments
```

---

## Azure Setup

MOMUS uses three Azure services. No new infrastructure — all already in place for HRC.

```
┌─────────────────────────────────────────────────────┐
│                   Azure (hrcdevstg001)               │
│                                                      │
│  pdfs container                                      │
│  ├── calls/{uuid}/voice_recording.wav   ← INPUT      │
│  └── evals/{uuid}/eval_report.json      ← OUTPUT     │
│                                                      │
│  audit-logs container                                │
│  └── (existing audit data)                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              Azure OpenAI (hrc-11labs)               │
│                                                      │
│  Deployment: gpt-5.1                                 │
│  Used for:   scoring the call (Step 5 — Judge)       │
│  Cost:       $1.25/1M input + $10/1M output tokens   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              Azure Key Vault (outboundhrc)           │
│                                                      │
│  Stores all secrets the server needs at runtime:     │
│  - azure-openai-api-key                              │
│  - azure-openai-endpoint                             │
│  - azure-openai-deployment                           │
│  - audit-blob-connection-string                      │
│  - elevenlabs-api-key                                │
└─────────────────────────────────────────────────────┘
```

### External API

| Service | Used for | Cost |
|---|---|---|
| ElevenLabs Scribe v1 | Transcription + speaker diarization | ~$0.04/call |

---

## The 7 Mandatory Checkpoints

| # | Checkpoint |
|---|---|
| 1 | IVR navigated to correct department |
| 2 | Reached a human rep |
| 3 | Caller identified (NPI / practice name) |
| 4 | Patient credentials provided (DOB / member ID) |
| 5 | Eligibility and benefits requested |
| 6 | Required fields captured (deductible, OOP, co-pay, prior auth) |
| 7 | Call closed correctly (reference number, rep name) |

---

## The Scoring Rubric

| Dimension | Max Points | What it measures |
|---|---|---|
| Data Completeness | 30 | Did Emily collect all required insurance fields? |
| Conversation Quality | 20 | Was the call professional and natural? |
| Navigation Efficiency | 20 | Did she reach the right rep efficiently? |
| Error Recovery | 15 | Did she handle holds, transfers, conflicting info? |
| Call Closure | 15 | Did she close with a reference number and confirmation? |
| **Total** | **100** | |

---

## First Real Result

**Call:** 13.5-minute Aetna Women's Health benefits verification

| | |
|---|---|
| **Score** | 77 / 100 |
| **Flow** | 7 / 7 checkpoints passed |
| **Turns** | 69 (Agent, IVR, Rep — all correctly identified) |
| **Hold time** | 73 seconds |
| **Interruptions** | 0 |

**What MOMUS flagged:**
- Emily missed core financial fields — deductible, OOP max, copays
- Rep gave conflicting prior-auth information; Emily did not clarify

**What went well:**
- Professional tone throughout
- Reached the correct infertility team on first attempt
- Captured IVF/IUI coverage limits, cryopreservation, donor services
- Got rep name and reference number

---

## Cost

| Component | Per Call |
|---|---|
| ElevenLabs Scribe (transcription) | ~$0.04 |
| GPT-5.1 (scoring) | ~$0.05 |
| Azure Blob (storage) | ~$0.002 |
| **Total** | **~$0.09 / call** |

At 30 calls/day — **under $3/day, ~$90/month.**

---

## What We Have Today

- ✅ Full pipeline — all 6 steps working end-to-end
- ✅ Verified on real calls
- ✅ Reports uploaded to Azure automatically
- ✅ CLI to run on any call, or batch across all recordings
- ✅ 18 recordings in Azure, ready to evaluate

---

## Next Step — Deploy

Wire MOMUS into the live post-call pipeline so every new call is scored automatically — no manual steps, no delays.

**Timeline: within the week.**

---

*Built by Snehashis Ghosh — CyberSenz / CyberCare*

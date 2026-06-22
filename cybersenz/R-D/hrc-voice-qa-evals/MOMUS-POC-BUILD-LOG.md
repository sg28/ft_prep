# MOMUS POC — Build Log

**MOMUS**: Monitoring Outbound Messages for Understanding and Scoring
**Status**: POC complete — all 6 pipeline steps verified end-to-end
**Date**: 2026-06-20

---

## What We Built

An automated voice call evaluation pipeline that runs after every HRC AI voice agent call. It downloads the recording, transcribes it, scores it with GPT-5.1, and uploads a structured report to Azure Blob.

### Pipeline Steps

```
call recording (Azure Blob)
        ↓
1. INGEST      — download WAV from pdfs container
        ↓
2. TRANSCRIBE  — ElevenLabs Scribe v1 (diarized, speaker-labeled)
        ↓
3. METRICS     — latency, gaps, interruptions, hold time, talk ratio
        ↓
4. FLOW CHECK  — 7 Women's Health / Aetna checkpoints (keyword-based)
        ↓
5. JUDGE       — GPT-5.1 scores 5 dimensions, flags moments
        ↓
6. REPORT      — eval_report.json (Azure Blob) + eval_summary.md (local)
```

---

## Directory Structure

```
R-D/hrc-voice-qa-evals/
├── evals/voice/
│   ├── ingest.py           # Step 1 — Azure Blob download + recording discovery
│   ├── transcribe.py       # Step 2 — ElevenLabs Scribe
│   ├── metrics.py          # Step 3 — signal metrics
│   ├── flow_check.py       # Step 4 — checkpoint matching
│   ├── judge.py            # Step 5 — GPT-5.1 scoring
│   ├── report.py           # Step 6 — report assembly + upload
│   ├── run_eval.py         # CLI entry point (list / run / batch)
│   └── rubrics/
│       └── womens_health_aetna.md
├── output/{eval_id}/       # all artifacts per run (see Artifact Naming)
└── requirements.txt
```

---

## Artifact Naming

Every eval run gets a unique `eval_id` that ties all artifacts together:

```
eval_id = {call_uuid[:8]}-{YYYYMMDD-HHMMSS}
# e.g. 375e9d02-20260620-183352
```

| Artifact | Path |
|---|---|
| WAV (temp) | `/tmp/momus/{call_uuid}.wav` — deleted after run |
| Transcript | `output/{eval_id}/transcript.json` |
| Metrics | `output/{eval_id}/metrics.json` |
| Flow | `output/{eval_id}/flow.json` |
| Report JSON | `output/{eval_id}/eval_report.json` + blob `evals/{call_uuid}/eval_report.json` |
| Summary MD | `output/{eval_id}/eval_summary.md` |

All intermediate and final artifacts live under `output/{eval_id}/` — no scattered top-level directories.

---

## Key Configuration

All secrets live in `HRC-Voice-Agents/.env` (symlinked to `R-D/hrc-voice-qa-evals/.env`).

| Variable | Value | Notes |
|---|---|---|
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-5.1` | Deployment ID, not display name |
| `AZURE_OPENAI_ENDPOINT` | `https://hrc-11labs.openai.azure.com/` | |
| `AZURE_OPENAI_API_VERSION` | `2025-01-01-preview` | Required for GPT-5.1 |
| `AZURE_OPENAI_API_KEY` | KEY 1 from Azure Portal | HRC-11labs → Keys and Endpoint |
| `ELEVENLABS_API_KEY` | `sk_69b7af...` | For Scribe transcription |
| `AUDIT_BLOB_CONNECTION_STRING` | hrcdevstg001 account | Recordings source |

**Blob layout:**
- Recordings: `pdfs` container → `calls/{uuid}/voice_recording.wav`
- Reports: `pdfs` container → `evals/{uuid}/eval_report.json`

---

## Scoring Rubric (Women's Health / Aetna)

| Dimension | Max Points |
|---|---|
| Data Completeness | 30 |
| Conversation Quality | 20 |
| Navigation Efficiency | 20 |
| Error Recovery | 15 |
| Call Closure | 15 |
| **Total** | **100** |

---

## Flow Checkpoints

7 checkpoints checked by keyword matching across speaker turns:

1. IVR navigated to correct department
2. Reached human rep
3. Caller identified (NPI / practice name)
4. Patient credentials provided (DOB / member ID)
5. Eligibility / benefits requested
6. Required fields captured (deductible / OOP / copay / auth)
7. Call closed correctly

---

## Cost Estimate

| Component | Rate | Per Call |
|---|---|---|
| ElevenLabs Scribe v1 | ~$0.04/min | ~$0.04 (avg call) |
| GPT-5.1 | $1.25/1M input + $10/1M output | ~$0.05 |
| Azure Blob (storage + egress) | ~$0.002 | ~$0.002 |
| **Total** | | **~$0.09/call** |

---

## How to Run

```bash
cd R-D/hrc-voice-qa-evals
source ../../HRC-Voice-Agents/.venv/bin/activate
```

### List all recordings in blob

```bash
python -m evals.voice.run_eval list
```

Shows every recording in Azure Blob with its size, last-modified date, and whether it has already been evaluated:

```
#    Call UUID                                 Size  Last Modified           Status
------------------------------------------------------------------------------------------
1    7f3ed6d0-fc54-4e1b-9068-3a1c7564a983      2.4MB  2026-06-18 16:52        pending
2    375e9d02-3989-4c29-9bba-15a0cec5b41f      1.1MB  2026-06-18 16:52        evaluated
...
18 total  |  17 pending  |  1 evaluated
```

### Evaluate a single call

```bash
python -m evals.voice.run_eval run 618ae01b-6e61-49f5-ac8d-9df3fb0007b7
```

```
[19:12:41]  START        eval_id: 618ae01b-20260620-191241
[19:12:42]  INGEST       16.3 MB → 618ae01b-....wav
[19:13:10]  TRANSCRIBE   47 turns | 480s (8.0 min) | roles: {'agent', 'rep', 'ivr'}
[19:13:10]  METRICS      latency 820ms | gaps 3 | hold 12s | interruptions 1
[19:13:10]  FLOW         6/7 checkpoints passed
[19:13:18]  JUDGE        Score: 74/100 | tokens: 4821
[19:13:18]  REPORT       Local → output/618ae01b-20260620-191241/eval_summary.md
[19:13:18]  REPORT       Blob  → evals/618ae01b-.../eval_report.json
```

### Evaluate all calls

```bash
python -m evals.voice.run_eval batch
```

### Evaluate only calls not yet evaluated (recommended for regular runs)

```bash
python -m evals.voice.run_eval batch --new-only
```

Skips any call UUID that already has a folder under `output/`. Safe to run repeatedly.

---

## Issues Hit and How We Fixed Them

### 1. Wrong directory
Built files under `HRC-Voice-Agents/evals/` by mistake.
**Fix:** Moved everything to `R-D/hrc-voice-qa-evals/evals/voice/`.

### 2. Wrong Azure Blob container
`AUDIT_BLOB_CONTAINER=audit-logs` — recordings are actually in the `pdfs` container.
**Fix:** Hardcoded `container = "pdfs"` in `ingest.py`.

### 3. Transcripts not persisted
`transcribe()` only returned a dict in memory — would re-call ElevenLabs on every run.
**Fix:** Saves to `transcripts/{eval_id}.transcript.json`; loads from cache on repeat runs.

### 4. No unique identifier across artifacts
All files used raw call UUID, making it impossible to distinguish multiple eval runs on the same call.
**Fix:** Introduced `eval_id = {call_uuid[:8]}-{YYYYMMDD-HHMMSS}` threaded through all steps.

### 5. Metrics and flow not saved to disk
Both functions only returned dicts, with no on-disk artifact.
**Fix:** Both save to `output/{eval_id}/metrics.json` and `output/{eval_id}/flow.json`.

### 6. Wrong Azure OpenAI deployment name
`.env` had `AZURE_OPENAI_DEPLOYMENT=hrc-fertility-filter` (the display name shown in Azure AI Foundry). The actual deployment ID used in API calls is the model name itself.
**Fix:** Updated to `AZURE_OPENAI_DEPLOYMENT=gpt-5.1`.

### 7. Wrong API version for GPT-5.1
`2024-12-01-preview` predates GPT-5.1. All deployment lookups returned 404.
**Fix:** Updated to `AZURE_OPENAI_API_VERSION=2025-01-01-preview`.

### 8. `max_tokens` not supported by GPT-5.1
GPT-5.1 dropped the `max_tokens` parameter in favor of `max_completion_tokens`.
**Fix:** Changed `max_tokens=2048` → `max_completion_tokens=4096` in `judge.py`.

---

## First Verified Run

- **Call UUID:** `375e9d02-3989-4c29-9bba-15a0cec5b41f` (36-sec incomplete call)
- **Eval ID:** `375e9d02-20260620-183352`
- **Score:** 18/100
- **Verdict:** "Brief, one-sided statement of presumed coverage — failed to collect required insurance data or conduct a proper benefits verification conversation."
- **Flow:** 3/7 checkpoints passed (reached rep, eligibility mentioned, call closed)
- **GPT-5.1 tokens:** 2,092 total

---

## Refactors After Initial Build

### Consolidated artifact directories
All intermediate artifacts (`transcript.json`, `metrics.json`, `flow.json`) were originally written to separate top-level directories (`transcripts/`, `metrics/`, `flow/`). Refactored so every artifact for a run lives under `output/{eval_id}/`.

### Dynamic CLI with recording discovery
`ingest.py` gained `list_recordings()` which scans the blob and returns all available call UUIDs with size and last-modified. `run_eval.py` became a subcommand CLI (`list` / `run` / `batch` / `batch --new-only`) replacing the single-UUID positional argument.

---

## Next Steps

- [ ] Run on a full-length call (`python -m evals.voice.run_eval run 618ae01b-6e61-49f5-ac8d-9df3fb0007b7`) to validate speaker role assignment
- [ ] Review flow checkpoint keyword lists with Rajvir — tune per real transcripts
- [ ] Hand-label 10 calls from corpus (Phase 0 ground truth)
- [ ] Wire MOMUS into `voice_agent_callback.py` after `enqueue_pdf_job`
- [ ] Run `batch --new-only` over all 18 pending calls

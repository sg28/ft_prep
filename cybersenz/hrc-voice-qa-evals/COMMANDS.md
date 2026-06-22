# MOMUS — Command Reference

## Setup

```bash
cd /Users/snehashisghosh/Documents/snehashis/cybersenz/R-D/hrc-voice-qa-evals
source ../../HRC-Voice-Agents/.venv/bin/activate
```

---

## Commands

```bash
# List all recordings with size, date, and eval status
python -m evals.voice.run_eval list

# Print all call UUIDs (one per line)
python -m evals.voice.run_eval uuids

# Evaluate a single call
python -m evals.voice.run_eval run <uuid>

# Evaluate all calls
python -m evals.voice.run_eval batch

# Evaluate only calls not yet scored (recommended)
python -m evals.voice.run_eval batch --new-only
```

---

## Output

All artifacts are saved to `output/{eval_id}/`:

```
output/{eval_id}/
├── transcript.json
├── metrics.json
├── flow.json
├── eval_report.json    ← also uploaded to Azure Blob
└── eval_summary.md     ← human-readable report
```

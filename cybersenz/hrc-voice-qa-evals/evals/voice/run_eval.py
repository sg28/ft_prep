"""
MOMUS — voice call evaluation pipeline entry point.

Usage:
    python -m evals.voice.run_eval list                  # list all recordings in blob
    python -m evals.voice.run_eval run <uuid>            # eval one call
    python -m evals.voice.run_eval batch                 # eval all calls
    python -m evals.voice.run_eval batch --new-only      # eval only unevaluated calls
"""

import argparse
import json
import sys
import tempfile
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

from evals.voice.flow_check import check_flow
from evals.voice.ingest import download_recording, list_recordings
from evals.voice.judge import judge
from evals.voice.metrics import compute_metrics
from evals.voice.report import save_report
from evals.voice.transcribe import transcribe

OUTPUT_DIR = Path(__file__).parents[2] / "output"


def _log(step: str, msg: str) -> None:
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}]  {step:<12} {msg}", flush=True)


def _already_evaluated(call_uuid: str) -> bool:
    """Return True if any output folder exists for this call UUID."""
    return any(OUTPUT_DIR.glob(f"{call_uuid[:8]}-*"))


# ---------------------------------------------------------------------------
# Core pipeline
# ---------------------------------------------------------------------------

def run(call_uuid: str) -> dict:
    eval_id = f"{call_uuid[:8]}-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    _log("START", f"eval_id: {eval_id}")

    tmp_dir = Path(tempfile.gettempdir()) / "momus"
    tmp_dir.mkdir(exist_ok=True)

    output_dir = OUTPUT_DIR / eval_id
    output_dir.mkdir(parents=True, exist_ok=True)

    # 1 — Ingest
    _log("INGEST", f"Downloading recording {call_uuid[:8]}...")
    wav_path = download_recording(call_uuid, dest_dir=tmp_dir)
    size_mb = wav_path.stat().st_size / (1024 * 1024)
    _log("INGEST", f"{size_mb:.1f} MB → {wav_path.name}")

    # 2 — Transcribe
    _log("TRANSCRIBE", "Sending to ElevenLabs Scribe (this may take a minute)...")
    transcript = transcribe(wav_path, call_uuid, output_dir=output_dir)
    _log(
        "TRANSCRIBE",
        f"{len(transcript['turns'])} turns | "
        f"{transcript['duration_s']:.0f}s ({transcript['duration_s']/60:.1f} min) | "
        f"roles: {set(t['speaker'] for t in transcript['turns'])}",
    )

    # 3 — Metrics
    _log("METRICS", "Computing signal metrics...")
    metrics = compute_metrics(transcript, output_dir=output_dir)
    _log(
        "METRICS",
        f"latency {metrics['avg_agent_response_latency_ms']:.0f}ms | "
        f"gaps {len(metrics['silence_gaps'])} | "
        f"hold {metrics['total_hold_time_s']:.0f}s | "
        f"interruptions {metrics['interruptions']}",
    )

    # 4 — Flow check
    _log("FLOW", "Checking conversation checkpoints...")
    flow = check_flow(transcript, output_dir=output_dir)
    _log("FLOW", f"{flow['checkpoints_passed']}/{flow['checkpoints_total']} checkpoints passed")

    # 5 — Judge
    _log("JUDGE", "Sending to GPT-5.1 for scoring...")
    scored = judge(transcript, metrics, flow)
    _log(
        "JUDGE",
        f"Score: {scored['total_score']}/100 | "
        f"tokens: {scored.get('_tokens', {}).get('total', '?')} | "
        f"{scored.get('one_line_summary', '')}",
    )

    # 6 — Report
    _log("REPORT", "Assembling and uploading report...")
    paths = save_report(call_uuid, transcript, metrics, flow, scored, output_dir=output_dir)
    _log("REPORT", f"Local  → {paths['local_summary']}")
    _log("REPORT", f"Blob   → {paths['blob_path']}")

    wav_path.unlink(missing_ok=True)

    print(f"\n{'='*60}")
    print(f"  SCORE:   {scored['total_score']}/100")
    print(f"  SUMMARY: {scored.get('one_line_summary', '')}")
    print(f"  REPORT:  {paths['local_summary']}")
    print(f"{'='*60}\n")

    return {
        "eval_id": eval_id,
        "call_uuid": call_uuid,
        "score": scored["total_score"],
        **paths,
    }


# ---------------------------------------------------------------------------
# Subcommands
# ---------------------------------------------------------------------------

def cmd_uuids(_args) -> None:
    """Print all call UUIDs, one per line."""
    for r in list_recordings():
        print(r["call_uuid"])


def cmd_list(_args) -> None:
    """List all recordings available in blob storage."""
    print("Fetching recordings from Azure Blob...\n")
    recordings = list_recordings()
    if not recordings:
        print("No recordings found.")
        return

    print(f"{'#':<4} {'Call UUID':<38} {'Size':>7}  {'Last Modified':<22}  {'Status'}")
    print("-" * 90)
    for i, r in enumerate(recordings, 1):
        evaluated = _already_evaluated(r["call_uuid"])
        status = "evaluated" if evaluated else "pending"
        modified = r["last_modified"].strftime("%Y-%m-%d %H:%M") if r["last_modified"] else "—"
        print(f"{i:<4} {r['call_uuid']:<38} {r['size_mb']:>6.1f}MB  {modified:<22}  {status}")

    total = len(recordings)
    pending = sum(1 for r in recordings if not _already_evaluated(r["call_uuid"]))
    print(f"\n{total} total  |  {pending} pending  |  {total - pending} evaluated")


def cmd_run(args) -> None:
    """Eval a single call by UUID."""
    result = run(args.uuid)
    print(json.dumps(result, indent=2))


def cmd_batch(args) -> None:
    """Eval all calls, or only unevaluated ones with --new-only."""
    recordings = list_recordings()
    if not recordings:
        print("No recordings found in blob.")
        return

    if args.new_only:
        targets = [r for r in recordings if not _already_evaluated(r["call_uuid"])]
        print(f"Found {len(recordings)} recordings — {len(targets)} not yet evaluated.\n")
    else:
        targets = recordings
        print(f"Found {len(recordings)} recordings — evaluating all.\n")

    if not targets:
        print("Nothing to do.")
        return

    results = []
    for i, r in enumerate(targets, 1):
        print(f"\n[{i}/{len(targets)}] {r['call_uuid']}  ({r['size_mb']} MB)")
        try:
            result = run(r["call_uuid"])
            results.append({"status": "ok", **result})
        except Exception as e:
            print(f"  ERROR: {e}")
            results.append({"status": "error", "call_uuid": r["call_uuid"], "error": str(e)})

    ok = sum(1 for r in results if r["status"] == "ok")
    failed = len(results) - ok
    print(f"\nBatch complete: {ok} succeeded, {failed} failed.")
    if failed:
        for r in results:
            if r["status"] == "error":
                print(f"  FAILED: {r['call_uuid']} — {r['error']}")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        prog="python -m evals.voice.run_eval",
        description="MOMUS — voice call evaluation pipeline",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # uuids
    sub.add_parser("uuids", help="Print all call UUIDs, one per line")

    # list
    sub.add_parser("list", help="List all recordings in blob storage with size and status")

    # run
    p_run = sub.add_parser("run", help="Evaluate a single call")
    p_run.add_argument("uuid", help="Call UUID to evaluate")

    # batch
    p_batch = sub.add_parser("batch", help="Evaluate multiple calls")
    p_batch.add_argument(
        "--new-only",
        action="store_true",
        help="Skip calls that already have an output folder",
    )

    args = parser.parse_args()

    if args.command == "uuids":
        cmd_uuids(args)
    elif args.command == "list":
        cmd_list(args)
    elif args.command == "run":
        cmd_run(args)
    elif args.command == "batch":
        cmd_batch(args)


if __name__ == "__main__":
    main()

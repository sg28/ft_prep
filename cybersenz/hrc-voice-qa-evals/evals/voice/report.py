import json
import os
from datetime import datetime, timezone
from pathlib import Path

from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv

load_dotenv()


def _format_summary(
    call_uuid: str,
    transcript: dict,
    metrics: dict,
    flow: dict,
    scored: dict,
) -> str:
    duration_s = transcript["duration_s"]
    m, s = divmod(int(duration_s), 60)
    score = scored.get("total_score", 0)
    date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    dims = scored.get("dimensions", {})
    dim_rows = "\n".join(
        f"| {k.replace('_', ' ').title()} | {v['score']} | {v.get('rationale', '')} |"
        for k, v in dims.items()
    )

    flagged = sorted(
        scored.get("flagged_moments", []), key=lambda x: x.get("timestamp_s", 0)
    )
    flagged_lines = (
        "\n".join(
            f"- [{int(f['timestamp_s'])//60}:{int(f['timestamp_s'])%60:02d}] "
            f"{f['issue']} *({f['severity']})*"
            for f in flagged
        )
        or "None"
    )

    well_lines = "\n".join(f"- {w}" for w in scored.get("what_went_well", [])) or "- (none noted)"
    improve_lines = "\n".join(f"- {w}" for w in scored.get("what_to_improve", [])) or "- (none noted)"

    flow_lines = "\n".join(
        f"- {'✓' if cp['passed'] else '✗'} {cp['name']}"
        for cp in flow["checkpoints"]
    )

    return f"""# Eval Report — {call_uuid[:8]}...
**Date:** {date_str}  |  **Duration:** {m}m {s}s  |  **Score: {score}/100**

> {scored.get('one_line_summary', '')}

## Score Breakdown
| Dimension | Score | Rationale |
|---|---|---|
{dim_rows}

## Flow Checkpoints ({flow['checkpoints_passed']}/{flow['checkpoints_total']} passed)
{flow_lines}

## Flagged Moments
{flagged_lines}

## What Went Well
{well_lines}

## What to Improve
{improve_lines}

## Signal Metrics
| Metric | Value |
|---|---|
| Avg agent response latency | {metrics.get('avg_agent_response_latency_ms', 0):.0f}ms |
| Silence gaps (>2s) | {len(metrics.get('silence_gaps', []))} |
| Total hold time | {metrics.get('total_hold_time_s', 0):.0f}s |
| Interruptions | {metrics.get('interruptions', 0)} |
| Total turns | {metrics.get('total_turns', 0)} |
| Agent talk ratio | {metrics.get('agent_talk_ratio', 0):.0%} |
"""


def save_report(
    call_uuid: str,
    transcript: dict,
    metrics: dict,
    flow: dict,
    scored: dict,
    output_dir: Path = None,
) -> dict:
    """
    Assemble final report, write locally, and upload JSON to Azure Blob.

    Returns dict with local and blob paths.
    """
    report = {
        "call_uuid": call_uuid,
        "eval_timestamp": datetime.now(timezone.utc).isoformat(),
        "score": scored.get("total_score"),
        "dimensions": scored.get("dimensions"),
        "flagged_moments": scored.get("flagged_moments"),
        "what_went_well": scored.get("what_went_well"),
        "what_to_improve": scored.get("what_to_improve"),
        "one_line_summary": scored.get("one_line_summary"),
        "metrics": metrics,
        "flow": flow,
        "transcript": transcript,
        "_tokens_used": scored.get("_tokens"),
    }

    summary_md = _format_summary(call_uuid, transcript, metrics, flow, scored)

    if output_dir is None:
        output_dir = Path(__file__).parents[2] / "output" / call_uuid
    output_dir.mkdir(parents=True, exist_ok=True)

    report_path = output_dir / "eval_report.json"
    summary_path = output_dir / "eval_summary.md"

    report_path.write_text(json.dumps(report, indent=2))
    summary_path.write_text(summary_md)

    # Upload JSON report to Azure Blob
    connection_string = os.environ["AUDIT_BLOB_CONNECTION_STRING"]
    container = os.environ["AUDIT_BLOB_CONTAINER"]
    blob_path = f"evals/{call_uuid}/eval_report.json"

    client = BlobServiceClient.from_connection_string(connection_string)
    blob_client = client.get_blob_client(container=container, blob=blob_path)
    blob_client.upload_blob(
        json.dumps(report, indent=2).encode(),
        overwrite=True,
    )

    return {
        "local_report": str(report_path.resolve()),
        "local_summary": str(summary_path.resolve()),
        "blob_path": blob_path,
    }

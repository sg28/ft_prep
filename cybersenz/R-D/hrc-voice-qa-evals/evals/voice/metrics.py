import json
from pathlib import Path


def compute_metrics(transcript: dict, output_dir: Path = None) -> dict:
    """
    Compute signal-level metrics purely from transcript turn timestamps.
    No audio re-processing required.

    Returns:
        {
            "avg_agent_response_latency_ms": float,
            "silence_gaps": [{"start": float, "end": float, "duration_s": float}],
            "interruptions": int,
            "total_hold_time_s": float,
            "total_turns": int,
            "agent_talk_ratio": float,
        }
    """
    turns = transcript.get("turns", [])
    duration_s = transcript.get("duration_s", 0.0)

    if not turns:
        return {
            "avg_agent_response_latency_ms": 0.0,
            "silence_gaps": [],
            "interruptions": 0,
            "total_hold_time_s": 0.0,
            "total_turns": 0,
            "agent_talk_ratio": 0.0,
        }

    agent_latencies_ms: list[float] = []
    silence_gaps: list[dict] = []
    interruptions = 0
    total_agent_talk_s = 0.0

    for i, turn in enumerate(turns):
        if turn["speaker"] == "agent":
            total_agent_talk_s += turn["end"] - turn["start"]

        if i == 0:
            continue

        prev = turns[i - 1]
        gap_s = turn["start"] - prev["end"]

        if gap_s < 0:
            interruptions += 1
        elif gap_s > 2.0:
            silence_gaps.append({
                "start": round(prev["end"], 2),
                "end": round(turn["start"], 2),
                "duration_s": round(gap_s, 2),
            })

        if turn["speaker"] == "agent" and prev["speaker"] != "agent" and gap_s >= 0:
            agent_latencies_ms.append(gap_s * 1000)

    avg_latency_ms = (
        round(sum(agent_latencies_ms) / len(agent_latencies_ms), 1)
        if agent_latencies_ms
        else 0.0
    )

    total_hold_time_s = round(
        sum(g["duration_s"] for g in silence_gaps if g["duration_s"] > 10.0), 2
    )

    agent_talk_ratio = (
        round(total_agent_talk_s / duration_s, 3) if duration_s > 0 else 0.0
    )

    result = {
        "avg_agent_response_latency_ms": avg_latency_ms,
        "silence_gaps": silence_gaps,
        "interruptions": interruptions,
        "total_hold_time_s": total_hold_time_s,
        "total_turns": len(turns),
        "agent_talk_ratio": agent_talk_ratio,
    }

    if output_dir:
        output_dir.mkdir(parents=True, exist_ok=True)
        (output_dir / "metrics.json").write_text(json.dumps(result, indent=2))

    return result

import json
import os
from pathlib import Path

from dotenv import load_dotenv
from openai import AzureOpenAI

load_dotenv()

RUBRICS_DIR = Path(__file__).parent / "rubrics"

# Point caps per dimension — must match rubric
DIMENSION_CAPS = {
    "data_completeness": 30,
    "conversation_quality": 20,
    "navigation_efficiency": 20,
    "error_recovery": 15,
    "call_closure": 15,
}


def _load_rubric(rubric_name: str) -> str:
    path = RUBRICS_DIR / f"{rubric_name}.md"
    if not path.exists():
        raise FileNotFoundError(f"Rubric not found: {path}")
    return path.read_text()


def _build_prompt(transcript: dict, metrics: dict, flow: dict, rubric: str) -> str:
    turns_text = "\n".join(
        f"[{t['start']:.1f}s] {t['speaker'].upper()}: {t['text']}"
        for t in transcript["turns"]
    )

    flow_lines = "\n".join(
        ("PASS" if cp["passed"] else "FAIL") + f"  [{cp['id']}] {cp['name']}"
        + (f'  — evidence: "{cp["evidence_text"]}"' if cp.get("evidence_text") else "")
        for cp in flow["checkpoints"]
    )

    gaps_summary = (
        f"{len(metrics.get('silence_gaps', []))} silence gaps"
        f" (total hold {metrics.get('total_hold_time_s', 0):.0f}s)"
    )

    dim_caps = "\n".join(
        f"  - {k.replace('_', ' ')}: 0–{v} pts"
        for k, v in DIMENSION_CAPS.items()
    )

    return f"""You are a QA evaluator for HIPAA-compliant AI voice agents calling US health insurers on behalf of fertility clinics.

Evaluate the following completed call objectively. Return ONLY valid JSON — no markdown fences, no text outside the JSON object.

===TRANSCRIPT===
Call UUID: {transcript['call_uuid']}
Duration: {transcript['duration_s']:.0f}s ({transcript['duration_s']/60:.1f} min)

{turns_text}

===SIGNAL METRICS===
Avg agent response latency: {metrics.get('avg_agent_response_latency_ms', 0):.0f}ms
Silence gaps (>2s): {gaps_summary}
Interruptions: {metrics.get('interruptions', 0)}
Total turns: {metrics.get('total_turns', 0)}
Agent talk ratio: {metrics.get('agent_talk_ratio', 0):.0%}

===FLOW CHECKPOINT RESULTS===
{flow['checkpoints_passed']}/{flow['checkpoints_total']} passed
{flow_lines}

===SCORING RUBRIC===
{rubric}

===OUTPUT FORMAT===
Score each dimension within its cap:
{dim_caps}

Return exactly this JSON structure:
{{
  "total_score": <integer 0–100>,
  "dimensions": {{
    "data_completeness":     {{ "score": <0–30>, "rationale": "<1–2 sentences>" }},
    "conversation_quality":  {{ "score": <0–20>, "rationale": "<1–2 sentences>" }},
    "navigation_efficiency": {{ "score": <0–20>, "rationale": "<1–2 sentences>" }},
    "error_recovery":        {{ "score": <0–15>, "rationale": "<1–2 sentences>" }},
    "call_closure":          {{ "score": <0–15>, "rationale": "<1–2 sentences>" }}
  }},
  "flagged_moments": [
    {{ "timestamp_s": <number>, "issue": "<what went wrong>", "severity": "high|medium|low" }}
  ],
  "what_went_well": ["<string>"],
  "what_to_improve": ["<string>"],
  "one_line_summary": "<single sentence verdict on this call>"
}}

Important: total_score must equal the sum of all five dimension scores."""


def judge(
    transcript: dict,
    metrics: dict,
    flow: dict,
    rubric_name: str = "womens_health_aetna",
) -> dict:
    """Score the call using GPT-5.1 as the LLM judge. Returns structured scoring dict."""
    client = AzureOpenAI(
        api_key=os.environ["AZURE_OPENAI_API_KEY"],
        azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
        api_version=os.environ["AZURE_OPENAI_API_VERSION"],
    )
    deployment = os.environ["AZURE_OPENAI_DEPLOYMENT"]
    rubric = _load_rubric(rubric_name)
    prompt = _build_prompt(transcript, metrics, flow, rubric)

    response = client.chat.completions.create(
        model=deployment,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.1,
        max_completion_tokens=4096,
    )

    result = json.loads(response.choices[0].message.content)

    result["_tokens"] = {
        "prompt": response.usage.prompt_tokens,
        "completion": response.usage.completion_tokens,
        "total": response.usage.total_tokens,
    }

    return result

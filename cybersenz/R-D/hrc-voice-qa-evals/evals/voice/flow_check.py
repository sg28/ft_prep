import json
from pathlib import Path
from typing import Optional

# Women's Health / Aetna checkpoint list.
# Each checkpoint defines which speakers to scan and what keywords must appear.
# Review with Rajvir after first run — phrases may need tuning per real transcripts.
CHECKPOINTS = [
    {
        "id": 1,
        "name": "IVR navigated to correct department",
        "require_speaker": None,  # any speaker — confirms we heard the right menu
        "keywords": [
            "eligibility", "benefits", "provider services", "provider line",
            "press 1", "press one", "for eligibility", "for benefits",
        ],
    },
    {
        "id": 2,
        "name": "Reached human rep",
        "require_speaker": "rep",
        "keywords": [],  # presence of a rep turn is sufficient evidence
    },
    {
        "id": 3,
        "name": "Caller identified (NPI / practice name)",
        "require_speaker": "agent",
        "keywords": [
            "npi", "national provider", "huntington", "tax id", "taxpayer",
            "practice name", "provider name",
        ],
    },
    {
        "id": 4,
        "name": "Patient credentials provided (DOB / member ID)",
        "require_speaker": "agent",
        "keywords": [
            "date of birth", "member id", "member number", "subscriber id",
            "date of b", "d-o-b",
        ],
    },
    {
        "id": 5,
        "name": "Eligibility / benefits requested",
        "require_speaker": "agent",
        "keywords": [
            "eligibility", "eligible", "benefits", "covered", "coverage",
            "ivf", "infertility", "fertility", "in vitro",
        ],
    },
    {
        "id": 6,
        "name": "Required fields captured (deductible / OOP / co-pay / auth)",
        "require_speaker": None,  # agent asks, rep answers — check both
        "keywords": [
            "deductible", "out of pocket", "out-of-pocket", "co-pay", "copay",
            "co-insurance", "coinsurance", "prior auth", "prior authorization",
            "effective date", "group number", "group #",
        ],
    },
    {
        "id": 7,
        "name": "Call closed correctly",
        "require_speaker": "agent",
        "keywords": [
            "thank you", "thanks", "goodbye", "have a great", "have a good",
            "reference number", "confirmation number", "ref number",
        ],
    },
]


def _find_evidence(turns: list[dict], checkpoint: dict) -> Optional[int]:
    """Return the index of the first turn satisfying the checkpoint, or None."""
    require_speaker = checkpoint.get("require_speaker")
    keywords = [kw.lower() for kw in checkpoint["keywords"]]

    for i, turn in enumerate(turns):
        if require_speaker and turn["speaker"] != require_speaker:
            continue
        if not keywords:
            return i  # presence of the required speaker is sufficient
        text_lower = turn["text"].lower()
        if any(kw in text_lower for kw in keywords):
            return i

    return None


def check_flow(transcript: dict, output_dir: Path = None) -> dict:
    """
    Check the transcript against Women's Health / Aetna checkpoints.

    Returns:
        {
            "checkpoints": [{"id", "name", "passed", "evidence_turn", "evidence_text"}],
            "checkpoints_passed": int,
            "checkpoints_total": int,
        }
    """
    turns = transcript.get("turns", [])
    results = []

    for cp in CHECKPOINTS:
        evidence_idx = _find_evidence(turns, cp)
        passed = evidence_idx is not None
        results.append({
            "id": cp["id"],
            "name": cp["name"],
            "passed": passed,
            "evidence_turn": evidence_idx,
            "evidence_text": (
                turns[evidence_idx]["text"][:150] if evidence_idx is not None else None
            ),
        })

    passed_count = sum(1 for r in results if r["passed"])

    result = {
        "checkpoints": results,
        "checkpoints_passed": passed_count,
        "checkpoints_total": len(results),
    }

    if output_dir:
        output_dir.mkdir(parents=True, exist_ok=True)
        (output_dir / "flow.json").write_text(json.dumps(result, indent=2))

    return result

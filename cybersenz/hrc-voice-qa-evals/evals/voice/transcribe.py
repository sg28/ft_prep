import json
import os
from pathlib import Path

import httpx
from dotenv import load_dotenv

load_dotenv()

SCRIBE_URL = "https://api.elevenlabs.io/v1/speech-to-text"

# Keywords that suggest a turn belongs to the AI agent (Emily)
_AGENT_KEYWORDS = {
    "huntington reproductive", "huntington", "this is emily", "i'm calling on behalf",
    "i am calling on behalf", "calling for a patient", "npi number", "tax id",
    "provider", "i'm emily", "hi my name is emily",
}

# Keywords that suggest a turn belongs to the IVR system
_IVR_KEYWORDS = {
    "press 1", "press 2", "press 3", "para español", "please hold",
    "please wait", "one moment", "transferring your call", "your call",
    "estimated wait", "available representative", "thank you for calling",
    "for eligibility", "for benefits", "for provider", "say or press",
    "our menu", "main menu", "please listen", "options have changed",
}


def _group_words_into_turns(words: list[dict]) -> list[dict]:
    """Collapse consecutive same-speaker words into speaker turns."""
    turns = []
    current_speaker = None
    buf_text = []
    buf_start = None
    buf_end = None

    for w in words:
        if w.get("type") not in ("word", "spacing"):
            continue
        spk = w.get("speaker_id", "unknown")
        text_piece = w.get("text", "")

        if spk != current_speaker:
            if current_speaker is not None:
                combined = "".join(buf_text).strip()
                if combined:
                    turns.append({
                        "speaker_id": current_speaker,
                        "start": buf_start,
                        "end": buf_end,
                        "text": combined,
                    })
            current_speaker = spk
            buf_text = [text_piece]
            buf_start = w.get("start", 0.0)
            buf_end = w.get("end", 0.0)
        else:
            buf_text.append(text_piece)
            buf_end = w.get("end", buf_end)

    if current_speaker is not None:
        combined = "".join(buf_text).strip()
        if combined:
            turns.append({
                "speaker_id": current_speaker,
                "start": buf_start,
                "end": buf_end,
                "text": combined,
            })

    return turns


def _assign_roles(turns: list[dict]) -> dict[str, str]:
    """
    Map ElevenLabs speaker_ids to agent / ivr / rep roles.

    Strategy:
    - Score each speaker_id against agent and IVR keyword sets
    - Speaker with highest agent score → agent
    - Speaker with highest IVR score (excluding agent) → ivr
    - Everyone else → rep
    """
    speaker_data: dict[str, dict] = {}
    for t in turns:
        sid = t["speaker_id"]
        if sid not in speaker_data:
            speaker_data[sid] = {"full_text": "", "first_start": t["start"]}
        speaker_data[sid]["full_text"] += " " + t["text"].lower()

    for sid, data in speaker_data.items():
        txt = data["full_text"]
        data["agent_score"] = sum(1 for kw in _AGENT_KEYWORDS if kw in txt)
        data["ivr_score"] = sum(1 for kw in _IVR_KEYWORDS if kw in txt)

    # Agent: highest agent keyword score; tiebreak by earliest first_start
    agent_sid = max(
        speaker_data,
        key=lambda s: (speaker_data[s]["agent_score"], -speaker_data[s]["first_start"]),
    )

    role_map: dict[str, str] = {agent_sid: "agent"}

    # IVR: highest IVR score among remaining speakers
    remaining = {s: d for s, d in speaker_data.items() if s != agent_sid}
    if remaining:
        ivr_sid = max(remaining, key=lambda s: remaining[s]["ivr_score"])
        if remaining[ivr_sid]["ivr_score"] > 0:
            role_map[ivr_sid] = "ivr"

    # Rep: everything else
    for sid in speaker_data:
        if sid not in role_map:
            role_map[sid] = "rep"

    return role_map


def transcribe(wav_path: Path, call_uuid: str, num_speakers: int = 3, output_dir: Path = None) -> dict:
    """
    Send WAV to ElevenLabs Scribe, return structured transcript with labelled speaker turns.

    Saves transcript.json to output_dir so the pipeline can resume without
    re-calling ElevenLabs if it crashes after this step.

    Returns:
        {
            "call_uuid": str,
            "duration_s": float,
            "speaker_role_map": {"speaker_0": "agent", ...},
            "turns": [{"speaker": "agent", "start": 0.0, "end": 3.2, "text": "..."}, ...]
        }
    """
    cache_path = None
    if output_dir:
        output_dir.mkdir(parents=True, exist_ok=True)
        cache_path = output_dir / "transcript.json"

    if cache_path and cache_path.exists():
        print(f"  [transcribe] using cached transcript: {cache_path}")
        return json.loads(cache_path.read_text())

    api_key = os.environ["ELEVENLABS_API_KEY"]

    with open(wav_path, "rb") as f:
        response = httpx.post(
            SCRIBE_URL,
            headers={"xi-api-key": api_key},
            data={
                "model_id": "scribe_v1",
                "diarize": "true",
                "num_speakers": str(num_speakers),
                "language_code": "en",
            },
            files={"file": (wav_path.name, f, "audio/wav")},
            timeout=600.0,  # 45-min calls can take a while to process
        )

    response.raise_for_status()
    raw = response.json()

    words = raw.get("words", [])
    turns = _group_words_into_turns(words)

    if not turns:
        raise ValueError(f"ElevenLabs returned no transcript words for {call_uuid}")

    role_map = _assign_roles(turns)

    # Replace speaker_id with human-readable role
    labelled_turns = []
    for t in turns:
        labelled_turns.append({
            "speaker": role_map.get(t["speaker_id"], "rep"),
            "start": round(t["start"], 2),
            "end": round(t["end"], 2),
            "text": t["text"],
        })

    duration_s = labelled_turns[-1]["end"] if labelled_turns else 0.0

    result = {
        "call_uuid": call_uuid,
        "duration_s": round(duration_s, 2),
        "speaker_role_map": role_map,
        "turns": labelled_turns,
    }

    if cache_path:
        cache_path.write_text(json.dumps(result, indent=2))

    return result

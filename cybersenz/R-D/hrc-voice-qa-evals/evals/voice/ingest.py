import os
from pathlib import Path

from azure.core.exceptions import ResourceNotFoundError
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv

load_dotenv()

_CONTAINER = "pdfs"


def _get_client() -> BlobServiceClient:
    return BlobServiceClient.from_connection_string(os.environ["AUDIT_BLOB_CONNECTION_STRING"])


def list_recordings() -> list[dict]:
    """
    List all available call recordings in Azure Blob.

    Returns list of dicts sorted by last_modified descending:
        [{"call_uuid": str, "size_mb": float, "last_modified": datetime}, ...]
    """
    client = _get_client()
    container = client.get_container_client(_CONTAINER)

    recordings = []
    for blob in container.list_blobs(name_starts_with="calls/"):
        if not blob.name.endswith("/voice_recording.wav"):
            continue
        # blob.name = "calls/<uuid>/voice_recording.wav"
        call_uuid = blob.name.split("/")[1]
        recordings.append({
            "call_uuid": call_uuid,
            "size_mb": round(blob.size / (1024 * 1024), 1),
            "last_modified": blob.last_modified,
        })

    recordings.sort(key=lambda r: r["last_modified"], reverse=True)
    return recordings


def download_recording(call_uuid: str, dest_dir: Path = None) -> Path:
    """Download voice_recording.wav from Azure Blob to a local temp file."""
    blob_path = f"calls/{call_uuid}/voice_recording.wav"

    if dest_dir is None:
        dest_dir = Path(__file__).parents[2] / "recordings"
    dest_dir.mkdir(parents=True, exist_ok=True)

    local_path = dest_dir / f"{call_uuid}.wav"

    blob = _get_client().get_blob_client(container=_CONTAINER, blob=blob_path)

    try:
        with open(local_path, "wb") as f:
            blob.download_blob().readinto(f)
    except ResourceNotFoundError:
        raise FileNotFoundError(
            f"No recording found for call {call_uuid} — expected blob: {blob_path}"
        )

    return local_path

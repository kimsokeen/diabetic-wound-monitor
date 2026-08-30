"""
Wraps all Supabase calls the backend needs to make:
  - verifying the patient's login token (so random people can't POST as someone else)
  - uploading the original photo + mask overlay to Storage
  - inserting the result row into the submissions table
"""

import time
from supabase import create_client, Client

import config

_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        if not config.SUPABASE_URL or not config.SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set as environment variables."
            )
        _client = create_client(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY)
    return _client


def verify_user_token(access_token: str) -> str:
    """
    Verifies the JWT sent by the frontend and returns the authenticated user's id.
    Raises an exception if the token is invalid/expired.
    """
    client = get_client()
    user_response = client.auth.get_user(access_token)
    if not user_response or not user_response.user:
        raise ValueError("Invalid or expired session token.")
    return user_response.user.id


def upload_submission_files(
    patient_id: str, original_bytes: bytes, mask_bytes: bytes
) -> tuple[str, str]:
    """Uploads the original photo and mask overlay to Storage. Returns (image_path, mask_path)."""
    client = get_client()
    timestamp = int(time.time())
    image_path = f"{patient_id}/{timestamp}_original.jpg"
    mask_path = f"{patient_id}/{timestamp}_mask.png"

    client.storage.from_(config.SUPABASE_STORAGE_BUCKET).upload(
        image_path, original_bytes, {"content-type": "image/jpeg"}
    )
    client.storage.from_(config.SUPABASE_STORAGE_BUCKET).upload(
        mask_path, mask_bytes, {"content-type": "image/png"}
    )
    return image_path, mask_path


def insert_submission(
    patient_id: str,
    image_path: str,
    mask_path: str,
    wound_area_px: int,
    wound_area_percent: float,
) -> dict:
    """Inserts the analysis result as a new row and returns the created row."""
    client = get_client()
    result = (
        client.table("submissions")
        .insert(
            {
                "patient_id": patient_id,
                "image_url": image_path,
                "mask_url": mask_path,
                "wound_area_px": wound_area_px,
                "wound_area_percent": wound_area_percent,
            }
        )
        .execute()
    )
    return result.data[0]
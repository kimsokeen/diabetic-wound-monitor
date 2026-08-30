"""
FastAPI backend for the Diabetic Ulcer Monitoring app.

Endpoints:
  GET  /health            - simple check that the server + model are up
  POST /analyze            - upload a wound photo, get segmentation results back

Run locally with:  uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, File, UploadFile, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import model_utils
import supabase_client

app = FastAPI(title="Diabetic Ulcer Monitoring API")

# Allow the React frontend to call this API from the browser.
# Replace "*" with your actual Vercel URL once deployed, for better security.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    # Load the model once when the server boots, not on every request.
    model_utils.load_model()


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze_wound_photo(
    file: UploadFile = File(...),
    authorization: str = Header(..., description="Bearer <supabase_access_token>"),
):
    # --- 1. Verify the caller is actually a logged-in patient ---
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token.")
    access_token = authorization.removeprefix("Bearer ").strip()

    try:
        patient_id = supabase_client.verify_user_token(access_token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

    # --- 2. Read the uploaded photo ---
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # --- 3. Run the U-Net segmentation model ---
    try:
        result = model_utils.run_segmentation(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model inference failed: {e}")

    # --- 4. Upload photo + mask overlay to Supabase Storage ---
    image_path, mask_path = supabase_client.upload_submission_files(
        patient_id=patient_id,
        original_bytes=image_bytes,
        mask_bytes=result["mask_image_bytes"],
    )

    # --- 5. Save the result row to the database ---
    submission = supabase_client.insert_submission(
        patient_id=patient_id,
        image_path=image_path,
        mask_path=mask_path,
        wound_area_px=result["wound_area_px"],
        wound_area_percent=result["wound_area_percent"],
    )

    # --- 6. Respond to the frontend ---
    return {
        "submission_id": submission["id"],
        "wound_area_percent": result["wound_area_percent"],
        "image_url": image_path,
        "mask_url": mask_path,
        "created_at": submission["created_at"],
    }
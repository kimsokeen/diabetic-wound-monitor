"""
Central place to configure the segmentation model.
"""

import os
from dotenv import load_dotenv

load_dotenv()  # reads backend/.env into the environment so os.getenv() below can see it

# --- Model ---
MODEL_PATH = os.getenv("SEGMENTATION_MODEL_PATH", "models/foot_ulcer_model_mobilenet.keras")
MODEL_INPUT_SIZE = (256, 256)  # (height, width) the model expects.

# Binary segmentation model: output shape is (256, 256, 1) — wound vs. background.
CLASS_COLORS = {
    "wound": (220, 20, 60),  # crimson red, used to draw the overlay image
}

# --- Supabase ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_STORAGE_BUCKET = "wound-photos"
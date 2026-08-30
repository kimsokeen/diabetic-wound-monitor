"""
Handles loading the U-Net model and turning its raw prediction into
human-readable results: wound area % and a colored overlay image.
"""

import io
import numpy as np
from PIL import Image
import tensorflow as tf

import config

_model = None  # loaded once, reused across requests


def load_model():
    """Loads the .keras segmentation model into memory. Call this once at startup."""
    global _model
    if _model is None:
        print(f"Loading segmentation model from {config.MODEL_PATH} ...")
        _model = tf.keras.models.load_model(config.MODEL_PATH, compile=False)
        print("Model loaded.")
    return _model


def preprocess_image(image_bytes: bytes) -> tuple[np.ndarray, tuple[int, int]]:
    """Loads image bytes, returns (model-ready array, original (width, height))."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    original_size = image.size  # (width, height)

    resized = image.resize((config.MODEL_INPUT_SIZE[1], config.MODEL_INPUT_SIZE[0]))
    array = np.asarray(resized, dtype=np.float32) / 255.0
    array = np.expand_dims(array, axis=0)  # add batch dimension
    return array, original_size


def run_segmentation(image_bytes: bytes) -> dict:
    """
    Runs the model on an image and returns:
      - wound_area_percent: float
      - wound_area_px: int
      - mask_image_bytes: PNG bytes of the colored overlay (to upload/display)
    """
    model = load_model()
    input_array, original_size = preprocess_image(image_bytes)

    prediction = model.predict(input_array, verbose=0)[0]  # shape: (H, W, 1) for this binary model

    # Binary model: single channel, threshold at 0.5 -> 0 = background, 1 = wound
    class_map = (prediction[..., 0] > 0.5).astype(np.uint8)

    total_pixels = class_map.size
    wound_pixel_count = int(np.sum(class_map != 0))
    wound_area_percent = round((wound_pixel_count / total_pixels) * 100, 2)

    overlay_bytes = _build_overlay_image(class_map, original_size)

    return {
        "wound_area_px": wound_pixel_count,
        "wound_area_percent": wound_area_percent,
        "mask_image_bytes": overlay_bytes,
    }


def _build_overlay_image(class_map: np.ndarray, original_size: tuple[int, int]) -> bytes:
    """Turns the raw class index map into a colored PNG, resized back to the original photo size."""
    height, width = class_map.shape
    rgb = np.zeros((height, width, 3), dtype=np.uint8)
    rgb[class_map == 1] = config.CLASS_COLORS["wound"]

    overlay_image = Image.fromarray(rgb, mode="RGB").resize(original_size)

    buffer = io.BytesIO()
    overlay_image.save(buffer, format="PNG")
    return buffer.getvalue()
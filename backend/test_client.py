"""
Standalone script to manually test the /analyze endpoint end-to-end,
without needing the frontend running.

What it does:
  1. Logs in (or signs up, if the account doesn't exist yet) as a test patient
  2. Gets a real Supabase access token
  3. Sends your test image to the running backend's /analyze endpoint
  4. Prints the JSON result

Usage:
    python test_client.py path/to/your/test_photo.jpg

Requires backend/.env to have SUPABASE_URL and SUPABASE_ANON_KEY set
(the ANON key, not the service_role one — this script acts as a regular user,
just like the frontend would).
"""

import os
import sys
from dotenv import load_dotenv
import requests
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# Feel free to change these — this account will be created automatically
# the first time you run this script.
TEST_EMAIL = "test-patient@example.com"
TEST_PASSWORD = "testpassword123"


def get_access_token() -> str:
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        sys.exit(
            "Missing SUPABASE_URL or SUPABASE_ANON_KEY in backend/.env.\n"
            "Add SUPABASE_ANON_KEY (the 'anon public' key from Supabase > Settings > API) "
            "alongside your existing SUPABASE_SERVICE_ROLE_KEY."
        )

    client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

    try:
        result = client.auth.sign_in_with_password(
            {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        print(f"Logged in as existing test user ({TEST_EMAIL})")
    except Exception:
        print(f"Test user doesn't exist yet — signing up ({TEST_EMAIL})...")
        result = client.auth.sign_up(
            {
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "options": {"data": {"full_name": "Test Patient", "role": "patient"}},
            }
        )

    if not result.session:
        sys.exit(
            "Signed up, but no session was returned — this usually means email "
            "confirmation is still turned ON in Supabase. Go to Authentication > "
            "Providers > Email and turn off 'Confirm email', then run this again."
        )

    return result.session.access_token


def analyze_image(image_path: str, token: str):
    if not os.path.exists(image_path):
        sys.exit(f"Image not found: {image_path}")

    with open(image_path, "rb") as f:
        files = {"file": (os.path.basename(image_path), f, "image/jpeg")}
        headers = {"Authorization": f"Bearer {token}"}
        print(f"Sending {image_path} to {BACKEND_URL}/analyze ...")
        response = requests.post(f"{BACKEND_URL}/analyze", headers=headers, files=files)

    print(f"\nStatus code: {response.status_code}")
    try:
        print("Response:", response.json())
    except ValueError:
        print("Raw response:", response.text)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Usage: python test_client.py path/to/image.jpg")

    token = get_access_token()
    analyze_image(sys.argv[1], token)

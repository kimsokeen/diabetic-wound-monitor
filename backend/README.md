# Backend — Diabetic Ulcer Monitoring API

FastAPI service that runs your U-Net segmentation model and saves results to Supabase.

## 1. Set up Supabase (do this first)

1. Create a free project at https://supabase.com
2. Go to **SQL Editor** → paste the contents of `../database/schema.sql` → Run
3. Go to **Project Settings → API** and copy:
   - Project URL → `SUPABASE_URL`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY` (NOT the `anon` key — this one bypasses Row Level Security so the backend can write on behalf of users)

## 2. Add your model

Put your trained `.keras` U-Net file in `backend/models/unet_segmentation.keras`
(or update `SEGMENTATION_MODEL_PATH` in `.env` if you name it differently).

## 3. Run locally

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\Activate.ps1
pip install -r requirements.txt

cp .env.example .env
# then edit .env and fill in your real Supabase values

uvicorn main:app --reload --port 8000
```

> **Windows PowerShell users:** if `venv\Scripts\Activate.ps1` gives a "running
> scripts is disabled" error, run this once, then try activating again:
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```
> Also, PowerShell has no `cp` command — use `copy .env.example .env` instead.

Visit http://localhost:8000/docs — FastAPI's auto-generated test UI. You can
try the `/analyze` endpoint there directly (you'll need a real Supabase access
token from a logged-in user, which the frontend will provide once it's built).

## 4. Deploy for free (Render)

Note: Hugging Face Spaces changed their pricing in mid-2026 — Docker Spaces now
require a paid plan, so we're using Render instead. Its free tier has a real
limitation worth knowing upfront: only 512MB RAM, which is on the low end for
TensorFlow. Your model is relatively lightweight (MobileNet-based), so it has
a good chance of fitting — but if the deploy crashes with an out-of-memory
error, that's what's happening, and we'll move to a platform with more RAM
(Google Cloud Run) at that point.

1. Push your whole project (this repo) to a GitHub repository — Render deploys directly from GitHub.
2. Create a free account at https://render.com (no credit card needed for this tier)
3. Click **New +** → **Web Service** → connect your GitHub repo
4. Configure:
   - **Root Directory:** `backend`
   - **Environment:** `Docker` (Render will detect and use your `Dockerfile`)
   - **Instance Type:** `Free`
5. Under **Environment Variables**, add:
   - `SUPABASE_URL` = your Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your service_role key
6. Click **Create Web Service**. The first deploy takes a few minutes (installing TensorFlow is slow). Watch the build logs for errors.
7. Once live, your API is at `https://your-service-name.onrender.com`

**Important free-tier behavior:** the service sleeps after 15 minutes of no
traffic, and the next request takes about 30-60 seconds to wake it back up.
That's normal — not a bug. Don't worry about it for testing/school-project use.

**If the deploy crashes or the app immediately restarts in a loop**, check the
logs for "Out of memory" or "killed" — that confirms the 512MB ceiling was hit,
and we'll switch you to Google Cloud Run instead.

## Notes

- The `/analyze` endpoint expects a `Bearer <supabase_access_token>` header —
  this comes from the patient's logged-in session in the frontend.
# Diabetic Ulcer Monitoring App

## Architecture

```
frontend/   React + Tailwind, deployed free on Vercel
backend/    FastAPI running your U-Net model, deployed free on Hugging Face Spaces
database/   Supabase (Postgres + Auth + Storage + Realtime) — schema.sql sets it all up
```

Classification model is not used in this build (segmentation only), per your decision —
users are already diagnosed diabetic patients, so classifying "is this an ulcer" was skipped.

## Setup order (do this first-to-last)

1. **`database/schema.sql`** → run in your new Supabase project's SQL Editor
2. **`backend/`** → follow `backend/README.md` to add your model, run locally, then deploy to Hugging Face Spaces
3. **`frontend/`** → follow `frontend/README.md` to connect it to Supabase + your backend, run locally, then deploy to Vercel

## Still open

- `backend/config.py` has a **placeholder** for your U-Net's output classes
  (currently assumes background/granulation/slough/necrotic). Update this once
  you confirm your model's real class structure — nothing else in the backend
  needs to change when you do.
- Email confirmation is on by default in Supabase — fine for testing, but you
  may want to turn it off during development (Authentication → Providers → Email)
  so you don't need to click a confirmation link every time you test signup.

## What's already handled

- Patient/caregiver signup with role selection, auto-generated patient passkey
- Row Level Security so patients only see their own data, and caregivers only
  see patients they've been explicitly linked to (via a secure passkey-check
  function, not exposed in the client)
- Photo upload → segmentation → wound area % + tissue color % → saved to DB
- History view with photos, timestamps, and results (patient + caregiver)
- Realtime 1:1 chat between a patient and each linked caregiver

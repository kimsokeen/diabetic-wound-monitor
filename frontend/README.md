# Frontend — Diabetic Ulcer Monitoring App

React (Vite) + Tailwind CSS + Supabase.

## 1. Install

```bash
cd frontend
npm install
```

## 2. Configure

```bash
cp .env.example .env
```

Fill in `.env`:
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — from Supabase Project Settings → API
  (use the **anon public** key here, NOT the service_role one — that one only belongs in the backend)
- `VITE_BACKEND_URL` — `http://localhost:8000` while developing, then your Hugging Face Space URL once deployed

## 3. Run locally

```bash
npm run dev
```

Visit http://localhost:5173

## 4. Try it out

1. Sign up as a **patient** — check your email for the confirmation link (Supabase sends this automatically)
2. Log in, note the **ID and passkey** shown at the top of the dashboard
3. Open an incognito window, sign up as a **caregiver**
4. In the caregiver dashboard, paste the patient's ID + passkey to link them
5. As the patient, upload a wound photo — you'll need the backend running (see `../backend/README.md`)
6. Try the chat from both sides

## 5. Deploy for free (Vercel)

1. Push this whole project to a GitHub repo
2. Go to https://vercel.com → New Project → import your repo
3. Set the **Root Directory** to `frontend`
4. Add the same three environment variables from your `.env` in Vercel's project settings
5. Deploy — Vercel gives you a free `.vercel.app` URL

Once deployed, come back to your Supabase project's **Authentication → URL Configuration**
and add your Vercel URL to the allowed redirect URLs, or email confirmation links won't work correctly.

## Project structure

```
src/
  lib/supabaseClient.js       - Supabase connection + signed URL helper
  context/AuthContext.jsx     - login/signup/session state, available everywhere via useAuth()
  components/
    AuthPage.jsx               - login + signup form
    shared/                    - UI.jsx (buttons/inputs/cards), ChatPanel.jsx (realtime chat)
    patient/                   - UploadPhoto, SubmissionHistory, CaregiverList, PatientDashboard
    caregiver/                 - PatientSearch, PatientList, CaregiverDashboard
```

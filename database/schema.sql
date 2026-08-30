-- ============================================================
-- Diabetic Ulcer Monitoring App — Supabase Schema
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

-- 1. PROFILES
-- Extends Supabase's built-in auth.users with app-specific info.
-- Every signed-up user (patient or caregiver) gets a row here.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('patient', 'caregiver')),
  full_name text not null,
  -- Only used for patients: a secret code caregivers must enter to link.
  -- Generated automatically on signup (see trigger below).
  passkey text unique,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A user can always see and edit their own profile.
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- A caregiver can view the profile of a patient they're linked to
-- (needed to show the patient's name in the caregiver dashboard).
create policy "Caregivers can view linked patients"
  on public.profiles for select
  using (
    exists (
      select 1 from public.caregiver_links cl
      where cl.caregiver_id = auth.uid()
      and cl.patient_id = profiles.id
    )
  );

-- A patient can view the profile of a caregiver linked to them
-- (needed to show the caregiver's name in the patient's chat list).
create policy "Patients can view linked caregivers"
  on public.profiles for select
  using (
    exists (
      select 1 from public.caregiver_links cl
      where cl.patient_id = auth.uid()
      and cl.caregiver_id = profiles.id
    )
  );

-- 2. CAREGIVER LINKS
-- Created once a caregiver successfully enters a patient's ID + passkey.
-- After that, the caregiver doesn't need to re-enter it.
create table public.caregiver_links (
  id uuid primary key default gen_random_uuid(),
  caregiver_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid not null references public.profiles(id) on delete cascade,
  linked_at timestamptz not null default now(),
  unique (caregiver_id, patient_id)
);

alter table public.caregiver_links enable row level security;

create policy "Caregivers can view their own links"
  on public.caregiver_links for select
  using (auth.uid() = caregiver_id);

create policy "Caregivers can create links"
  on public.caregiver_links for insert
  with check (auth.uid() = caregiver_id);

create policy "Patients can view who's linked to them"
  on public.caregiver_links for select
  using (auth.uid() = patient_id);

-- 3. SUBMISSIONS
-- One row per photo a patient uploads, with the model's results.
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  image_url text not null,          -- path in Supabase Storage
  mask_url text,                    -- path to the segmentation overlay image
  wound_area_px integer,            -- raw pixel count of wound region
  wound_area_percent numeric(6,3),  -- % of total image area covered by wound
  color_distribution jsonb,         -- e.g. {"granulation": 62.5, "slough": 30.1, "necrotic": 7.4}
  created_at timestamptz not null default now()
);

alter table public.submissions enable row level security;

create policy "Patients can view own submissions"
  on public.submissions for select
  using (auth.uid() = patient_id);

create policy "Patients can insert own submissions"
  on public.submissions for insert
  with check (auth.uid() = patient_id);

create policy "Linked caregivers can view patient submissions"
  on public.submissions for select
  using (
    exists (
      select 1 from public.caregiver_links cl
      where cl.caregiver_id = auth.uid()
      and cl.patient_id = submissions.patient_id
    )
  );

-- 4. MESSAGES
-- Simple 1:1 chat between a patient and a caregiver.
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  caregiver_id uuid not null references public.profiles(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table public.messages enable row level security;

create policy "Participants can view their messages"
  on public.messages for select
  using (auth.uid() = patient_id or auth.uid() = caregiver_id);

create policy "Participants can send messages"
  on public.messages for insert
  with check (
    (auth.uid() = patient_id or auth.uid() = caregiver_id)
    and auth.uid() = sender_id
  );

-- 5. AUTO-CREATE PROFILE + PASSKEY ON SIGNUP
-- Reads role/full_name out of the signup metadata (see frontend signup code)
-- and generates a random 8-character passkey for patients.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  generated_passkey text;
begin
  if (new.raw_user_meta_data->>'role') = 'patient' then
    generated_passkey := upper(substr(md5(random()::text), 1, 8));
  else
    generated_passkey := null;
  end if;

  insert into public.profiles (id, role, full_name, passkey)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'patient'),
    coalesce(new.raw_user_meta_data->>'full_name', 'Unnamed User'),
    generated_passkey
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. LINK PATIENT BY PASSKEY (secure RPC)
-- Caregivers can't SELECT a patient's profile directly until a link exists
-- (see RLS policy above) — that's intentional, so passkeys can't be
-- brute-forced by scanning the profiles table. Instead, the frontend calls
-- this function, which checks the passkey server-side and creates the link
-- if it matches. Returns the patient's name on success, or raises an error.
create or replace function public.link_patient_by_passkey(
  patient_id_input uuid,
  passkey_input text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_name text;
begin
  select full_name into matched_name
  from public.profiles
  where id = patient_id_input
    and passkey = passkey_input
    and role = 'patient';

  if matched_name is null then
    raise exception 'No patient found with that ID and passkey.';
  end if;

  insert into public.caregiver_links (caregiver_id, patient_id)
  values (auth.uid(), patient_id_input)
  on conflict (caregiver_id, patient_id) do nothing;

  return matched_name;
end;
$$;

-- Only logged-in users can call it (not the public "anon" role).
revoke execute on function public.link_patient_by_passkey(uuid, text) from public;
grant execute on function public.link_patient_by_passkey(uuid, text) to authenticated;

-- 7. STORAGE BUCKET for wound photos
-- (Run this part too — creates a private bucket; access controlled via signed URLs)
insert into storage.buckets (id, name, public)
values ('wound-photos', 'wound-photos', false)
on conflict (id) do nothing;

create policy "Patients can upload own photos"
  on storage.objects for insert
  with check (
    bucket_id = 'wound-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Patients can view own photos"
  on storage.objects for select
  using (
    bucket_id = 'wound-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Linked caregivers can view patient photos"
  on storage.objects for select
  using (
    bucket_id = 'wound-photos'
    and exists (
      select 1 from public.caregiver_links cl
      where cl.caregiver_id = auth.uid()
      and cl.patient_id::text = (storage.foldername(name))[1]
    )
  );

-- 8. ENABLE REALTIME on messages (for live chat updates)
alter publication supabase_realtime add table public.messages;

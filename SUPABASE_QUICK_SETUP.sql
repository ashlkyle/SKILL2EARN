-- SKILL2EARN minimal demo database
-- Run this entire file in Supabase Dashboard > SQL Editor > New query.
-- Uses only profiles, companies, jobs, applications, and saved_jobs.
-- Never put a Supabase service_role/secret key in frontend code.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null check (role in ('student','employer','admin')),
  school text,
  course text,
  bio text,
  company_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text default '',
  verification_status text not null default 'Not required for demo',
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  skills text[] not null default '{}',
  budget text not null,
  work_arrangement text default 'Flexible',
  duration text default '',
  status text not null default 'open' check (status in ('open','closed','draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','rejected','withdrawn')),
  created_at timestamptz not null default now(),
  unique (job_id, student_id)
);

create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (student_id, job_id)
);

-- Create a profile automatically after every successful Supabase signup.
create or replace function public.handle_new_skill2earn_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role, school, course, company_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when new.raw_user_meta_data ->> 'role' in ('student','employer','admin')
      then new.raw_user_meta_data ->> 'role' else 'student' end,
    nullif(new.raw_user_meta_data ->> 'school',''),
    nullif(new.raw_user_meta_data ->> 'course',''),
    nullif(new.raw_user_meta_data ->> 'company_name','')
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    role = excluded.role,
    school = coalesce(excluded.school, public.profiles.school),
    course = coalesce(excluded.course, public.profiles.course),
    company_name = coalesce(excluded.company_name, public.profiles.company_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_skill2earn on auth.users;
create trigger on_auth_user_created_skill2earn
after insert on auth.users
for each row execute procedure public.handle_new_skill2earn_user();

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.saved_jobs enable row level security;

-- Profiles: users can read and update only their own profile.
drop policy if exists "skill2earn profile read own" on public.profiles;
create policy "skill2earn profile read own" on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists "skill2earn profile update own" on public.profiles;
create policy "skill2earn profile update own" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Companies: owners manage their own client/company profile.
drop policy if exists "skill2earn company read own" on public.companies;
create policy "skill2earn company read own" on public.companies for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists "skill2earn company insert own" on public.companies;
create policy "skill2earn company insert own" on public.companies for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists "skill2earn company update own" on public.companies;
create policy "skill2earn company update own" on public.companies for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

-- Jobs: authenticated users can browse; employers can manage their own listings.
drop policy if exists "skill2earn jobs browse" on public.jobs;
create policy "skill2earn jobs browse" on public.jobs for select to authenticated using (status = 'open' or employer_id = (select auth.uid()));
drop policy if exists "skill2earn jobs insert own" on public.jobs;
create policy "skill2earn jobs insert own" on public.jobs for insert to authenticated with check (employer_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'employer'));
drop policy if exists "skill2earn jobs update own" on public.jobs;
create policy "skill2earn jobs update own" on public.jobs for update to authenticated using (employer_id = (select auth.uid())) with check (employer_id = (select auth.uid()));
drop policy if exists "skill2earn jobs delete own" on public.jobs;
create policy "skill2earn jobs delete own" on public.jobs for delete to authenticated using (employer_id = (select auth.uid()));

-- Applications: students create/read their own; employers read/update applications for their own jobs.
drop policy if exists "skill2earn applications read student or employer" on public.applications;
create policy "skill2earn applications read student or employer" on public.applications for select to authenticated using (
  student_id = (select auth.uid()) or exists (select 1 from public.jobs j where j.id = job_id and j.employer_id = (select auth.uid()))
);
drop policy if exists "skill2earn applications insert own" on public.applications;
create policy "skill2earn applications insert own" on public.applications for insert to authenticated with check (
  student_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'student') and exists (select 1 from public.jobs j where j.id = job_id and j.status = 'open')
);
drop policy if exists "skill2earn applications employer update" on public.applications;
create policy "skill2earn applications employer update" on public.applications for update to authenticated using (
  exists (select 1 from public.jobs j where j.id = job_id and j.employer_id = (select auth.uid()))
) with check (
  exists (select 1 from public.jobs j where j.id = job_id and j.employer_id = (select auth.uid()))
);

-- Saved jobs are optional in the demo, but the student dashboard supports them.
drop policy if exists "skill2earn saved jobs read own" on public.saved_jobs;
create policy "skill2earn saved jobs read own" on public.saved_jobs for select to authenticated using (student_id = (select auth.uid()));
drop policy if exists "skill2earn saved jobs insert own" on public.saved_jobs;
create policy "skill2earn saved jobs insert own" on public.saved_jobs for insert to authenticated with check (student_id = (select auth.uid()));
drop policy if exists "skill2earn saved jobs delete own" on public.saved_jobs;
create policy "skill2earn saved jobs delete own" on public.saved_jobs for delete to authenticated using (student_id = (select auth.uid()));

create index if not exists skill2earn_jobs_created_at_idx on public.jobs (created_at desc);
create index if not exists skill2earn_applications_student_idx on public.applications (student_id, created_at desc);
create index if not exists skill2earn_applications_job_idx on public.applications (job_id, created_at desc);

-- Demo seed jobs are intentionally not inserted here: the employer account should create them in the UI.

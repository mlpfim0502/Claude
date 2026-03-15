-- UAE Golden Visa Client Portal Schema
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  role text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Application stages enum
create type application_stage as enum (
  'intake',
  'attestation',
  'submission',
  'medical',
  'emirates_id',
  'completed'
);

-- Client applications table
create table public.applications (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.profiles(id) on delete cascade not null,
  stage application_stage not null default 'intake',
  notes text,
  gpa numeric(3,2),
  degree_field text,
  graduation_year integer,
  university text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Document types enum
create type document_type as enum (
  'passport',
  'degree_certificate',
  'transcripts',
  'photo',
  'medical_exam',
  'other'
);

-- Document status enum
create type document_status as enum (
  'pending',
  'uploaded',
  'received',
  'verified',
  'rejected'
);

-- Documents table
create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid references public.applications(id) on delete cascade not null,
  client_id uuid references public.profiles(id) on delete cascade not null,
  doc_type document_type not null,
  status document_status not null default 'pending',
  file_path text,
  file_name text,
  file_size bigint,
  mime_type text,
  admin_notes text,
  uploaded_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Admin notes / CRM notes per client
create table public.client_notes (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.profiles(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete set null,
  content text not null,
  created_at timestamptz not null default now()
);

-- Updated_at trigger function
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_applications_updated_at before update on public.applications
  for each row execute function public.set_updated_at();

create trigger set_documents_updated_at before update on public.documents
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.documents enable row level security;
alter table public.client_notes enable row level security;

-- Profiles RLS
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Applications RLS
create policy "Clients can view own application"
  on public.applications for select
  using (auth.uid() = client_id);

create policy "Admins can view all applications"
  on public.applications for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins can update all applications"
  on public.applications for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Documents RLS
create policy "Clients can view own documents"
  on public.documents for select
  using (auth.uid() = client_id);

create policy "Clients can insert own documents"
  on public.documents for insert
  with check (auth.uid() = client_id);

create policy "Admins can view all documents"
  on public.documents for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins can update all documents"
  on public.documents for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Client notes RLS (admin only)
create policy "Admins can manage client notes"
  on public.client_notes for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');

  -- Auto-create application for new client
  insert into public.applications (client_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage bucket policies (run after creating bucket in Supabase dashboard)
-- Bucket name: documents
-- Clients can upload to their own folder: {client_id}/
-- Admins can read all

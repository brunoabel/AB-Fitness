-- Migration: Suporte a Wearables e Biometria de Atleta (Whoop & Fitbit)
-- Data: 2026-11-22

-- 1. Tabela de Conexões de Wearables
create table if not exists public.wearable_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('whoop', 'fitbit')),
  status text not null default 'connected' check (status in ('connected', 'disconnected', 'simulated')),
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  metadata jsonb default '{}'::jsonb,
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz not null default now(),
  unique (user_id, provider)
);

-- Índices de consulta rápida
create index if not exists idx_wearable_connections_user on public.wearable_connections(user_id);

-- 2. Tabela de Biometria Diária do Atleta
create table if not exists public.athlete_biometrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  provider text not null check (provider in ('whoop', 'fitbit', 'composite')),
  recovery_score integer check (recovery_score >= 0 and recovery_score <= 100),
  hrv_ms numeric(6, 2),
  resting_hr_bpm integer check (resting_hr_bpm > 20 and resting_hr_bpm < 250),
  sleep_score integer check (sleep_score >= 0 and sleep_score <= 100),
  sleep_duration_seconds integer check (sleep_duration_seconds >= 0),
  day_strain numeric(4, 2) check (day_strain >= 0 and day_strain <= 21),
  calories_burned integer check (calories_burned >= 0),
  raw_data jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date, provider)
);

create index if not exists idx_athlete_biometrics_user_date on public.athlete_biometrics(user_id, date desc);

-- 3. Row Level Security (RLS)
alter table public.wearable_connections enable row level security;
alter table public.athlete_biometrics enable row level security;

-- Políticas de Conexões
drop policy if exists "wearables_select_own" on public.wearable_connections;
create policy "wearables_select_own"
  on public.wearable_connections for select
  using (auth.uid() = user_id);

drop policy if exists "wearables_insert_own" on public.wearable_connections;
create policy "wearables_insert_own"
  on public.wearable_connections for insert
  with check (auth.uid() = user_id);

drop policy if exists "wearables_update_own" on public.wearable_connections;
create policy "wearables_update_own"
  on public.wearable_connections for update
  using (auth.uid() = user_id);

drop policy if exists "wearables_delete_own" on public.wearable_connections;
create policy "wearables_delete_own"
  on public.wearable_connections for delete
  using (auth.uid() = user_id);

-- Políticas de Biometria
drop policy if exists "biometrics_select_own" on public.athlete_biometrics;
create policy "biometrics_select_own"
  on public.athlete_biometrics for select
  using (auth.uid() = user_id);

drop policy if exists "biometrics_insert_own" on public.athlete_biometrics;
create policy "biometrics_insert_own"
  on public.athlete_biometrics for insert
  with check (auth.uid() = user_id);

drop policy if exists "biometrics_update_own" on public.athlete_biometrics;
create policy "biometrics_update_own"
  on public.athlete_biometrics for update
  using (auth.uid() = user_id);


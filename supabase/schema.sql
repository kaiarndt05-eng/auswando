-- ============================================================
-- Auswando – Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Profiles (one per auth user, auto-created on first sync)
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  username    text,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- 2. User progress (roadmap state, country selection, emigration date)
create table if not exists public.user_progress (
  id               uuid primary key references auth.users on delete cascade,
  selected_country text not null default 'pt',
  completed_steps  jsonb not null default '{"pt":[],"es":[],"ch":[]}'::jsonb,
  emigration_date  text,
  updated_at       timestamptz default now()
);

-- 3. Community posts
create table if not exists public.community_posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  country_id  text not null,
  content     text not null,
  likes       integer not null default 0,
  created_at  timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles        enable row level security;
alter table public.user_progress   enable row level security;
alter table public.community_posts enable row level security;

-- Profiles: users can only read/write their own row
create policy "profiles: own row" on public.profiles
  for all using (auth.uid() = id);

-- Progress: users can only read/write their own row
create policy "progress: own row" on public.user_progress
  for all using (auth.uid() = id);

-- Posts: anyone logged in can read; only owner can insert/delete
create policy "posts: authenticated read" on public.community_posts
  for select using (auth.role() = 'authenticated');

create policy "posts: own insert" on public.community_posts
  for insert with check (auth.uid() = user_id);

create policy "posts: own delete" on public.community_posts
  for delete using (auth.uid() = user_id);

-- Likes can be updated by anyone logged in (simplified – no per-user like tracking)
create policy "posts: authenticated update likes" on public.community_posts
  for update using (auth.role() = 'authenticated');

-- ============================================================
-- Indexes
-- ============================================================

create index if not exists community_posts_country_id_idx
  on public.community_posts (country_id);

create index if not exists community_posts_created_at_idx
  on public.community_posts (created_at desc);

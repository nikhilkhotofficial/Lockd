-- ============================================
-- DISCIPLINE APP — Full Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text not null default '',
  avatar_initials text not null default '??',
  current_streak int not null default 0,
  longest_streak int not null default 0,
  created_at timestamptz default now()
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  due_date date not null,
  due_time time not null default '09:00',
  repeat text not null default 'none' check (repeat in ('none','daily','weekly')),
  done boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Friends / connections
create table if not exists public.friends (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamptz default now(),
  unique(requester_id, receiver_id)
);

-- Streak challenges
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  opponent_id uuid references public.profiles(id) on delete cascade not null,
  duration_days int not null default 30,
  creator_progress int not null default 0,
  opponent_progress int not null default 0,
  status text not null default 'pending' check (status in ('pending','active','completed')),
  started_at date,
  created_at timestamptz default now()
);

-- Reminders
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  text text not null,
  time time not null,
  enabled boolean not null default true,
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.friends enable row level security;
alter table public.challenges enable row level security;
alter table public.reminders enable row level security;

-- Profiles: users see own + friends' public info
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Tasks: only own
create policy "tasks_all" on public.tasks using (auth.uid() = user_id);

-- Friends: see where you're involved
create policy "friends_select" on public.friends for select
  using (auth.uid() = requester_id or auth.uid() = receiver_id);
create policy "friends_insert" on public.friends for insert
  with check (auth.uid() = requester_id);
create policy "friends_update" on public.friends for update
  using (auth.uid() = receiver_id);

-- Challenges: see where involved
create policy "challenges_select" on public.challenges for select
  using (auth.uid() = creator_id or auth.uid() = opponent_id);
create policy "challenges_insert" on public.challenges for insert
  with check (auth.uid() = creator_id);
create policy "challenges_update" on public.challenges for update
  using (auth.uid() = creator_id or auth.uid() = opponent_id);

-- Reminders: only own
create policy "reminders_all" on public.reminders using (auth.uid() = user_id);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_initials)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)),
    upper(left(coalesce(new.raw_user_meta_data->>'display_name', new.email), 2))
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

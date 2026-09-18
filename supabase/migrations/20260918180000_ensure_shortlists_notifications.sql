-- Launch-critical Supabase tables and policies. Run this migration in the
-- connected Supabase SQL Editor if migrations are not applied automatically.
create table if not exists public.shortlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_code text not null,
  created_at timestamptz not null default now(),
  unique (user_id, course_code)
);
grant select, insert, delete on public.shortlists to authenticated;
alter table public.shortlists enable row level security;
drop policy if exists "Users manage own shortlist" on public.shortlists;
create policy "Users manage own shortlist" on public.shortlists for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete cascade,
  kind text not null,
  course_code text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.notifications to authenticated;
alter table public.notifications enable row level security;
drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications" on public.notifications for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications" on public.notifications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists notifications_user_created_idx on public.notifications (user_id, created_at desc);

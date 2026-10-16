-- "Hardest course at UTM" bracket: 16 courses, four knockout rounds that
-- students vote on. Additive only: two new tables, one read-only view and one
-- function. No existing table, row or policy is changed.
--
-- WHEN TO RUN: after the code that adds /bracket is deployed. The bracket
-- starts at the next full hour after you run this, then each round lasts
-- round_hours (48h, so the whole thing takes 8 days). To pick a different
-- start, change starts_at before anyone votes, e.g.
--   update public.brackets set starts_at = '2026-10-20 12:00-04'
--   where id = 'hardest-course-fall-2026';
-- Re-running this file is safe; it never resets the bracket or its votes.

create table if not exists public.brackets (
  id text primary key check (char_length(id) <= 64),
  title text not null check (char_length(title) <= 120),
  starts_at timestamptz not null,
  round_hours int not null default 48 check (round_hours between 1 and 336),
  seeds text[] not null check (array_length(seeds, 1) = 16),
  created_at timestamptz not null default now()
);

alter table public.brackets enable row level security;
revoke all on public.brackets from public, anon, authenticated;
grant select on public.brackets to anon, authenticated;
grant all on public.brackets to service_role;
drop policy if exists "Brackets are public" on public.brackets;
create policy "Brackets are public" on public.brackets for select using (true);

-- One vote per user per matchup. Votes can only be written through
-- cast_bracket_vote below, which checks the round is open. Deleting an account
-- removes that person's votes, like the rest of their data.
create table if not exists public.bracket_votes (
  bracket_id text not null references public.brackets (id),
  round smallint not null check (round between 1 and 4),
  matchup smallint not null check (matchup >= 0 and matchup < (8 >> (round - 1))),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_code text not null check (char_length(course_code) <= 16),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (bracket_id, round, matchup, user_id)
);

create index if not exists bracket_votes_user_idx on public.bracket_votes (user_id);

alter table public.bracket_votes enable row level security;
revoke all on public.bracket_votes from public, anon, authenticated;
grant select on public.bracket_votes to authenticated;
grant all on public.bracket_votes to service_role;
drop policy if exists "Users read own bracket votes" on public.bracket_votes;
create policy "Users read own bracket votes" on public.bracket_votes
  for select to authenticated using (user_id = auth.uid());

-- Vote counts only, never who voted. Same ownership pattern as
-- course_rating_stats so signed-out visitors can see the results.
drop view if exists public.bracket_vote_tallies;
create view public.bracket_vote_tallies as
select bracket_id, round, matchup, course_code, count(*)::int as votes
from public.bracket_votes
group by bracket_id, round, matchup, course_code;

alter view public.bracket_vote_tallies set (security_invoker = off);
revoke all on public.bracket_vote_tallies from public, anon, authenticated;
grant select on public.bracket_vote_tallies to anon, authenticated, service_role;

-- Casts or changes the caller's vote. The round window uses the same formula as
-- src/lib/bracket.ts: round r is open from starts_at + (r-1)*round_hours for
-- round_hours. A vote for a seed that isn't in that matchup is stored but never
-- counted, because the site only tallies the two courses actually playing.
create or replace function public.cast_bracket_vote(
  _bracket text, _round int, _matchup int, _course text
) returns void
language plpgsql security definer set search_path = public
as $$
declare
  b public.brackets;
  opens timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Sign in to vote' using errcode = '28000';
  end if;
  select * into b from public.brackets where id = _bracket;
  if not found then
    raise exception 'This bracket does not exist';
  end if;
  if _round < 1 or _round > 4 or _matchup < 0 or _matchup >= (8 >> (_round - 1)) then
    raise exception 'That matchup does not exist';
  end if;
  opens := b.starts_at + make_interval(hours => b.round_hours * (_round - 1));
  if now() < opens or now() >= opens + make_interval(hours => b.round_hours) then
    raise exception 'Voting for this round is closed';
  end if;
  if not (_course = any (b.seeds)) then
    raise exception 'That course is not in this bracket';
  end if;

  insert into public.bracket_votes (bracket_id, round, matchup, user_id, course_code)
  values (_bracket, _round, _matchup, auth.uid(), _course)
  on conflict (bracket_id, round, matchup, user_id)
  do update set course_code = excluded.course_code, updated_at = now();
end;
$$;

revoke all on function public.cast_bracket_vote(text, int, int, text) from public, anon;
grant execute on function public.cast_bracket_vote(text, int, int, text) to authenticated;

-- Seeds: the catalog courses r/UTM most often calls hard, at most two per
-- subject (pickHardestSeeds in src/lib/bracket.ts; a test keeps them in sync).
insert into public.brackets (id, title, starts_at, round_hours, seeds)
values (
  'hardest-course-fall-2026',
  'Hardest course at UTM',
  date_trunc('hour', now()) + interval '1 hour',
  48,
  array[
    'MAT102H5', 'MAT137H5', 'STA256H5', 'CSC148H5',
    'PSY100Y5', 'MGM101H5', 'CHM110H5', 'ECO200Y5',
    'CSC236H5', 'CHM243H5', 'BIO315H5', 'PHY146H5',
    'ECO206Y5', 'STA260H5', 'BIO206H5', 'MAT157H5'
  ]
)
on conflict (id) do nothing;

notify pgrst, 'reload schema';

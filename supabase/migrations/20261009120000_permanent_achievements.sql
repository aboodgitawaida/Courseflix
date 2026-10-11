-- Achievements were computed from current data, so removing shortlisted courses
-- (or ratings, or friends) took an earned achievement away again. This records
-- each unlock once, permanently. Rows are written only by the SECURITY DEFINER
-- function below (via triggers); users can read their own but never change them.
-- Run this in the Supabase SQL Editor if migrations are not applied automatically.

create table if not exists public.user_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);
revoke all on public.user_achievements from anon, authenticated;
grant select on public.user_achievements to authenticated;
alter table public.user_achievements enable row level security;
drop policy if exists "Users read own achievements" on public.user_achievements;
create policy "Users read own achievements" on public.user_achievements
  for select to authenticated using (auth.uid() = user_id);

-- Keep these thresholds in sync with src/lib/achievements.ts.
create or replace function public.award_achievements(uid uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  saved int;
  rated int;
  friends int;
  subjects int;
begin
  if uid is null then return; end if;
  select count(*) into saved from shortlists where user_id = uid;
  select count(*) into rated from course_ratings where user_id = uid;
  select count(*) into friends from friendships
    where status = 'accepted' and (requester_id = uid or addressee_id = uid);
  select count(distinct regexp_replace(code, '[0-9].*$', '')) into subjects from (
    select course_code as code from shortlists where user_id = uid
    union all
    select course_code from course_ratings where user_id = uid
  ) s;

  insert into user_achievements (user_id, achievement_id)
  select uid, a.id
  from (values
    ('first-shortlist', saved >= 1),
    ('shortlist-five', saved >= 5),
    ('first-review', rated >= 1),
    ('review-ten', rated >= 10),
    ('first-friend', friends >= 1),
    ('five-friends', friends >= 5),
    ('course-explorer', subjects >= 3),
    ('campus-voice', rated >= 10)
  ) as a(id, earned)
  where a.earned
  on conflict do nothing;
end; $$;
revoke all on function public.award_achievements(uuid) from public, anon, authenticated;

create or replace function public.award_achievements_for_row()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'friendships' then
    if new.status = 'accepted' then
      perform award_achievements(new.requester_id);
      perform award_achievements(new.addressee_id);
    end if;
  else
    perform award_achievements(new.user_id);
  end if;
  return new;
end; $$;

drop trigger if exists shortlists_award_achievements on public.shortlists;
create trigger shortlists_award_achievements
  after insert on public.shortlists
  for each row execute function public.award_achievements_for_row();

drop trigger if exists course_ratings_award_achievements on public.course_ratings;
create trigger course_ratings_award_achievements
  after insert on public.course_ratings
  for each row execute function public.award_achievements_for_row();

drop trigger if exists friendships_award_achievements on public.friendships;
create trigger friendships_award_achievements
  after insert or update of status on public.friendships
  for each row execute function public.award_achievements_for_row();

-- Backfill: anything already announced as unlocked, plus anything earned right now.
insert into public.user_achievements (user_id, achievement_id, unlocked_at)
select user_id, course_code, min(created_at)
from public.notifications
where kind = 'achievement_unlocked'
  and course_code in (
    'first-shortlist', 'shortlist-five', 'first-review', 'review-ten',
    'first-friend', 'five-friends', 'course-explorer', 'campus-voice'
  )
group by user_id, course_code
on conflict do nothing;

select public.award_achievements(id) from auth.users;

notify pgrst, 'reload schema';

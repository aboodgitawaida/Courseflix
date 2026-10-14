-- Counts how many reviews call a course a "bird course". Read-only view: it
-- adds no data and exposes no user identifiers. Same ownership pattern as
-- course_rating_stats so site visitors can read it.
drop view if exists public.bird_course_mentions;

create view public.bird_course_mentions as
select
  course_code,
  count(*)::int as bird_mentions
from public.course_ratings
where comment ~* '\mbirds?[ -]?(course|class|elective)?s?\M'
group by course_code;

alter view public.bird_course_mentions set (security_invoker = off);
revoke all on public.bird_course_mentions from public, anon, authenticated;
grant select on public.bird_course_mentions to anon, authenticated, service_role;

notify pgrst, 'reload schema';

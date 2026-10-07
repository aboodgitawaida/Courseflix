-- Rebuild the stats view so it is owned by the same role as
-- course_reviews_public and reads course_ratings as that owner. After the
-- previous migration the existing view errored for site visitors, likely
-- because of how its original owner was set up in production.
drop view if exists public.course_rating_stats;

create view public.course_rating_stats as
select
  course_code,
  count(*)::int as rating_count,
  round(avg(rating)::numeric, 2) as avg_rating,
  round(avg(difficulty)::numeric, 2) as avg_difficulty,
  round(avg(workload)::numeric, 2) as avg_workload,
  round((avg(case when would_take_again then 1 else 0 end) * 100)::numeric, 0)
    as pct_would_take_again
from public.course_ratings
group by course_code;

revoke all on public.course_rating_stats from public, anon, authenticated;
grant select on public.course_rating_stats to anon, authenticated, service_role;

notify pgrst, 'reload schema';

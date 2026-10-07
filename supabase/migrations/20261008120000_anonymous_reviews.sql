-- Reviews used to be readable with their user_id by anyone (even signed-out
-- visitors), so a review could be tied back to a profile. Readers now go
-- through a view that drops user_id and only says whether a row is theirs.
-- The base table is limited to each user's own rows.

-- Both views run as their owner so they can aggregate/read every review while
-- the base table stays private. They expose no user identifiers.
create or replace view public.course_reviews_public as
select
  id,
  course_code,
  rating,
  difficulty,
  workload,
  would_take_again,
  prof_name,
  comment,
  created_at,
  (user_id = auth.uid()) as is_mine
from public.course_ratings;

alter view public.course_reviews_public set (security_invoker = off);
alter view public.course_rating_stats set (security_invoker = off);

revoke all on public.course_reviews_public from public, anon, authenticated;
grant select on public.course_reviews_public to anon, authenticated, service_role;

drop policy if exists "Ratings are publicly readable" on public.course_ratings;
drop policy if exists "Users read own ratings" on public.course_ratings;
create policy "Users read own ratings" on public.course_ratings
  for select to authenticated using (auth.uid() = user_id);

revoke select on public.course_ratings from anon;

notify pgrst, 'reload schema';

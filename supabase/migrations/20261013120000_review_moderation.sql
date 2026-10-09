-- Reviews are now saved by the submitReview server function, which runs the
-- moderation check first and writes with the service role. Remove direct
-- INSERT/UPDATE for signed-in users so the check can't be skipped by calling
-- the database API directly. Reading and deleting your own reviews is unchanged.
--
-- Run this in the Supabase SQL Editor AFTER the code that adds submitReview is
-- deployed to production; before that, the old site still writes reviews
-- directly and would start failing.

revoke insert, update on public.course_ratings from authenticated;

notify pgrst, 'reload schema';

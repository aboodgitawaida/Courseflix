-- Notifications may only be created by the SECURITY DEFINER triggers
-- (friend requests/accepts, shortlist adds) or by a user for their OWN
-- achievements. Previously any signed-in user could insert a notification
-- for any other user with an arbitrary kind.
drop policy if exists "Actors create notifications" on public.notifications;
drop policy if exists "Users create own achievement notifications" on public.notifications;

create policy "Users create own achievement notifications" on public.notifications
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and actor_id is null
    and kind = 'achievement_unlocked'
    and course_code in (
      'first-shortlist', 'shortlist-five', 'first-review', 'review-ten',
      'first-friend', 'five-friends', 'course-explorer', 'campus-voice'
    )
  );

-- Users may only flip `read`; they must not rewrite who/what a notification is about.
revoke update on public.notifications from authenticated;
grant update (read) on public.notifications to authenticated;

notify pgrst, 'reload schema';

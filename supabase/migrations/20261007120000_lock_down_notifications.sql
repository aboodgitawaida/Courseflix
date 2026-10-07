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
revoke all on public.notifications from authenticated;
grant select, insert, delete on public.notifications to authenticated;
grant update (read) on public.notifications to authenticated;

-- Make sure users can still clear their own notifications.
drop policy if exists "Users delete own notifications" on public.notifications;
create policy "Users delete own notifications" on public.notifications
  for delete to authenticated using (auth.uid() = user_id);

-- Production had NO triggers, so friend-request / friend-accepted / friend-shortlist
-- notifications were never being created. Install them here. They run as the
-- function owner (SECURITY DEFINER), so they don't need an insert policy.
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists friendships_updated_at on public.friendships;
create trigger friendships_updated_at
  before update on public.friendships
  for each row execute function public.set_updated_at();

create or replace function public.notify_friend_request()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' and new.status = 'pending' then
    insert into public.notifications (user_id, actor_id, kind)
    values (new.addressee_id, new.requester_id, 'friend_request');
  elsif tg_op = 'UPDATE' and new.status = 'accepted' and old.status <> 'accepted' then
    insert into public.notifications (user_id, actor_id, kind)
    values (new.requester_id, new.addressee_id, 'friend_accepted');
  end if;
  return new;
end; $$;

drop trigger if exists friendships_notify on public.friendships;
create trigger friendships_notify
  after insert or update on public.friendships
  for each row execute function public.notify_friend_request();

create or replace function public.notify_friends_of_shortlist()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, actor_id, kind, course_code)
  select case when f.requester_id = new.user_id then f.addressee_id else f.requester_id end,
         new.user_id, 'shortlist_add', new.course_code
  from public.friendships f
  where f.status = 'accepted'
    and (f.requester_id = new.user_id or f.addressee_id = new.user_id);
  return new;
end; $$;

drop trigger if exists shortlists_notify_friends on public.shortlists;
create trigger shortlists_notify_friends
  after insert on public.shortlists
  for each row execute function public.notify_friends_of_shortlist();

revoke execute on function public.notify_friend_request() from public, anon, authenticated;
revoke execute on function public.notify_friends_of_shortlist() from public, anon, authenticated;

notify pgrst, 'reload schema';

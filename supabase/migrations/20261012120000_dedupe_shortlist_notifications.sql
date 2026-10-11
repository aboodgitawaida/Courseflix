-- Removing and re-adding the same course sent every friend a fresh notification
-- each time, so one account could flood its friends' bells by toggling a save.
-- Skip the notification when that friend already got one for the same course
-- from the same person in the last 24 hours.
-- Run this in the Supabase SQL Editor if migrations are not applied automatically.

create or replace function public.notify_friends_of_shortlist()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, actor_id, kind, course_code)
  select friend.id, new.user_id, 'shortlist_add', new.course_code
  from (
    select case when f.requester_id = new.user_id then f.addressee_id else f.requester_id end as id
    from public.friendships f
    where f.status = 'accepted'
      and (f.requester_id = new.user_id or f.addressee_id = new.user_id)
  ) friend
  where not exists (
    select 1 from public.notifications n
    where n.user_id = friend.id
      and n.actor_id = new.user_id
      and n.kind = 'shortlist_add'
      and n.course_code = new.course_code
      and n.created_at > now() - interval '24 hours'
  );
  return new;
end; $$;

revoke execute on function public.notify_friends_of_shortlist() from public, anon, authenticated;

notify pgrst, 'reload schema';

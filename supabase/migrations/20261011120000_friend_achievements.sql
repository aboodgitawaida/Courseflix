-- Friend profiles show a friend's earned achievements. Each user could only read
-- their own user_achievements rows; accepted friends can now read each other's.
-- Run this in the Supabase SQL Editor if migrations are not applied automatically.

create or replace function private.can_view_achievements(_owner uuid)
returns boolean language sql stable security definer set search_path to 'public'
as $$
  select _owner = auth.uid() or private.are_friends(auth.uid(), _owner)
$$;

revoke all on function private.can_view_achievements(uuid) from public, anon;
grant execute on function private.can_view_achievements(uuid) to authenticated;

drop policy if exists "Users read own achievements" on public.user_achievements;
drop policy if exists "Friends read achievements" on public.user_achievements;
create policy "Friends read achievements" on public.user_achievements
  for select to authenticated using (private.can_view_achievements(user_id));

notify pgrst, 'reload schema';

-- Allow each account to receive one notification per unlocked achievement.
create unique index if not exists notifications_achievement_once_idx
  on public.notifications (user_id, kind, course_code)
  where kind = 'achievement_unlocked';

drop policy if exists "Users create own achievement notifications" on public.notifications;
create policy "Users create own achievement notifications" on public.notifications
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and kind = 'achievement_unlocked'
  );

notify pgrst, 'reload schema';

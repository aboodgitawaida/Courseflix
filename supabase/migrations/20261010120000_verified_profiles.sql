-- Verified badge for the creator. Only the service role / SQL editor can set is_verified:
-- authenticated users lose table-wide INSERT/UPDATE and get column grants that leave it out.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

REVOKE INSERT, UPDATE ON public.profiles FROM authenticated;
GRANT INSERT (id, display_name, username, avatar_id, major_id, year, is_private)
  ON public.profiles TO authenticated;
GRANT UPDATE (display_name, username, avatar_id, major_id, year, is_private)
  ON public.profiles TO authenticated;

UPDATE public.profiles p
SET is_verified = true
FROM auth.users u
WHERE u.id = p.id AND lower(u.email) = 'aboodemail@gmail.com';

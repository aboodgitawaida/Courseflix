-- Make private profiles actually private.
--
-- Production had two SELECT policies on public.profiles:
--   "Profiles are viewable by everyone"     (every role, USING true)
--   "Signed-in users read visible profiles" (respects is_private and friendships)
-- Policies are OR'd together, so the first one let anyone, signed out included, read every
-- student's name, username, program and year, private accounts too. An earlier fix dropped the
-- old policy by a different name ("Profiles are publicly readable") and so left it in place.
--
-- This only changes access rules. No rows are read, changed or removed. Safe to run again.

-- 1. Remove the open policies, under both names they have had.
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;

-- 2. Signed-out visitors can't read profiles at all.
REVOKE SELECT ON public.profiles FROM anon;

-- 3. Signed-in users see their own profile, public profiles, and anyone they share a friendship
--    row with (pending or accepted, so friend requests still show who sent them).
DROP POLICY IF EXISTS "Signed-in users read visible profiles" ON public.profiles;
CREATE POLICY "Signed-in users read visible profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR is_private = false
    OR EXISTS (
      SELECT 1 FROM public.friendships f
      WHERE (f.requester_id = auth.uid() AND f.addressee_id = profiles.id)
         OR (f.addressee_id = auth.uid() AND f.requester_id = profiles.id)
    )
  );

-- 4. Private accounts no longer show up in search, but someone who knows the exact username can
--    still find them to send a friend request. Program and year stay hidden for private accounts.
CREATE OR REPLACE FUNCTION public.find_profile_by_username(_username text)
RETURNS TABLE (
  id uuid,
  display_name text,
  username text,
  avatar_id text,
  major_id text,
  year integer,
  is_private boolean,
  is_verified boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id, p.display_name, p.username, p.avatar_id,
         CASE WHEN p.is_private THEN NULL ELSE p.major_id END,
         CASE WHEN p.is_private THEN NULL ELSE p.year END,
         p.is_private, p.is_verified
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND p.username IS NOT NULL
    AND lower(p.username) = lower(trim(both '@' from _username))
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.find_profile_by_username(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.find_profile_by_username(text) TO authenticated;

NOTIFY pgrst, 'reload schema';

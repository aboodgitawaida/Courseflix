-- Profiles used to be readable by anyone, including signed-out visitors, which let anyone list
-- every student's name, username, major and year (private accounts included).
--
-- Now: only signed-in users can read profiles, and a private profile is visible only to its owner
-- and to people with a friendship row with them (pending or accepted, so requests still show names).
-- Private users stay friendable: find_profile_by_username() does an exact-username lookup.

REVOKE SELECT ON public.profiles FROM anon;

DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;
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

-- Exact username match only (no partial search), so private accounts can be added by someone who
-- already knows the handle but cannot be browsed. Major and year stay hidden for private accounts.
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

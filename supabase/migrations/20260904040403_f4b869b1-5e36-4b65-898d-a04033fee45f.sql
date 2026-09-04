CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.are_friends(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
      AND ((requester_id = _a AND addressee_id = _b)
        OR (requester_id = _b AND addressee_id = _a))
  )
$$;

CREATE OR REPLACE FUNCTION private.can_view_shortlist(_owner uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT _owner = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = _owner AND p.is_private = false
    )
    OR private.are_friends(auth.uid(), _owner)
$$;

REVOKE ALL ON FUNCTION private.are_friends(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.can_view_shortlist(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.can_view_shortlist(uuid) TO authenticated;

DROP POLICY IF EXISTS "Visible shortlists are readable" ON public.shortlists;
CREATE POLICY "Visible shortlists are readable" ON public.shortlists
FOR SELECT TO authenticated USING (private.can_view_shortlist(user_id));

DROP FUNCTION IF EXISTS public.can_view_shortlist(uuid);
DROP FUNCTION IF EXISTS public.are_friends(uuid, uuid);
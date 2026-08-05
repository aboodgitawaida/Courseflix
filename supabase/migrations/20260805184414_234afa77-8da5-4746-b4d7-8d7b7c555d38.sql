REVOKE ALL ON FUNCTION public.are_friends(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.can_view_shortlist(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_view_shortlist(uuid) TO authenticated;
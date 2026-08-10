REVOKE EXECUTE ON FUNCTION public.are_friends(uuid, uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_view_shortlist(uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_friends_of_shortlist() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_friend_request() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
-- The accept policy only checked `status = 'accepted'`, so an addressee could
-- also rewrite requester_id/addressee_id in the same UPDATE. Limit updates to
-- the status column; RLS still restricts them to the addressee.
revoke update on public.friendships from authenticated;
grant update (status) on public.friendships to authenticated;

notify pgrst, 'reload schema';

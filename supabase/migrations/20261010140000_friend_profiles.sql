-- Friend profile pages + a cooldown on re-requesting someone who declined.

-- get_profile_by_username(): the single place that decides what a viewer may see.
--   self / friends / public account  -> full profile (major, year, friend count, achievements)
--   anyone else on a private account -> name, @username, avatar and badge only
-- Signed-out callers get nothing. The shortlist itself is still guarded by the shortlists
-- policy, which uses the same rule (owner, friend, or a public account).
CREATE OR REPLACE FUNCTION public.get_profile_by_username(_username text)
RETURNS TABLE (
  id uuid,
  display_name text,
  username text,
  avatar_id text,
  is_private boolean,
  is_verified boolean,
  relationship text,
  friendship_id uuid,
  can_view boolean,
  major_id text,
  year integer,
  friend_count integer,
  achievement_ids text[]
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  me uuid := auth.uid();
  p public.profiles%ROWTYPE;
  f public.friendships%ROWTYPE;
  rel text;
  visible boolean;
BEGIN
  IF me IS NULL THEN RETURN; END IF;

  SELECT * INTO p FROM public.profiles
  WHERE lower(profiles.username) = lower(trim(both '@' from _username))
  LIMIT 1;
  IF NOT FOUND THEN RETURN; END IF;

  IF p.id = me THEN
    rel := 'self';
  ELSE
    SELECT * INTO f FROM public.friendships
    WHERE (requester_id = me AND addressee_id = p.id)
       OR (addressee_id = me AND requester_id = p.id)
    LIMIT 1;
    rel := CASE
      WHEN NOT FOUND THEN 'none'
      WHEN f.status = 'accepted' THEN 'friends'
      WHEN f.requester_id = me THEN 'outgoing'
      ELSE 'incoming'
    END;
  END IF;

  visible := rel IN ('self', 'friends') OR NOT p.is_private;

  RETURN QUERY SELECT
    p.id, p.display_name, p.username, p.avatar_id, p.is_private, p.is_verified,
    rel, f.id, visible,
    CASE WHEN visible THEN p.major_id END,
    CASE WHEN visible THEN p.year END,
    CASE WHEN visible THEN (
      SELECT count(*)::int FROM public.friendships x
      WHERE x.status = 'accepted' AND (x.requester_id = p.id OR x.addressee_id = p.id)
    ) END,
    CASE WHEN visible THEN COALESCE((
      SELECT array_agg(a.achievement_id ORDER BY a.unlocked_at)
      FROM public.user_achievements a WHERE a.user_id = p.id
    ), ARRAY[]::text[]) END;
END;
$$;

REVOKE ALL ON FUNCTION public.get_profile_by_username(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_profile_by_username(text) TO authenticated;

-- Decline cooldown: when the addressee declines a pending request the pair is remembered, and the
-- same requester cannot ask again for 7 days. Cancelling your own request, removing a friend and
-- account deletion are not declines.
CREATE TABLE IF NOT EXISTS public.friend_request_declines (
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  declined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (requester_id, addressee_id)
);
REVOKE ALL ON public.friend_request_declines FROM anon, authenticated;
ALTER TABLE public.friend_request_declines ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.log_friend_decline()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF OLD.status = 'pending' AND auth.uid() = OLD.addressee_id THEN
    INSERT INTO public.friend_request_declines (requester_id, addressee_id)
    VALUES (OLD.requester_id, OLD.addressee_id)
    ON CONFLICT (requester_id, addressee_id) DO UPDATE SET declined_at = now();
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS friendships_log_decline ON public.friendships;
CREATE TRIGGER friendships_log_decline
  BEFORE DELETE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.log_friend_decline();

CREATE OR REPLACE FUNCTION public.enforce_decline_cooldown()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.friend_request_declines d
    WHERE d.requester_id = NEW.requester_id
      AND d.addressee_id = NEW.addressee_id
      AND d.declined_at > now() - interval '7 days'
  ) THEN
    RAISE EXCEPTION 'This student declined your request recently. You can ask again in a few days.'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS friendships_decline_cooldown ON public.friendships;
CREATE TRIGGER friendships_decline_cooldown
  BEFORE INSERT ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.enforce_decline_cooldown();

NOTIFY pgrst, 'reload schema';

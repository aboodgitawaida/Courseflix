CREATE TABLE IF NOT EXISTS public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (requester_id <> addressee_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS friendships_pair_idx
  ON public.friendships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));
CREATE INDEX IF NOT EXISTS friendships_requester_idx ON public.friendships (requester_id);
CREATE INDEX IF NOT EXISTS friendships_addressee_idx ON public.friendships (addressee_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT ALL ON public.friendships TO service_role;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants read friendships" ON public.friendships;
CREATE POLICY "Participants read friendships" ON public.friendships
  FOR SELECT TO authenticated
  USING (auth.uid() IN (requester_id, addressee_id));

DROP POLICY IF EXISTS "Users send friend requests" ON public.friendships;
CREATE POLICY "Users send friend requests" ON public.friendships
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id AND status = 'pending');

DROP POLICY IF EXISTS "Recipients accept friend requests" ON public.friendships;
CREATE POLICY "Recipients accept friend requests" ON public.friendships
  FOR UPDATE TO authenticated
  USING (auth.uid() = addressee_id)
  WITH CHECK (
    auth.uid() = addressee_id
    AND status = 'accepted'
  );

DROP POLICY IF EXISTS "Participants remove friendships" ON public.friendships;
CREATE POLICY "Participants remove friendships" ON public.friendships
  FOR DELETE TO authenticated
  USING (auth.uid() IN (requester_id, addressee_id));

DROP TRIGGER IF EXISTS friendships_updated_at ON public.friendships;
CREATE TRIGGER friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

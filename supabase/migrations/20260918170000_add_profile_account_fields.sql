-- Add profile fields used by the account, friends, and privacy UI.
-- IF NOT EXISTS keeps this migration safe for databases where these columns
-- were already created manually or by an earlier deployment.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS avatar_id text NOT NULL DEFAULT 'hmalc',
  ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL;

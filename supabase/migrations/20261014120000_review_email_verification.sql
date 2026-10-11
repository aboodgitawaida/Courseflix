-- Sign-up no longer requires confirming an email ("Confirm email" is turned off
-- in Supabase), so anyone can browse, save courses and add friends right away.
-- Posting a review still requires proving the account owns its email: either a
-- link sent by the site (recorded here) or a sign-in provider such as Google.
--
-- Only adds tables, a function and policies; no existing rows change.
-- Run this in the Supabase SQL Editor BEFORE turning off "Confirm email", so
-- everyone who already confirmed is recorded as verified.

create table if not exists public.review_email_verifications (
  user_id uuid primary key references auth.users(id) on delete cascade,
  verified_at timestamptz not null default now()
);
alter table public.review_email_verifications enable row level security;
revoke all on public.review_email_verifications from public, anon, authenticated;
grant select on public.review_email_verifications to authenticated;
grant all on public.review_email_verifications to service_role;
drop policy if exists "Users read own review verification" on public.review_email_verifications;
create policy "Users read own review verification" on public.review_email_verifications
  for select to authenticated using (auth.uid() = user_id);

-- One-time links. Only a SHA-256 hash of each token is stored, and only the
-- service role (the site's server) can read or write them.
create table if not exists public.email_verification_tokens (
  token_hash text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists email_verification_tokens_user_idx
  on public.email_verification_tokens (user_id, created_at desc);
alter table public.email_verification_tokens enable row level security;
revoke all on public.email_verification_tokens from public, anon, authenticated;
grant all on public.email_verification_tokens to service_role;

-- Everyone who already confirmed their email while "Confirm email" was on.
insert into public.review_email_verifications (user_id, verified_at)
select id, email_confirmed_at from auth.users where email_confirmed_at is not null
on conflict (user_id) do nothing;

create or replace function private.can_post_reviews(_uid uuid)
returns boolean language sql stable security definer set search_path to 'public'
as $$
  select exists (select 1 from public.review_email_verifications v where v.user_id = _uid)
      or exists (select 1 from auth.identities i where i.user_id = _uid and i.provider <> 'email')
$$;
revoke all on function private.can_post_reviews(uuid) from public, anon;
grant execute on function private.can_post_reviews(uuid) to authenticated, service_role;

-- Direct writes (if the review_moderation migration hasn't removed them) also
-- require a verified email.
drop policy if exists "Users insert own rating" on public.course_ratings;
create policy "Users insert own rating" on public.course_ratings
  for insert to authenticated
  with check (auth.uid() = user_id and private.can_post_reviews(auth.uid()));

drop policy if exists "Users update own rating" on public.course_ratings;
create policy "Users update own rating" on public.course_ratings
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and private.can_post_reviews(auth.uid()));

notify pgrst, 'reload schema';

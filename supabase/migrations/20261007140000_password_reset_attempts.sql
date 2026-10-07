-- Durable rate limiting for password-reset emails. The previous in-memory Map
-- was per serverless instance, so it barely limited anything. Rows hold only
-- SHA-256 hashes, never raw emails or IP addresses. Only the service role (used
-- by the reset server function) can touch this table.
create table if not exists public.password_reset_attempts (
  id bigint generated always as identity primary key,
  email_hash text not null,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists password_reset_attempts_email_idx
  on public.password_reset_attempts (email_hash, created_at desc);
create index if not exists password_reset_attempts_ip_idx
  on public.password_reset_attempts (ip_hash, created_at desc);

alter table public.password_reset_attempts enable row level security;
revoke all on public.password_reset_attempts from public, anon, authenticated;
grant all on public.password_reset_attempts to service_role;

notify pgrst, 'reload schema';

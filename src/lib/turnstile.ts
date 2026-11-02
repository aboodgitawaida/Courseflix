// Cloudflare Turnstile site key for the email sign-in and sign-up form. The check is
// off unless VITE_TURNSTILE_SITE_KEY is set; the matching secret lives only in
// Supabase (Authentication → Attack Protection).
export const TURNSTILE_SITE_KEY: string | undefined =
  import.meta.env["VITE_TURNSTILE_SITE_KEY"] || undefined;

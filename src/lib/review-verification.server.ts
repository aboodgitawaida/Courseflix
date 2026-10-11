import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { serverLog } from "./server-log";

// PostgREST / Postgres codes for "table does not exist". Until the
// review_email_verification migration runs, reviews keep working as before.
const MISSING_TABLE_CODES = new Set(["PGRST205", "42P01"]);

/**
 * Whether an account may post reviews: it signed in through a provider that
 * verifies email (e.g. Google), or it confirmed a link the site emailed it.
 */
export async function canPostReviews(admin: SupabaseClient<Database>, userId: string) {
  const { data: userData } = await admin.auth.admin.getUserById(userId);
  if (userData.user?.identities?.some((identity) => identity.provider !== "email")) return true;

  const { data, error } = await admin
    .from("review_email_verifications")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    if (MISSING_TABLE_CODES.has(error.code)) return true;
    serverLog.error("review_verification_check_failed", { provider_code: error.code ?? null });
    return false;
  }
  return Boolean(data);
}

export async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

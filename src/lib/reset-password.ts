import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { SITE_URL } from "./site";
import { serverLog } from "./server-log";

const RESET_WINDOW_MS = 15 * 60 * 1_000;
const MAX_RESETS_PER_EMAIL = 3;
const MAX_RESETS_PER_IP = 10;
type ResetResult = { success?: boolean; error?: string };
const GENERIC_SUCCESS: ResetResult = { success: true };

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function clientIp() {
  const { getRequest } = await import("@tanstack/react-start/server");
  const forwarded = getRequest()?.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || null;
}

// Counts recent attempts in Postgres so the limit holds across serverless
// instances. Fails open (logs and allows) if the table is unavailable so a
// missing migration cannot lock everyone out of password reset.
async function isRateLimited(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: SupabaseClient<any>,
  emailHash: string,
  ipHash: string | null,
) {
  const since = new Date(Date.now() - RESET_WINDOW_MS).toISOString();

  const emailCount = await admin
    .from("password_reset_attempts")
    .select("id", { count: "exact", head: true })
    .eq("email_hash", emailHash)
    .gte("created_at", since);
  if (emailCount.error) {
    serverLog.error("password_reset_rate_limit_unavailable", { code: emailCount.error.code });
    return false;
  }
  if ((emailCount.count ?? 0) >= MAX_RESETS_PER_EMAIL) return true;

  if (ipHash) {
    const ipCount = await admin
      .from("password_reset_attempts")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);
    if (!ipCount.error && (ipCount.count ?? 0) >= MAX_RESETS_PER_IP) return true;
  }

  await admin.from("password_reset_attempts").insert({ email_hash: emailHash, ip_hash: ipHash });
  // Opportunistic cleanup keeps the table small without a cron job.
  await admin
    .from("password_reset_attempts")
    .delete()
    .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1_000).toISOString());
  return false;
}

export const resetPassword = createServerFn()
  .validator((email: string) => {
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || normalized.length > 254) {
      throw new Error("Enter a valid email address.");
    }
    return normalized;
  })
  .handler(async ({ data: email }): Promise<ResetResult> => {
    try {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const resendApiKey = process.env.RESEND_API_KEY;
      const supabaseUrl =
        process.env.SUPABASE_URL ||
        process.env.VITE_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (!serviceRoleKey || !resendApiKey || !supabaseUrl) {
        serverLog.error("password_reset_configuration_missing");
        return { error: "Password reset is temporarily unavailable. Please try again later." };
      }

      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

      const [emailHash, ip] = await Promise.all([sha256(email), clientIp()]);
      const ipHash = ip ? await sha256(ip) : null;
      if (await isRateLimited(supabaseAdmin, emailHash, ipHash)) {
        serverLog.warn("password_reset_rate_limited");
        return GENERIC_SUCCESS;
      }

      const resend = new Resend(resendApiKey);

      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: `${SITE_URL}/auth/reset-password`,
        },
      });

      const hashedToken = data?.properties?.hashed_token;
      if (error || !hashedToken) {
        // Same response as success so callers cannot tell which emails have accounts.
        serverLog.warn("password_reset_link_failed", { provider_code: error?.code ?? null });
        return GENERIC_SUCCESS;
      }

      const resetLink = `${SITE_URL}/auth/reset-password?token_hash=${encodeURIComponent(hashedToken)}&type=recovery`;
      const emailResult = await resend.emails.send({
        from: "Courseflix <noreply@courseflix.ca>",
        to: [email],
        subject: "Reset your Courseflix password",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Reset Your Password</h2>
            <p>Click the button below to reset your Courseflix password:</p>
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #e50914; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">If you did not request this email, you can safely ignore it.</p>
          </div>
        `,
      });

      if (emailResult.error) {
        serverLog.error("password_reset_email_failed", { provider_name: "resend" });
        return { error: "Password reset is temporarily unavailable. Please try again later." };
      }

      return GENERIC_SUCCESS;
    } catch (err: unknown) {
      serverLog.error("password_reset_unexpected_failure", {
        error_type: err instanceof Error ? err.name : typeof err,
      });
      return {
        error: "Password reset is temporarily unavailable. Please try again later.",
      };
    }
  });

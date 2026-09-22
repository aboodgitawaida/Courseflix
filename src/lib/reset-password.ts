import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { SITE_URL } from "./site";
import { serverLog } from "./server-log";

const RESET_WINDOW_MS = 15 * 60 * 1_000;
const MAX_RESETS_PER_WINDOW = 3;
const resetAttempts = new Map<string, number[]>();

function isRateLimited(email: string) {
  const now = Date.now();
  const recent = (resetAttempts.get(email) ?? []).filter(
    (timestamp) => now - timestamp < RESET_WINDOW_MS,
  );
  if (recent.length >= MAX_RESETS_PER_WINDOW) {
    resetAttempts.set(email, recent);
    return true;
  }
  recent.push(now);
  resetAttempts.set(email, recent);
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
  .handler(async ({ data: email }) => {
    try {
      if (isRateLimited(email)) {
        serverLog.warn("password_reset_rate_limited");
        return { error: "If an account exists for that email, a reset message has been sent." };
      }

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
      const resend = new Resend(resendApiKey);

      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: `${SITE_URL}/auth/reset-password`,
        },
      });

      if (error || !data.properties?.action_link) {
        serverLog.error("password_reset_link_failed", { provider_code: error?.code ?? null });
        return { error: "If an account exists for that email, a reset message has been sent." };
      }

      const emailResult = await resend.emails.send({
        from: "CourseFlix <noreply@courseflix.ca>",
        to: [email],
        subject: "Reset your CourseFlix password",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Reset Your Password</h2>
            <p>Click the button below to reset your CourseFlix password:</p>
            <a href="${data.properties.action_link}" style="display: inline-block; padding: 12px 24px; background-color: #e50914; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">If you did not request this email, you can safely ignore it.</p>
          </div>
        `,
      });

      if (emailResult.error) {
        serverLog.error("password_reset_email_failed", { provider_name: "resend" });
        return { error: "Password reset is temporarily unavailable. Please try again later." };
      }

      return { success: true };
    } catch (err: unknown) {
      serverLog.error("password_reset_unexpected_failure", {
        error_type: err instanceof Error ? err.name : typeof err,
      });
      return {
        error: "Password reset is temporarily unavailable. Please try again later.",
      };
    }
  });

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { SITE_URL } from "./site";
import { serverLog } from "./server-log";

const LINK_TTL_MS = 24 * 60 * 60 * 1_000;
const SEND_WINDOW_MS = 15 * 60 * 1_000;
const MAX_SENDS_PER_WINDOW = 3;

type Result = { success?: boolean; alreadyVerified?: boolean; error?: string };

const UNAVAILABLE = "Email verification is temporarily unavailable. Please try again later.";

/** Emails the signed-in user a one-time link that unlocks posting reviews. */
export const sendReviewVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Result> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { canPostReviews, sha256Hex } = await import("./review-verification.server");
      if (await canPostReviews(supabaseAdmin, context.userId)) return { alreadyVerified: true };

      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(context.userId);
      const email = userData.user?.email;
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!email || !resendApiKey) {
        serverLog.error("review_verification_unavailable", { has_email: Boolean(email) });
        return { error: UNAVAILABLE };
      }

      const since = new Date(Date.now() - SEND_WINDOW_MS).toISOString();
      const { count } = await supabaseAdmin
        .from("email_verification_tokens")
        .select("token_hash", { count: "exact", head: true })
        .eq("user_id", context.userId)
        .gte("created_at", since);
      if ((count ?? 0) >= MAX_SENDS_PER_WINDOW) {
        return { error: "We've sent a few links already. Check your inbox, or try again later." };
      }

      const bytes = crypto.getRandomValues(new Uint8Array(32));
      const token = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
      const { error: insertError } = await supabaseAdmin.from("email_verification_tokens").insert({
        token_hash: await sha256Hex(token),
        user_id: context.userId,
        expires_at: new Date(Date.now() + LINK_TTL_MS).toISOString(),
      });
      if (insertError) {
        serverLog.error("review_verification_token_failed", { provider_code: insertError.code });
        return { error: UNAVAILABLE };
      }

      const link = `${SITE_URL}/verify-email?token=${token}`;
      const { Resend } = await import("resend");
      const sent = await new Resend(resendApiKey).emails.send({
        from: "Courseflix <noreply@courseflix.ca>",
        to: [email],
        subject: "Confirm your email to post reviews on Courseflix",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Confirm your email</h2>
            <p>Click the button below to confirm your email and start posting course reviews on Courseflix.</p>
            <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #e50914; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Confirm email</a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">This link works for 24 hours. If you didn't ask for it, you can ignore this email.</p>
          </div>
        `,
      });
      if (sent.error) {
        serverLog.error("review_verification_email_failed", { provider_name: "resend" });
        return { error: UNAVAILABLE };
      }
      return { success: true };
    } catch (err: unknown) {
      serverLog.error("review_verification_send_unexpected_failure", {
        error_type: err instanceof Error ? err.name : typeof err,
      });
      return { error: UNAVAILABLE };
    }
  });

/** Redeems a link from the verification email. The token itself proves inbox access. */
export const confirmReviewVerification = createServerFn({ method: "POST" })
  .validator((token: string) => {
    const value = String(token ?? "").trim();
    if (!/^[0-9a-f]{64}$/.test(value)) throw new Error("This link is not valid.");
    return value;
  })
  .handler(async ({ data: token }): Promise<Result> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { sha256Hex } = await import("./review-verification.server");
      const { data: row, error } = await supabaseAdmin
        .from("email_verification_tokens")
        .select("user_id, expires_at")
        .eq("token_hash", await sha256Hex(token))
        .maybeSingle();
      if (error) {
        serverLog.error("review_verification_lookup_failed", { provider_code: error.code });
        return { error: UNAVAILABLE };
      }
      if (!row || new Date(row.expires_at).getTime() < Date.now()) {
        return { error: "This link has expired or was already used. Send yourself a new one." };
      }

      const { error: verifyError } = await supabaseAdmin
        .from("review_email_verifications")
        .upsert({ user_id: row.user_id }, { onConflict: "user_id", ignoreDuplicates: true });
      if (verifyError) {
        serverLog.error("review_verification_save_failed", { provider_code: verifyError.code });
        return { error: UNAVAILABLE };
      }
      await supabaseAdmin.from("email_verification_tokens").delete().eq("user_id", row.user_id);
      return { success: true };
    } catch (err: unknown) {
      serverLog.error("review_verification_confirm_unexpected_failure", {
        error_type: err instanceof Error ? err.name : typeof err,
      });
      return { error: UNAVAILABLE };
    }
  });

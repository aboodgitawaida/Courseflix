import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { serverLog } from "./server-log";

// Deletes the signed-in user's auth account. Profiles, reviews, shortlists,
// friendships and notifications all reference auth.users with ON DELETE
// CASCADE, so removing the auth user removes everything tied to it.
export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ success?: boolean; error?: string }> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.auth.admin.deleteUser(context.userId);
      if (error) {
        serverLog.error("account_delete_failed", { provider_code: error.code ?? null });
        return { error: "Could not delete your account. Please try again later." };
      }
      return { success: true };
    } catch (err: unknown) {
      serverLog.error("account_delete_unexpected_failure", {
        error_type: err instanceof Error ? err.name : typeof err,
      });
      return { error: "Could not delete your account. Please try again later." };
    }
  });

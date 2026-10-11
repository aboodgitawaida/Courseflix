import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { validateRatingInput } from "./validation";
import { serverLog } from "./server-log";

export type SubmitReviewInput = {
  course_code: string;
  rating: number;
  difficulty: number;
  workload: number;
  would_take_again: boolean;
  prof_name: string | null;
  comment: string | null;
};

const clean = (value: unknown, max: number) =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;

// Reviews are written here rather than straight from the browser so the
// moderation check can't be skipped. The review_moderation migration removes
// direct INSERT/UPDATE on course_ratings for signed-in users.
export const submitReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw: SubmitReviewInput): SubmitReviewInput => {
    const input: SubmitReviewInput = {
      course_code: String(raw?.course_code ?? "")
        .trim()
        .toUpperCase(),
      rating: Number(raw?.rating),
      difficulty: Number(raw?.difficulty),
      workload: Number(raw?.workload),
      would_take_again: raw?.would_take_again !== false,
      prof_name: clean(raw?.prof_name, 81),
      comment: clean(raw?.comment, 1001),
    };
    const error = validateRatingInput(input);
    if (error) throw new Error(error);
    return input;
  })
  .handler(async ({ data, context }): Promise<{ success?: boolean; error?: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { canPostReviews } = await import("./review-verification.server");
    if (!(await canPostReviews(supabaseAdmin, context.userId))) {
      return { error: "Confirm your email before posting a review." };
    }

    const { moderateReview } = await import("./review-moderation.server");
    const verdict = await moderateReview({
      courseCode: data.course_code,
      profName: data.prof_name,
      comment: data.comment,
    });
    if (!verdict.allowed) return { error: verdict.message };

    try {
      const { error } = await supabaseAdmin
        .from("course_ratings")
        .upsert({ ...data, user_id: context.userId }, { onConflict: "user_id,course_code" });
      if (error) {
        serverLog.error("review_save_failed", { provider_code: error.code ?? null });
        return { error: "Could not save your review. Please try again." };
      }
      return { success: true };
    } catch (err: unknown) {
      serverLog.error("review_save_unexpected_failure", {
        error_type: err instanceof Error ? err.name : typeof err,
      });
      return { error: "Could not save your review. Please try again." };
    }
  });

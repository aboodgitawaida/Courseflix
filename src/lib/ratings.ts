import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { validateRatingInput } from "@/lib/validation";
import { announce } from "@/lib/a11y";
import { recordSubjectInterest } from "@/lib/interest";
import { getSessionUser } from "@/lib/session";
import { submitReview } from "@/lib/submit-review";
import type { User } from "@supabase/supabase-js";
import { celebrateEagleWith } from "@/lib/study-eagle";

export type RatingRow = {
  id: string;
  user_id: string;
  course_code: string;
  rating: number;
  difficulty: number;
  workload: number;
  would_take_again: boolean;
  prof_name: string | null;
  comment: string | null;
  created_at: string;
};

// Public reviews come from a view that hides who wrote them.
export type PublicReview = Omit<RatingRow, "user_id"> & { is_mine: boolean };

export type RatingStats = {
  rating_count: number;
  avg_rating: number;
  avg_difficulty: number;
  avg_workload: number;
  pct_would_take_again: number;
} | null;

export function useCourseRatings(code: string) {
  return useQuery({
    queryKey: ["ratings", code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_reviews_public")
        .select(
          "id, course_code, rating, difficulty, workload, would_take_again, prof_name, comment, created_at, is_mine",
        )
        .eq("course_code", code)
        .order("created_at", { ascending: false });
      if (error) throw new Error(`Could not load ratings: ${error.message}`);
      return (data ?? []) as PublicReview[];
    },
    retry: 1,
  });
}

export function useMyRatings(userId: string | undefined) {
  return useQuery({
    queryKey: ["my-ratings", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) return [] as RatingRow[];
      const { data, error } = await supabase
        .from("course_ratings")
        .select(
          "id, user_id, course_code, rating, difficulty, workload, would_take_again, prof_name, comment, created_at",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(`Could not load your reviews: ${error.message}`);
      return (data ?? []) as RatingRow[];
    },
    retry: 1,
  });
}

export type RatingStatsRow = NonNullable<RatingStats>;

const STATS_PAGE_SIZE = 1000;

// The stats view has one row per rated course, so one cached request covers every
// card on a page. Fetching per course used to fire ~100 requests per home visit.
async function fetchAllCourseStats() {
  const stats = new Map<string, RatingStatsRow>();
  for (let from = 0; ; from += STATS_PAGE_SIZE) {
    const { data, error } = await supabase
      .from("course_rating_stats")
      .select("*")
      .order("course_code")
      .range(from, from + STATS_PAGE_SIZE - 1);
    if (error) throw new Error(`Could not load rating stats: ${error.message}`);
    for (const row of data ?? []) {
      const values = row as Record<string, unknown>;
      if (typeof values["course_code"] !== "string") continue;
      stats.set(values["course_code"], {
        rating_count: Number(values["rating_count"] ?? 0),
        avg_rating: Number(values["avg_rating"] ?? 0),
        avg_difficulty: Number(values["avg_difficulty"] ?? 0),
        avg_workload: Number(values["avg_workload"] ?? 0),
        pct_would_take_again: Number(values["pct_would_take_again"] ?? 0),
      });
    }
    if ((data ?? []).length < STATS_PAGE_SIZE) return stats;
  }
}

/** Every course's review averages, from the same cached request as useCourseStats. */
export function useAllCourseStats(enabled = true) {
  return useQuery({
    queryKey: ["rating-stats"],
    queryFn: fetchAllCourseStats,
    staleTime: 5 * 60_000,
    retry: 1,
    enabled,
  });
}

export function useCourseStats(code: string) {
  return useQuery({
    queryKey: ["rating-stats"],
    queryFn: fetchAllCourseStats,
    select: (stats): RatingStats => stats.get(code) ?? null,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

// A course turns gold once this many students have called it a bird course.
export const BIRD_COURSE_THRESHOLD = 2;

async function fetchBirdMentions() {
  const { data, error } = await supabase
    .from("bird_course_mentions")
    .select("course_code, bird_mentions");
  if (error) throw new Error(`Could not load bird courses: ${error.message}`);
  const mentions = new Map<string, number>();
  for (const row of data ?? []) {
    if (typeof row.course_code === "string") {
      mentions.set(row.course_code, Number(row.bird_mentions ?? 0));
    }
  }
  return mentions;
}

// One small request covers every card on a page; the view has one row per course
// that at least one review calls a bird course.
export function useBirdCourses() {
  return useQuery({
    queryKey: ["bird-courses"],
    queryFn: fetchBirdMentions,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useBirdMentions(code: string) {
  return useQuery({
    queryKey: ["bird-courses"],
    queryFn: fetchBirdMentions,
    select: (mentions) => mentions.get(code) ?? 0,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export type RatingInput = {
  course_code: string;
  rating: number;
  difficulty: number;
  workload: number;
  would_take_again: boolean;
  prof_name: string | null;
  comment: string | null;
};

export function useSubmitRating(code: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RatingInput) => {
      const validationError = validateRatingInput(input);
      if (validationError) throw new Error(validationError);
      const { data: auth, error: authError } = await getSessionUser();
      if (authError) throw new Error(`Authentication failed: ${authError.message}`);
      const userId = auth.user?.id;
      if (!userId) throw new Error("You need to sign in to rate a course.");

      // Saved server-side so the moderation check always runs.
      const result = await submitReview({ data: input });
      if (result.error) throw new Error(result.error);
    },
    // Remember whether this is a first review of the course (not an edit) before
    // the caches refresh, so only new reviews get a celebration.
    onMutate: () => {
      const onCourse = queryClient.getQueryData<PublicReview[]>(["ratings", code]) ?? [];
      const mine = queryClient.getQueriesData<RatingRow[]>({ queryKey: ["my-ratings"] });
      const reviewedBefore =
        onCourse.some((review) => review.is_mine) ||
        mine.some(([, rows]) => rows?.some((row) => row.course_code === code));
      return { reviewedBefore };
    },
    onSuccess: (_data, _input, context) => {
      if (!context?.reviewedBefore) celebrateEagleWith("reviewPosted");
      void queryClient.invalidateQueries({ queryKey: ["ratings", code] });
      void queryClient.invalidateQueries({ queryKey: ["rating-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["my-ratings"] });
    },
  });
}

export function useDeleteRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, courseCode }: { id: string; courseCode: string }) => {
      const { error } = await supabase.from("course_ratings").delete().eq("id", id);
      if (error) throw new Error(`Could not delete your review: ${error.message}`);
      return courseCode;
    },
    onSuccess: (courseCode) => {
      void queryClient.invalidateQueries({ queryKey: ["my-ratings"] });
      void queryClient.invalidateQueries({ queryKey: ["ratings", courseCode] });
      void queryClient.invalidateQueries({ queryKey: ["rating-stats"] });
      announce(`Your review for ${courseCode} was deleted.`);
    },
  });
}

export function useShortlist() {
  return useQuery({
    queryKey: ["shortlist"],
    queryFn: async () => {
      const { data: auth, error: authError } = await getSessionUser();
      if (authError) throw new Error(`Authentication failed: ${authError.message}`);
      if (!auth.user) return [] as string[];

      const { data, error } = await supabase
        .from("shortlists")
        .select("course_code")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(`Could not load shortlist: ${error.message}`);
      return (data ?? []).map((row) => row.course_code as string);
    },
    staleTime: 15_000,
    retry: 1,
  });
}

export function useToggleShortlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, saved }: { code: string; saved: boolean }) => {
      const { data: auth, error: authError } = await getSessionUser();
      if (authError) throw new Error(`Authentication failed: ${authError.message}`);
      const userId = auth.user?.id;
      if (!userId) throw new Error("You need to sign in to save courses.");

      if (saved) {
        const { error } = await supabase
          .from("shortlists")
          .delete()
          .eq("user_id", userId)
          .eq("course_code", code);
        if (error) throw new Error(`Could not remove ${code} from shortlist: ${error.message}`);
        return;
      }

      const { error } = await supabase
        .from("shortlists")
        .upsert(
          { user_id: userId, course_code: code },
          { onConflict: "user_id,course_code", ignoreDuplicates: true },
        );
      if (error) throw new Error(`Could not save ${code} to shortlist: ${error.message}`);
    },
    onMutate: async ({ code, saved }) => {
      await queryClient.cancelQueries({ queryKey: ["shortlist"] });
      const previous = queryClient.getQueryData<string[]>(["shortlist"]) ?? [];

      const next = saved
        ? previous.filter((item) => item !== code)
        : [...new Set([code, ...previous])];
      queryClient.setQueryData(["shortlist"], next);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["shortlist"], context.previous);
      }
    },
    onSuccess: (_data, { code, saved }) => {
      announce(saved ? `${code} removed from your shortlist.` : `${code} added to your shortlist.`);
      if (!saved) {
        celebrateEagleWith("courseAdded", { code });
        recordSubjectInterest(code.replace(/[0-9].*$/, ""), 2);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["shortlist"] });
      void queryClient.invalidateQueries({ queryKey: ["achievement-shortlist"] });
      void queryClient.invalidateQueries({ queryKey: ["achievement-earned"] });
    },
  });
}

/**
 * Whether the signed-in user can post reviews: Google-style sign-ins count as
 * verified; email sign-ups need to have confirmed the link we email them. The
 * server enforces this too, so on a read error the form is shown and the
 * server has the final say.
 */
export function useReviewVerification(user: User | null) {
  const providers = (user?.app_metadata?.providers ?? []) as string[];
  const viaProvider = providers.some((provider) => provider !== "email");
  const query = useQuery({
    queryKey: ["review-verified", user?.id ?? null],
    enabled: Boolean(user) && !viaProvider,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("review_email_verifications")
        .select("user_id")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) return true;
      return Boolean(data);
    },
    staleTime: 5 * 60_000,
  });
  if (!user) return { verified: false, loading: false };
  if (viaProvider) return { verified: true, loading: false };
  return { verified: query.data ?? false, loading: query.isPending };
}

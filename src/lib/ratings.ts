import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { validateRatingInput } from "@/lib/validation";
import { announce } from "@/lib/a11y";

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

export function useCourseStats(code: string) {
  return useQuery({
    queryKey: ["rating-stats", code],
    enabled: Boolean(code),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_rating_stats")
        .select("*")
        .eq("course_code", code)
        .maybeSingle();
      if (error) throw new Error(`Could not load rating stats: ${error.message}`);
      if (!data) return null;

      const values = data as Record<string, unknown>;
      return {
        rating_count: Number(values["rating_count"] ?? 0),
        avg_rating: Number(values["avg_rating"] ?? 0),
        avg_difficulty: Number(values["avg_difficulty"] ?? 0),
        avg_workload: Number(values["avg_workload"] ?? 0),
        pct_would_take_again: Number(values["pct_would_take_again"] ?? 0),
      } as RatingStats;
    },
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
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error(`Authentication failed: ${authError.message}`);
      const userId = auth.user?.id;
      if (!userId) throw new Error("You need to sign in to rate a course.");

      const { error } = await supabase
        .from("course_ratings")
        .upsert({ ...input, user_id: userId }, { onConflict: "user_id,course_code" });
      if (error) throw new Error(`Could not save rating: ${error.message}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ratings", code] });
      void queryClient.invalidateQueries({ queryKey: ["rating-stats", code] });
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
      void queryClient.invalidateQueries({ queryKey: ["rating-stats", courseCode] });
      announce(`Your review for ${courseCode} was deleted.`);
    },
  });
}

export function useShortlist() {
  return useQuery({
    queryKey: ["shortlist"],
    queryFn: async () => {
      const { data: auth, error: authError } = await supabase.auth.getUser();
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
      const { data: auth, error: authError } = await supabase.auth.getUser();
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
      if (!saved)
        window.dispatchEvent(new CustomEvent("study-eagle-celebrate", { detail: { code } }));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["shortlist"] });
    },
  });
}

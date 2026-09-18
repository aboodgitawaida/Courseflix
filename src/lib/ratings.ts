import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
        .from("course_ratings")
        .select("*")
        .eq("course_code", code)
        .order("created_at", { ascending: false });
      if (error) throw new Error(`Could not load ratings: ${error.message}`);
      return (data ?? []) as RatingRow[];
    },
    retry: 1,
  });
}

export function useCourseStats(code: string) {
  return useQuery({
    queryKey: ["rating-stats", code],
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["shortlist"] });
    },
  });
}

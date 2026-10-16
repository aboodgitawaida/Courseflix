import { useEffect } from "react";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RatingRow } from "@/lib/ratings";
import { getSessionUser } from "@/lib/session";
import { celebrateEagleWith } from "@/lib/study-eagle";

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  progress: number;
  unlocked: boolean;
  accent: string;
};

const definitions = [
  {
    id: "first-shortlist",
    name: "First Pick",
    description: "Save your first course to the shortlist.",
    icon: "/achievements/first-shortlist.png",
    requirement: 1,
    accent: "from-red-500/25 to-orange-400/10",
  },
  {
    id: "shortlist-five",
    name: "The Collector",
    description: "Build a shortlist of five courses.",
    icon: "/achievements/shortlist-five.png",
    requirement: 5,
    accent: "from-amber-400/25 to-red-500/10",
  },
  {
    id: "first-review",
    name: "Say Your Piece",
    description: "Leave your first course review.",
    icon: "/achievements/first-review.png",
    requirement: 1,
    accent: "from-sky-400/25 to-indigo-400/10",
  },
  {
    id: "review-ten",
    name: "Campus Critic",
    description: "Review ten different courses.",
    icon: "/achievements/review-ten.png",
    requirement: 10,
    accent: "from-violet-400/25 to-fuchsia-400/10",
  },
  {
    id: "first-friend",
    name: "Open Door",
    description: "Add your first friend.",
    icon: "/achievements/first-friend.png",
    requirement: 1,
    accent: "from-pink-400/25 to-rose-400/10",
  },
  {
    id: "five-friends",
    name: "Study Circle",
    description: "Grow your friend circle to five.",
    icon: "/achievements/five-friends.png",
    requirement: 5,
    accent: "from-emerald-400/25 to-teal-400/10",
  },
  {
    id: "course-explorer",
    name: "Course Explorer",
    description: "Review or save courses from three subject areas.",
    icon: "/achievements/course-explorer.png",
    requirement: 3,
    accent: "from-cyan-400/25 to-blue-400/10",
  },
  {
    id: "campus-voice",
    name: "Campus Voice",
    description: "Share ten course experiences with UTM.",
    icon: "/achievements/campus-voice.png",
    requirement: 10,
    accent: "from-lime-400/25 to-green-400/10",
  },
] as const;

export function achievementDefinition(id: string) {
  return definitions.find((definition) => definition.id === id);
}

export async function createAchievementNotifications(ids: string[]) {
  if (ids.length === 0) return;
  const { data: auth, error: authError } = await getSessionUser();
  if (authError) throw authError;
  if (!auth.user) return;
  const { data: existing, error: existingError } = await supabase
    .from("notifications")
    .select("course_code")
    .eq("user_id", auth.user.id)
    .eq("kind", "achievement_unlocked")
    .in("course_code", ids);
  if (existingError) throw existingError;
  const known = new Set((existing ?? []).map((row) => row.course_code));
  const newIds = ids.filter((id) => !known.has(id));
  if (newIds.length === 0) return;
  const { error } = await supabase.from("notifications").insert(
    newIds.map((id) => ({
      user_id: auth.user!.id,
      kind: "achievement_unlocked",
      course_code: id,
    })),
  );
  if (error) {
    if (error.code !== "23505") throw error;
    return; // another tab announced them first
  }
  if (newIds.length === 1) {
    celebrateEagleWith(
      "achievement",
      { name: achievementDefinition(newIds[0])?.name ?? "a new badge" },
      "trophy",
    );
  } else {
    celebrateEagleWith("achievements", { count: newIds.length }, "trophy");
  }
}

async function loadShortlist() {
  const { data: auth, error: authError } = await getSessionUser();
  if (authError) throw authError;
  if (!auth.user) return [] as string[];
  const { data, error } = await supabase
    .from("shortlists")
    .select("course_code")
    .eq("user_id", auth.user.id);
  if (error) throw error;
  return (data ?? []).map((row) => row.course_code as string);
}

/**
 * Achievements recorded when first earned; they never expire. user_achievements is
 * written server-side by triggers. Unlock notifications are a second record, so
 * earned badges stay put even where the permanent_achievements migration hasn't run.
 */
async function loadEarned() {
  const { data: auth, error: authError } = await getSessionUser();
  if (authError) throw authError;
  if (!auth.user) return [] as string[];
  const [recorded, announced] = await Promise.all([
    supabase.from("user_achievements").select("achievement_id").eq("user_id", auth.user.id),
    supabase
      .from("notifications")
      .select("course_code")
      .eq("user_id", auth.user.id)
      .eq("kind", "achievement_unlocked"),
  ]);
  if (recorded.error) {
    console.warn(
      "user_achievements is unavailable; run the permanent_achievements migration.",
      recorded.error.message,
    );
  }
  return [
    ...(recorded.data ?? []).map((row) => row.achievement_id),
    ...(announced.data ?? []).map((row) => row.course_code).filter((id): id is string => !!id),
  ];
}

async function loadRatings() {
  const { data: auth, error: authError } = await getSessionUser();
  if (authError) throw authError;
  if (!auth.user) return [] as RatingRow[];
  const { data, error } = await supabase
    .from("course_ratings")
    .select(
      "id, user_id, course_code, rating, difficulty, workload, would_take_again, prof_name, comment, created_at",
    )
    .eq("user_id", auth.user.id);
  if (error) throw error;
  return (data ?? []) as RatingRow[];
}

async function countFriends() {
  const { data: auth, error: authError } = await getSessionUser();
  if (authError) throw authError;
  if (!auth.user) return 0;
  const { count, error } = await supabase
    .from("friendships")
    .select("id", { count: "exact", head: true })
    .eq("status", "accepted")
    .or(`requester_id.eq.${auth.user.id},addressee_id.eq.${auth.user.id}`);
  if (error) throw error;
  return count ?? 0;
}

function subject(code: string) {
  return code.replace(/[0-9].*$/, "").trim();
}

export function useAchievements(enabled: boolean) {
  const queryClient = useQueryClient();
  const results = useQueries({
    queries: [
      { queryKey: ["achievement-shortlist"], queryFn: loadShortlist, enabled },
      { queryKey: ["achievement-ratings"], queryFn: loadRatings, enabled },
      { queryKey: ["achievement-friends"], queryFn: countFriends, enabled },
      { queryKey: ["achievement-earned"], queryFn: loadEarned, enabled },
    ],
  });
  const shortlistCodes = results[0].data ?? [];
  const shortlist = shortlistCodes.length;
  const ratings = results[1].data ?? [];
  const friends = results[2].data ?? 0;
  const earned = new Set(results[3].data ?? []);
  const reviewedSubjects = new Set(ratings.map((rating) => subject(rating.course_code)));
  const ratedOrSavedSubjects = new Set([...reviewedSubjects, ...shortlistCodes.map(subject)]);
  const ratingQuery = results[1];
  const shortlistQuery = results[0];
  const friendsQuery = results[2];
  const earnedQuery = results[3];
  const isLoading = results.some((result) => result.isLoading);
  const error = results.find((result) => result.error)?.error ?? null;
  const values: Record<string, number> = {
    "first-shortlist": shortlist,
    "shortlist-five": shortlist,
    "first-review": ratings.length,
    "review-ten": ratings.length,
    "first-friend": friends,
    "five-friends": friends,
    "course-explorer": ratedOrSavedSubjects.size,
    "campus-voice": ratings.length,
  };
  const achievements = definitions.map((definition) => {
    // Once earned, an achievement stays unlocked (and full) even if the count drops later.
    const unlocked =
      earned.has(definition.id) || (values[definition.id] ?? 0) >= definition.requirement;
    const progress = unlocked
      ? definition.requirement
      : Math.min(definition.requirement, values[definition.id] ?? 0);
    return { ...definition, progress, unlocked };
  });
  const unlockedKey =
    isLoading || error
      ? ""
      : achievements
          .filter((a) => a.unlocked)
          .map((a) => a.id)
          .join(",");
  const newlyUnlocked = unlockedKey.split(",").filter((id) => id && !earned.has(id));
  const newlyUnlockedKey = newlyUnlocked.join(",");
  useEffect(() => {
    if (!enabled || !newlyUnlockedKey) return;
    createAchievementNotifications(newlyUnlockedKey.split(","))
      .then(() => queryClient.invalidateQueries({ queryKey: ["achievement-earned"] }))
      .catch(() => undefined);
  }, [enabled, newlyUnlockedKey, queryClient]);
  return {
    achievements,
    isLoading,
    error,
    refetch: () =>
      Promise.all([
        ratingQuery.refetch(),
        shortlistQuery.refetch(),
        friendsQuery.refetch(),
        earnedQuery.refetch(),
      ]),
  };
}

/** A friend's earned achievements (readable once you are accepted friends). */
export function useFriendAchievements(userId: string | null) {
  return useQuery({
    queryKey: ["friend-achievements", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_achievements")
        .select("achievement_id, unlocked_at")
        .eq("user_id", userId!);
      if (error) throw new Error(`Could not load achievements: ${error.message}`);
      const earned = new Map((data ?? []).map((row) => [row.achievement_id, row.unlocked_at]));
      return definitions.map((definition) => ({
        ...definition,
        unlocked: earned.has(definition.id),
        unlockedAt: earned.get(definition.id) ?? null,
      }));
    },
    retry: 1,
  });
}

import { useQueries } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RatingRow } from "@/lib/ratings";

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
  { id: "first-shortlist", name: "First Pick", description: "Save your first course to the shortlist.", icon: "/achievements/first-shortlist.png", requirement: 1, accent: "from-red-500/25 to-orange-400/10" },
  { id: "shortlist-five", name: "The Collector", description: "Build a shortlist of five courses.", icon: "/achievements/shortlist-five.png", requirement: 5, accent: "from-amber-400/25 to-red-500/10" },
  { id: "first-review", name: "Say Your Piece", description: "Leave your first course review.", icon: "/achievements/first-review.png", requirement: 1, accent: "from-sky-400/25 to-indigo-400/10" },
  { id: "review-ten", name: "Campus Critic", description: "Review ten different courses.", icon: "/achievements/review-ten.png", requirement: 10, accent: "from-violet-400/25 to-fuchsia-400/10" },
  { id: "first-friend", name: "Open Door", description: "Add your first friend.", icon: "/achievements/first-friend.png", requirement: 1, accent: "from-pink-400/25 to-rose-400/10" },
  { id: "five-friends", name: "Study Circle", description: "Grow your friend circle to five.", icon: "/achievements/five-friends.png", requirement: 5, accent: "from-emerald-400/25 to-teal-400/10" },
  { id: "course-explorer", name: "Course Explorer", description: "Review or save courses from three subject areas.", icon: "/achievements/course-explorer.png", requirement: 3, accent: "from-cyan-400/25 to-blue-400/10" },
  { id: "campus-voice", name: "Campus Voice", description: "Share ten course experiences with UTM.", icon: "/achievements/campus-voice.png", requirement: 10, accent: "from-lime-400/25 to-green-400/10" },
] as const;

async function loadShortlist() {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!auth.user) return [] as string[];
  const { data, error } = await supabase.from("shortlists").select("course_code").eq("user_id", auth.user.id);
  if (error) throw error;
  return (data ?? []).map((row) => row.course_code as string);
}

async function loadRatings() {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!auth.user) return [] as RatingRow[];
  const { data, error } = await supabase.from("course_ratings").select("id, user_id, course_code, rating, difficulty, workload, would_take_again, prof_name, comment, created_at").eq("user_id", auth.user.id);
  if (error) throw error;
  return (data ?? []) as RatingRow[];
}

async function countFriends() {
  const { data: auth, error: authError } = await supabase.auth.getUser();
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
  const results = useQueries({
    queries: [
      { queryKey: ["achievement-shortlist"], queryFn: loadShortlist, enabled },
      { queryKey: ["achievement-ratings"], queryFn: loadRatings, enabled },
      { queryKey: ["achievement-friends"], queryFn: countFriends, enabled },
    ],
  });
  const shortlistCodes = results[0].data ?? [];
  const shortlist = shortlistCodes.length;
  const ratings = results[1].data ?? [];
  const friends = results[2].data ?? 0;
  const reviewedSubjects = new Set(ratings.map((rating) => subject(rating.course_code)));
  const ratedOrSavedSubjects = new Set([...reviewedSubjects, ...shortlistCodes.map(subject)]);
  const ratingQuery = results[1];
  const shortlistQuery = results[0];
  const friendsQuery = results[2];
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
    const progress = Math.min(definition.requirement, values[definition.id] ?? 0);
    return { ...definition, progress, unlocked: progress >= definition.requirement };
  });
  return { achievements, isLoading, error, refetch: () => Promise.all([ratingQuery.refetch(), shortlistQuery.refetch(), friendsQuery.refetch()]) };
}

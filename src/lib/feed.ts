import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFriendships } from "@/lib/social";

export type FeedItem =
  | { kind: "shortlist"; id: string; userId: string; code: string; at: string }
  | { kind: "achievement"; id: string; userId: string; achievementId: string; at: string }
  | { kind: "friends"; id: string; userId: string; at: string };

/** Ids of the signed-in user's accepted friends, plus their profiles. */
export function useFriendIds() {
  const friendships = useFriendships();
  const uid = friendships.data?.uid ?? null;
  const ids = (friendships.data?.accepted ?? []).map((row) =>
    row.requester_id === uid ? row.addressee_id : row.requester_id,
  );
  return { ...friendships, uid, ids };
}

/**
 * Recent activity from friends, read straight from the source tables. RLS already
 * lets accepted friends read each other's shortlists and achievements, so this
 * keeps working even after someone clears their notifications.
 */
export function useFriendFeed() {
  const { ids, uid, data, isLoading: friendsLoading, error: friendsError } = useFriendIds();
  const query = useQuery({
    queryKey: ["friend-feed", uid, ids.join(",")],
    enabled: Boolean(uid) && ids.length > 0,
    queryFn: async () => {
      const [shortlists, achievements] = await Promise.all([
        supabase
          .from("shortlists")
          .select("id, user_id, course_code, created_at")
          .in("user_id", ids)
          .order("created_at", { ascending: false })
          .limit(60),
        supabase
          .from("user_achievements")
          .select("user_id, achievement_id, unlocked_at")
          .in("user_id", ids)
          .order("unlocked_at", { ascending: false })
          .limit(40),
      ]);
      if (shortlists.error) throw new Error(`Could not load feed: ${shortlists.error.message}`);
      const items: FeedItem[] = (shortlists.data ?? []).map((row) => ({
        kind: "shortlist",
        id: `s-${row.id}`,
        userId: row.user_id,
        code: row.course_code,
        at: row.created_at,
      }));
      // Achievements are a bonus; a failure here shouldn't hide the whole feed.
      for (const row of achievements.data ?? []) {
        items.push({
          kind: "achievement",
          id: `a-${row.user_id}-${row.achievement_id}`,
          userId: row.user_id,
          achievementId: row.achievement_id,
          at: row.unlocked_at,
        });
      }
      return items;
    },
    refetchInterval: 60_000,
    retry: 1,
  });

  const friendItems: FeedItem[] = (data?.accepted ?? []).map((row) => ({
    kind: "friends",
    id: `f-${row.id}`,
    userId: row.requester_id === uid ? row.addressee_id : row.requester_id,
    at: row.created_at,
  }));
  const items = [...(query.data ?? []), ...friendItems].sort((a, b) => b.at.localeCompare(a.at));

  return {
    items,
    people: data?.people,
    friendCount: ids.length,
    signedIn: Boolean(uid),
    isLoading: friendsLoading || query.isLoading,
    error: friendsError ?? query.error,
    refetch: query.refetch,
  };
}

/** Which of your friends have shortlisted a course. */
export function useFriendsOnCourse(code: string) {
  const { ids, uid, data } = useFriendIds();
  const query = useQuery({
    queryKey: ["friends-on-course", code, ids.join(",")],
    enabled: Boolean(uid) && ids.length > 0,
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("shortlists")
        .select("user_id")
        .eq("course_code", code)
        .in("user_id", ids);
      if (error) throw new Error(error.message);
      return [...new Set((rows ?? []).map((row) => row.user_id))];
    },
    retry: 1,
  });
  return {
    friendIds: query.data ?? [],
    people: data?.people,
  };
}

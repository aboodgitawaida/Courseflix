import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFriendships } from "@/lib/social";

/** Ids of the signed-in user's accepted friends, plus their profiles. */
export function useFriendIds() {
  const friendships = useFriendships();
  const uid = friendships.data?.uid ?? null;
  const ids = (friendships.data?.accepted ?? []).map((row) =>
    row.requester_id === uid ? row.addressee_id : row.requester_id,
  );
  return { ...friendships, uid, ids };
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

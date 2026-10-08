import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/profile";

export type Friendship = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  actor_id: string | null;
  kind: string;
  course_code: string | null;
  read: boolean;
  created_at: string;
};

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user?.id ?? null;
}

async function profilesByIds(ids: string[]) {
  if (ids.length === 0) return new Map<string, Profile>();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_id, major_id, year, is_private, is_verified")
    .in("id", ids);

  // Notifications should still render when one actor profile is unavailable.
  if (error) return new Map<string, Profile>();
  return new Map((data as Profile[]).map((profile) => [profile.id, profile]));
}

export function useFriendships() {
  return useQuery({
    queryKey: ["friendships"],
    queryFn: async () => {
      const uid = await currentUserId();
      if (!uid) {
        return {
          uid: null,
          accepted: [] as Friendship[],
          incoming: [] as Friendship[],
          outgoing: [] as Friendship[],
          people: new Map<string, Profile>(),
        };
      }

      const { data, error } = await supabase
        .from("friendships")
        .select("id, requester_id, addressee_id, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw new Error(`Could not load friendships: ${error.message}`);

      const rows = (data ?? []) as Friendship[];
      const people = await profilesByIds([
        ...new Set(rows.flatMap((row) => [row.requester_id, row.addressee_id])),
      ]);

      return {
        uid,
        accepted: rows.filter((row) => row.status === "accepted"),
        incoming: rows.filter((row) => row.status === "pending" && row.addressee_id === uid),
        outgoing: rows.filter((row) => row.status === "pending" && row.requester_id === uid),
        people,
      };
    },
    refetchInterval: 60_000,
    retry: 1,
  });
}

export function useProfileSearch(query: string) {
  const normalizedQuery = query.trim().slice(0, 80);
  return useQuery({
    queryKey: ["profile-search", normalizedQuery],
    enabled: normalizedQuery.length >= 2,
    queryFn: async () => {
      const q = normalizedQuery.replace(/[\\%_,()]/g, "\\$&");
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_id, major_id, year, is_private, is_verified")
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
        .limit(20);
      if (error) throw new Error(`Could not search profiles: ${error.message}`);
      const found = (data ?? []) as Profile[];

      // Private accounts are hidden from search; an exact username still finds them.
      const handle = normalizedQuery.replace(/^@/, "");
      if (/^[a-zA-Z0-9_.]{3,24}$/.test(handle)) {
        const { data: exact } = await supabase.rpc("find_profile_by_username", {
          _username: handle,
        });
        for (const profile of (exact ?? []) as Profile[]) {
          if (!found.some((p) => p.id === profile.id)) found.unshift(profile);
        }
      }
      return found;
    },
    retry: 1,
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (addresseeId: string) => {
      const uid = await currentUserId();
      if (!uid) throw new Error("You need to sign in first.");
      if (uid === addresseeId) throw new Error("You cannot add yourself.");

      const { error } = await supabase
        .from("friendships")
        .insert({ requester_id: uid, addressee_id: addresseeId, status: "pending" });
      if (error) {
        if (error.code === "23505") {
          throw new Error("A friendship or pending request already exists with this student.");
        }
        throw new Error(`Could not send friend request: ${error.message}`);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["friendships"] });
      void queryClient.invalidateQueries({ queryKey: ["profile-view"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useRespondToRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, accept }: { id: string; accept: boolean }) => {
      if (accept) {
        const { error } = await supabase
          .from("friendships")
          .update({ status: "accepted" })
          .eq("id", id);
        if (error) throw new Error(`Could not accept friend request: ${error.message}`);
      } else {
        const { error } = await supabase.from("friendships").delete().eq("id", id);
        if (error) throw new Error(`Could not decline friend request: ${error.message}`);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["friendships"] });
      void queryClient.invalidateQueries({ queryKey: ["profile-view"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export type ProfileView = {
  id: string;
  display_name: string;
  username: string;
  avatar_id: string;
  is_private: boolean;
  is_verified: boolean;
  relationship: "self" | "friends" | "outgoing" | "incoming" | "none";
  friendship_id: string | null;
  can_view: boolean;
  major_id: string | null;
  year: number | null;
  friend_count: number | null;
  achievement_ids: string[] | null;
};

// The server decides which fields the viewer may see; hidden fields come back null.
export function useProfileView(username: string) {
  return useQuery({
    queryKey: ["profile-view", username.toLowerCase()],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_profile_by_username", {
        _username: username,
      });
      if (error) throw new Error(`Could not load profile: ${error.message}`);
      return ((data ?? [])[0] ?? null) as ProfileView | null;
    },
    retry: 1,
  });
}

export function useRemoveFriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("friendships").delete().eq("id", id);
      if (error) throw new Error(`Could not remove friend: ${error.message}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["friendships"] });
      void queryClient.invalidateQueries({ queryKey: ["profile-view"] });
    },
  });
}

export function useFriendShortlist(userId: string | null) {
  return useQuery({
    queryKey: ["friend-shortlist", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shortlists")
        .select("course_code")
        .eq("user_id", userId!);
      if (error) throw new Error(`Could not load friend shortlist: ${error.message}`);
      return (data ?? []).map((row) => row.course_code as string);
    },
    retry: 1,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const uid = await currentUserId();
      if (!uid) return { rows: [] as NotificationRow[], people: new Map<string, Profile>() };

      const { data, error } = await supabase
        .from("notifications")
        .select("id, user_id, actor_id, kind, course_code, read, created_at")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw new Error(`Could not load notifications: ${error.message}`);

      const rows = (data ?? []) as NotificationRow[];
      const people = await profilesByIds([
        ...new Set(
          rows.map((row) => row.actor_id).filter((value): value is string => Boolean(value)),
        ),
      ]);
      return { rows, people };
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
    retry: 1,
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const uid = await currentUserId();
      if (!uid) return;

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", uid)
        .eq("read", false);
      if (error) throw new Error(`Could not mark notifications read: ${error.message}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useClearNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const uid = await currentUserId();
      if (!uid) return;

      const { error } = await supabase.from("notifications").delete().eq("user_id", uid);
      if (error) throw new Error(`Could not clear notifications: ${error.message}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

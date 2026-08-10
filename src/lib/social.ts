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
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

async function profilesByIds(ids: string[]) {
  if (ids.length === 0) return new Map<string, Profile>();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_id, major_id, year, is_private")
    .in("id", ids);
  if (error) throw error;
  return new Map((data as Profile[]).map((p) => [p.id, p]));
}

export function useFriendships() {
  return useQuery({
    queryKey: ["friendships"],
    queryFn: async () => {
      const uid = await currentUserId();
      if (!uid) return { uid: null, accepted: [], incoming: [], outgoing: [], people: new Map<string, Profile>() };
      const { data, error } = await supabase
        .from("friendships")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as Friendship[];
      const people = await profilesByIds([
        ...new Set(rows.flatMap((r) => [r.requester_id, r.addressee_id])),
      ]);
      return {
        uid,
        accepted: rows.filter((r) => r.status === "accepted"),
        incoming: rows.filter((r) => r.status === "pending" && r.addressee_id === uid),
        outgoing: rows.filter((r) => r.status === "pending" && r.requester_id === uid),
        people,
      };
    },
  });
}

export function useProfileSearch(query: string) {
  return useQuery({
    queryKey: ["profile-search", query],
    enabled: query.trim().length >= 2,
    queryFn: async () => {
      const q = query.trim();
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_id, major_id, year, is_private")
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
        .limit(20);
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });
}

export function useSendFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (addresseeId: string) => {
      const uid = await currentUserId();
      if (!uid) throw new Error("You need to sign in first.");
      if (uid === addresseeId) throw new Error("You cannot add yourself.");
      const { error } = await supabase
        .from("friendships")
        .insert({ requester_id: uid, addressee_id: addresseeId, status: "pending" });
      if (error) {
        if (error.code === "23505") throw new Error("You already sent a request to this student.");
        throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["friendships"] }),
  });
}

export function useRespondToRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, accept }: { id: string; accept: boolean }) => {
      if (accept) {
        const { error } = await supabase.from("friendships").update({ status: "accepted" }).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("friendships").delete().eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friendships"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useRemoveFriend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("friendships").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["friendships"] }),
  });
}

export function useFriendShortlist(userId: string | null) {
  return useQuery({
    queryKey: ["friend-shortlist", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shortlists")
        .select("course_code")
        .eq("user_id", userId!);
      if (error) throw error;
      return (data ?? []).map((r) => r.course_code as string);
    },
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
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      const rows = (data ?? []) as NotificationRow[];
      const people = await profilesByIds([
        ...new Set(rows.map((r) => r.actor_id).filter((v): v is string => !!v)),
      ]);
      return { rows, people };
    },
    refetchInterval: 60000,
  });
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const uid = await currentUserId();
      if (!uid) return;
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", uid)
        .eq("read", false);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

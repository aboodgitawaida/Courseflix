import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  display_name: string;
  username: string | null;
  avatar_id: string;
  is_private: boolean;
  major_id: string | null;
  year: number | null;
};

export type Friendship = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
};

const PROFILE_COLS = "id, display_name, username, avatar_id, is_private, major_id, year";

export function useMyProfile() {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select(PROFILE_COLS)
        .eq("id", auth.user.id)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Profile | null;
    },
  });
}

export function useProfileByUsername(username: string) {
  return useQuery({
    queryKey: ["profile-username", username.toLowerCase()],
    enabled: !!username,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(PROFILE_COLS)
        .ilike("username", username)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Profile | null;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Pick<Profile, "display_name" | "username" | "avatar_id" | "is_private" | "major_id" | "year">>) => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error("You need to sign in first.");
      const clean = { ...patch };
      if (typeof clean.username === "string") {
        const u = clean.username.trim().toLowerCase();
        if (u && !/^[a-z0-9_]{3,20}$/.test(u))
          throw new Error("Username must be 3–20 characters: letters, numbers or underscores.");
        clean.username = u || null;
      }
      const { error } = await supabase.from("profiles").update(clean).eq("id", uid);
      if (error) {
        if (error.code === "23505") throw new Error("That username is already taken.");
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      qc.invalidateQueries({ queryKey: ["user-search"] });
    },
  });
}

export function useUserSearch(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: ["user-search", q.toLowerCase()],
    enabled: q.length >= 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(PROFILE_COLS)
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
        .limit(20);
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });
}

export function useFriendships() {
  return useQuery({
    queryKey: ["friendships"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return { rows: [] as Friendship[], profiles: {} as Record<string, Profile>, me: null as string | null };
      const { data, error } = await supabase
        .from("friendships")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as Friendship[];
      const ids = [...new Set(rows.flatMap((r) => [r.requester_id, r.addressee_id]))].filter(
        (id) => id !== auth.user!.id,
      );
      let profiles: Record<string, Profile> = {};
      if (ids.length) {
        const { data: ps } = await supabase.from("profiles").select(PROFILE_COLS).in("id", ids);
        profiles = Object.fromEntries(((ps ?? []) as Profile[]).map((p) => [p.id, p]));
      }
      return { rows, profiles, me: auth.user.id };
    },
  });
}

export function useSendFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (addresseeId: string) => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error("You need to sign in first.");
      if (uid === addresseeId) throw new Error("You can't add yourself.");
      const { error } = await supabase
        .from("friendships")
        .insert({ requester_id: uid, addressee_id: addresseeId, status: "pending" });
      if (error) {
        if (error.code === "23505") throw new Error("You already have a request with this student.");
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["friendships"] }),
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

export function useFriendShortlist(userId: string | undefined) {
  return useQuery({
    queryKey: ["friend-shortlist", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shortlists")
        .select("course_code, created_at")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Array<{ course_code: string; created_at: string }>;
    },
  });
}

export type Notification = {
  id: string;
  kind: "request" | "accepted" | "activity";
  title: string;
  body: string;
  at: string;
  actionId?: string;
};

const SEEN_KEY = "courseflix.notifications.seen";

export function useNotifications() {
  const { data } = useFriendships();
  return useQuery({
    queryKey: ["notifications", data?.rows.length ?? 0, data?.me],
    enabled: !!data?.me,
    queryFn: async (): Promise<Notification[]> => {
      const rows = data?.rows ?? [];
      const me = data?.me;
      const profiles = data?.profiles ?? {};
      const name = (id: string) => profiles[id]?.username ?? profiles[id]?.display_name ?? "A student";

      const out: Notification[] = [];
      for (const r of rows) {
        if (r.status === "pending" && r.addressee_id === me) {
          out.push({
            id: `req-${r.id}`,
            kind: "request",
            title: "New friend request",
            body: `${name(r.requester_id)} wants to compare shortlists.`,
            at: r.created_at,
            actionId: r.id,
          });
        }
        if (r.status === "accepted" && r.requester_id === me) {
          out.push({
            id: `acc-${r.id}`,
            kind: "accepted",
            title: "Friend request accepted",
            body: `${name(r.addressee_id)} accepted your request.`,
            at: r.created_at,
          });
        }
      }

      const friendIds = rows
        .filter((r) => r.status === "accepted")
        .map((r) => (r.requester_id === me ? r.addressee_id : r.requester_id));

      if (friendIds.length) {
        const { data: acts } = await supabase
          .from("shortlists")
          .select("user_id, course_code, created_at")
          .in("user_id", friendIds)
          .order("created_at", { ascending: false })
          .limit(10);
        for (const a of acts ?? []) {
          out.push({
            id: `act-${a.user_id}-${a.course_code}`,
            kind: "activity",
            title: "Friend activity",
            body: `${name(a.user_id as string)} added ${a.course_code} to their list.`,
            at: a.created_at as string,
          });
        }
      }

      return out.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 20);
    },
  });
}

export function getSeenAt() {
  if (typeof window === "undefined") return 0;
  return Number(window.localStorage.getItem(SEEN_KEY) ?? 0);
}

export function markNotificationsSeen() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SEEN_KEY, String(Date.now()));
}

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/profile";

// Notification loading must not fail just because an actor profile is missing
// or an old database has not yet added the newer profile columns.
async function profilesByIds(ids: string[]) {
  if (!ids.length) return new Map<string, Profile>();
  const { data, error } = await supabase.from("profiles").select("id, display_name, username, avatar_id, major_id, year, is_private").in("id", ids);
  if (error) return new Map<string, Profile>();
  return new Map((data as Profile[]).map((p) => [p.id, p]));
}

export type Friendship = { id: string; requester_id: string; addressee_id: string; status: string; created_at: string };
export type NotificationRow = { id: string; user_id: string; actor_id: string | null; kind: string; course_code: string | null; read: boolean; created_at: string };

async function currentUserId() { const { data, error } = await supabase.auth.getUser(); if (error) throw error; return data.user?.id ?? null; }

export function useNotifications() { return useQuery({ queryKey: ["notifications"], queryFn: async () => { const uid = await currentUserId(); if (!uid) return { rows: [] as NotificationRow[], people: new Map<string, Profile>() }; const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(30); if (error) throw new Error(`Could not load notifications: ${error.message}`); const rows = (data ?? []) as NotificationRow[]; return { rows, people: await profilesByIds([...new Set(rows.map((r) => r.actor_id).filter((v): v is string => !!v))]) }; }, refetchInterval: 60000, retry: 1, staleTime: 15000 }); }

export function useMarkNotificationsRead() { const qc = useQueryClient(); return useMutation({ mutationFn: async () => { const uid = await currentUserId(); if (!uid) return; const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", uid).eq("read", false); if (error) throw new Error(`Could not mark notifications read: ${error.message}`); }, onSuccess: () => { void qc.invalidateQueries({ queryKey: ["notifications"] }); } }); }

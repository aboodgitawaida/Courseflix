import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import hmalc from "@/assets/avatars/hmalc.png";
import cntower from "@/assets/avatars/cntower.png";
import squirrel from "@/assets/avatars/squirrel.png";
import goose from "@/assets/avatars/goose.png";
import maanjiwe from "@/assets/avatars/maanjiwe.png";
import coffee from "@/assets/avatars/coffee.png";

export type Profile = {
  id: string;
  display_name: string;
  username: string | null;
  avatar_id: string;
  major_id: string | null;
  year: number | null;
  is_private: boolean;
};

export const AVATARS: Array<{ id: string; label: string; src: string }> = [
  { id: "hmalc", label: "HMALC Library", src: hmalc },
  { id: "maanjiwe", label: "Maanjiwe nendamowinan", src: maanjiwe },
  { id: "cntower", label: "CN Tower", src: cntower },
  { id: "squirrel", label: "Campus Squirrel", src: squirrel },
  { id: "goose", label: "Angry Goose", src: goose },
  { id: "coffee", label: "8am Lecture Coffee", src: coffee },
];

export const avatarSrc = (id: string | null | undefined) =>
  AVATARS.find((a) => a.id === id)?.src ?? hmalc;

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_id, major_id, year, is_private")
        .eq("id", uid)
        .maybeSingle();
      if (error) throw error;
      return (data as Profile | null) ?? null;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Omit<Profile, "id">>) => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error("You need to sign in first.");

      // Upsert also repairs accounts created before the profile trigger existed.
      const { data, error } = await supabase
        .from("profiles")
        .upsert({ id: uid, ...patch }, { onConflict: "id" })
        .select("id, display_name, username, avatar_id, major_id, year, is_private")
        .single();

      if (error) {
        if (error.code === "23505") throw new Error("That username is already taken.");
        throw new Error(error.message || "Profile update failed.");
      }
      if (!data) throw new Error("Profile was not updated.");
      return data as Profile;
    },
    onSuccess: (profile) => {
      qc.setQueryData(["profile"], profile);
      void qc.invalidateQueries({ queryKey: ["profile-search"] });
    },
  });
}

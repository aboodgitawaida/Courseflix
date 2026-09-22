import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { MAJORS } from "@/lib/majors";
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

export const AVATARS = [
  { id: "hmalc", label: "HMALC Library", src: hmalc },
  { id: "maanjiwe", label: "Maanjiwe nendamowinan", src: maanjiwe },
  { id: "cntower", label: "CN Tower", src: cntower },
  { id: "squirrel", label: "Campus Squirrel", src: squirrel },
  { id: "goose", label: "Angry Goose", src: goose },
  { id: "coffee", label: "8am Lecture Coffee", src: coffee },
] as const;

export const avatarSrc = (id: string | null | undefined) =>
  AVATARS.find((a) => a.id === id)?.src ?? hmalc;

const PROFILE_COLUMNS = "id, display_name, username, avatar_id, major_id, year, is_private";

const profilePatchSchema = z
  .object({
    display_name: z.string().trim().min(1).max(40).optional(),
    username: z
      .string()
      .trim()
      .regex(
        /^[a-z0-9_.]{3,24}$/,
        "Usernames must be 3–24 characters using letters, numbers, underscores, or periods.",
      )
      .nullable()
      .optional(),
    avatar_id: z.enum(AVATARS.map((avatar) => avatar.id) as [string, ...string[]]).optional(),
    major_id: z
      .string()
      .refine((id) => MAJORS.some((major) => major.id === id), "That program is not recognized.")
      .nullable()
      .optional(),
    year: z.number().int().min(1).max(5).nullable().optional(),
    is_private: z.boolean().optional(),
  })
  .strict();

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ["profile", userId ?? null],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) return null;
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const uid = authData.user?.id;
      if (!uid) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .eq("id", uid)
        .maybeSingle();
      if (error) throw error;
      if (data) return data as Profile;

      const { data: created, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: uid,
          display_name:
            authData.user.user_metadata?.display_name ??
            authData.user.email?.split("@")[0] ??
            "UTM student",
          avatar_id: "hmalc",
          is_private: false,
        })
        .select(PROFILE_COLUMNS)
        .single();
      if (createError) throw createError;
      return created as Profile;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Omit<Profile, "id">>) => {
      const validatedPatch = profilePatchSchema.parse(patch);
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error("You need to sign in first.");

      // Only send fields being changed. Sending fallback defaults here used to
      // overwrite the saved name/avatar/privacy whenever another field changed.
      const { data, error } = await supabase
        .from("profiles")
        .update(validatedPatch)
        .eq("id", uid)
        .select(PROFILE_COLUMNS)
        .maybeSingle();

      if (error) {
        if (error.code === "23505") throw new Error("That username is already taken.");
        throw new Error(error.message || "Profile update failed.");
      }

      if (data) return data as Profile;

      // Recover accounts created before the profile trigger/table was available.
      const { data: created, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: uid,
          display_name:
            auth.user.user_metadata?.display_name ??
            auth.user.email?.split("@")[0] ??
            "UTM student",
          avatar_id: "hmalc",
          is_private: false,
          ...validatedPatch,
        })
        .select(PROFILE_COLUMNS)
        .single();
      if (createError) {
        if (createError.code === "23505") throw new Error("That username is already taken.");
        throw new Error(createError.message || "Profile update failed.");
      }
      return created as Profile;
    },
    onSuccess: (profile) => {
      qc.setQueryData(["profile", profile.id], profile);
      void qc.invalidateQueries({ queryKey: ["profile-search"] });
    },
  });
}

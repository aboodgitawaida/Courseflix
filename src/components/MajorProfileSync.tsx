import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMajor } from "@/hooks/use-major";
import { useProfile, useUpdateProfile } from "@/lib/profile";

/**
 * Keeps the browser's program choice and the signed-in profile's major_id in
 * step: a new device adopts the profile's program, and picking a program
 * saves it to the profile.
 */
export function MajorProfileSync() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { major, setMajor, hydrated } = useMajor();
  const update = useUpdateProfile();
  const synced = useRef<{ userId: string; majorId: string | null } | null>(null);

  useEffect(() => {
    if (!hydrated || !profile) return;

    if (synced.current?.userId !== profile.id) {
      synced.current = { userId: profile.id, majorId: profile.major_id };
      if (!major && profile.major_id) {
        setMajor(profile.major_id);
        return;
      }
    }

    if (major && major !== profile.major_id && major !== synced.current.majorId) {
      synced.current = { userId: profile.id, majorId: major };
      update.mutate({ major_id: major });
    }
    // update.mutate is stable enough for this fire-and-forget sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, profile, major]);

  return null;
}

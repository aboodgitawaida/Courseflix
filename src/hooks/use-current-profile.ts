import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/lib/profile";

// Profile query consumers must use the authenticated user id so a pre-login null
// result can never be reused after auth completes.
export function useCurrentProfile() {
  const { user } = useAuth();
  return useProfile(user?.id);
}

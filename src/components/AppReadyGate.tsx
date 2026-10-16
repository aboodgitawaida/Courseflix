import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMajor } from "@/hooks/use-major";
import { APP_READY_CLASS } from "@/lib/auth-hint";

/**
 * Reveals the page for returning visitors (see RETURNING_HEAD_SCRIPT) once the
 * session and saved program are known, so the first thing they see is already
 * their own account state rather than the anonymous server HTML.
 */
export function AppReadyGate() {
  const { loading } = useAuth();
  const { hydrated } = useMajor();

  useEffect(() => {
    if (loading || !hydrated) return;
    // Two frames: let the components that consume the session/program paint first.
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => document.documentElement.classList.add(APP_READY_CLASS));
    });
    return () => cancelAnimationFrame(id);
  }, [loading, hydrated]);

  return null;
}

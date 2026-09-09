import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        console.log("Initial session:", data.session);
        setSession(data.session);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (mounted) {
        console.log("Auth state changed:", event, s);
        setSession(s);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const user: User | null = session?.user ?? null;
  console.log("Auth state:", { session, user, loading, signedIn: !!user });
  return { session, user, loading, signedIn: !!user };
}

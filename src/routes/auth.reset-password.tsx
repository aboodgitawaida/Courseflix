import { createFileRoute, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — courseflix UTM" },
      { name: "description", content: "Reset your courseflix password." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract access token from URL hash
    const hashParams = new URLSearchParams(location.hash.slice(1));
    const accessToken = hashParams.get('access_token');
    
    if (accessToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: hashParams.get('refresh_token') || '',
      }).then(({ error }) => {
        if (error) {
          toast.error("Invalid or expired reset link");
          navigate({ to: "/auth", replace: true });
        } else {
          setLoading(false);
        }
      });
    } else {
      // Check for query parameters as fallback
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      
      if (code) {
        // If using code-based flow, let Supabase handle it
        setLoading(false);
      } else {
        toast.error("No reset token found");
        navigate({ to: "/auth", replace: true });
      }
    }
  }, [location.hash, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      if (error) throw error;
      toast.success("Password updated successfully!");
      navigate({ to: "/auth", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 py-16">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-3xl border border-border/50 bg-surface p-6 md:p-8">
        <h1 className="font-display text-2xl font-bold">Reset your password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your new password below.
        </p>

        <form onSubmit={onSubmit} className="space-y-3 mt-6">
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full h-11 rounded-xl bg-surface-2 border border-border/50 px-3 text-sm outline-none focus:border-brand/60"
          />
          <button
            disabled={busy}
            className="w-full h-11 rounded-xl bg-brand text-primary-foreground font-semibold text-sm hover:bg-brand-glow transition disabled:opacity-60"
          >
            {busy ? "…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}

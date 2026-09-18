import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function establishRecoverySession() {
      // Use window.location here because the router's `location.search` is a
      // parsed search object, not the raw query string from the URL.
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const searchParams = new URLSearchParams(window.location.search);
      const authError =
        hashParams.get("error_description") ||
        searchParams.get("error_description") ||
        hashParams.get("error") ||
        searchParams.get("error");

      if (authError) {
        toast.error(decodeURIComponent(authError.replace(/\+/g, " ")));
        if (active) navigate({ to: "/auth", replace: true });
        return;
      }

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");

      let error: { message: string } | null = null;

      if (accessToken && refreshToken) {
        ({ error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }));
      } else if (code) {
        ({ error } = await supabase.auth.exchangeCodeForSession(code));
      } else if (tokenHash) {
        ({ error } = await supabase.auth.verifyOtp({
          type: "recovery",
          token_hash: tokenHash,
        }));
      } else {
        error = { message: "No reset token found" };
      }

      if (!active) return;

      if (error) {
        toast.error(error.message || "Invalid or expired reset link");
        navigate({ to: "/auth", replace: true });
        return;
      }

      setLoading(false);
    }

    void establishRecoverySession();
    return () => {
      active = false;
    };
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
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
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 py-16 relative">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand/3 rounded-full blur-[100px]" />
        </div>
        <div className="text-sm text-neutral-500 relative z-10">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 py-16 relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand/3 rounded-full blur-[100px]" />
      </div>
      <div className="w-full max-w-sm rounded-3xl border border-white/[0.08] bg-surface p-6 md:p-8 relative z-10">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Reset your password</h1>
        <p className="text-sm text-neutral-500 mt-1">
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
            className="w-full h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 text-sm outline-none focus:border-brand/60 focus:ring-2 focus:ring-white/30"
          />
          <button
            disabled={busy}
            className="w-full h-11 rounded-xl bg-brand text-primary-foreground font-semibold text-sm hover:bg-brand-glow transition disabled:opacity-60 active:scale-[0.98]"
          >
            {busy ? "…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}

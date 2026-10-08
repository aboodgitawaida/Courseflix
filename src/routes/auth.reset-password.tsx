import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PageBackdrop } from "@/components/PageBackdrop";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
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
  const [readyToVerify, setReadyToVerify] = useState(false);

  useEffect(() => {
    let active = true;

    function inspectRecoveryLink() {
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

      const hasRecoveryToken =
        (hashParams.has("access_token") && hashParams.has("refresh_token")) ||
        searchParams.has("code") ||
        searchParams.has("token_hash");

      if (!hasRecoveryToken) {
        toast.error("No reset token found");
        navigate({ to: "/auth", replace: true });
        return;
      }

      setLoading(false);
      setReadyToVerify(true);
    }

    inspectRecoveryLink();
    return () => {
      active = false;
    };
  }, [navigate]);

  async function verifyRecoveryLink() {
    setBusy(true);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const searchParams = new URLSearchParams(window.location.search);
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
    }

    if (error) {
      toast.error(error.message || "Invalid or expired reset link");
      navigate({ to: "/auth", replace: true });
    } else {
      setReadyToVerify(false);
    }
    setBusy(false);
  }

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
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-clip px-6 pb-32 pt-16 text-foreground lg:pb-16">
        <PageBackdrop />
        <div className="text-sm text-neutral-500 relative z-10">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-clip px-6 pb-32 pt-16 text-foreground lg:pb-16">
      <PageBackdrop />
      <div className="wordmark relative z-10 mb-10 text-3xl leading-none">Courseflix</div>
      <div className="glass relative z-10 w-full max-w-md rounded-[2rem] p-7 md:p-10">
        {readyToVerify ? (
          <>
            <h1 className="font-mega text-3xl font-extrabold tracking-[-0.04em] text-white">
              Continue password reset
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Click continue when you are ready to use this one-time reset link.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void verifyRecoveryLink()}
              className="mt-6 w-full shine h-12 rounded-2xl bg-brand text-primary-foreground font-semibold text-sm shadow-lg shadow-brand/30 hover:bg-brand-glow transition disabled:opacity-60 active:scale-[0.98]"
            >
              {busy ? "Verifying…" : "Continue to reset password"}
            </button>
          </>
        ) : (
          <>
            <h1 className="font-mega text-3xl font-extrabold tracking-[-0.04em] text-white">
              Reset your password
            </h1>
            <p className="text-sm text-neutral-500 mt-1">Enter your new password below.</p>
            <form onSubmit={onSubmit} className="space-y-3 mt-6">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="w-full h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] px-4 text-sm outline-none transition focus:border-brand/60 focus:ring-4 focus:ring-brand/15"
              />
              <button
                disabled={busy}
                className="w-full shine h-12 rounded-2xl bg-brand text-primary-foreground font-semibold text-sm shadow-lg shadow-brand/30 hover:bg-brand-glow transition disabled:opacity-60 active:scale-[0.98]"
              >
                {busy ? "…" : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

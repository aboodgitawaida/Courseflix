import { createFileRoute, Outlet, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { resetPassword } from "@/lib/reset-password";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } =>
    typeof s['redirect'] === "string" ? { redirect: s['redirect'] as string } : {},

  head: () => ({
    meta: [
      { title: "Sign in — courseflix UTM" },
      { name: "description", content: "Create a courseflix account to save UTM courses to your shortlist and rate the courses you've taken." },
      { property: "og:title", content: "Sign in to courseflix" },
      { property: "og:description", content: "Save UTM courses and rate the ones you've taken." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthLayout,
});

function safePath(p?: string) {
  return p && p.startsWith("/") && !p.startsWith("//") ? p : "/";
}

function AuthLayout() {
  const match = useLocation();
  const pathname = match.pathname;

  if (pathname.startsWith("/auth/reset-password")) {
    return <Outlet />;
  }

  return <AuthPage />;
}

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const dest = safePath(search.redirect);
  const { signedIn, loading } = useAuth();
  const [oauthProcessing, setOauthProcessing] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const oauthError = params.get("error_description") || params.get("error");

    if (oauthError) {
      toast.error(`Google sign-in failed: ${oauthError.replace(/\+/g, " ")}`);
      window.history.replaceState({}, document.title, `${window.location.pathname}${search.redirect ? `?redirect=${encodeURIComponent(search.redirect)}` : ""}`);
      return;
    }

    if (!code) return;

    let active = true;
    setOauthProcessing(true);
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (!active) return;
      if (error) toast.error(`Google sign-in failed: ${error.message}`);
      window.history.replaceState({}, document.title, `${window.location.pathname}${search.redirect ? `?redirect=${encodeURIComponent(search.redirect)}` : ""}`);
    }).finally(() => {
      if (active) setOauthProcessing(false);
    });

    return () => { active = false; };
  }, [search.redirect]);

  useEffect(() => {
    if (!loading && !oauthProcessing && signedIn) navigate({ to: dest, replace: true });
  }, [loading, oauthProcessing, signedIn, dest, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          toast.success("Check your email to confirm your account.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      if (mode === "signin" && err instanceof Error && err.message === "Invalid login credentials") {
        toast.error("No account found with these credentials. Create an account to get started!");
      } else {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await resetPassword({ data: email });
      if (result.error) {
        toast.error(result.error);
      } else {
        setSent(true);
        toast.success("Check your email for the password reset link.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    const callback = new URL(`${window.location.origin}/auth`);
    if (dest !== "/") callback.searchParams.set("redirect", dest);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString() },
    });
    if (error) {
      setBusy(false);
      toast.error(`Google sign-in failed: ${error.message}`);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 py-16 relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand/3 rounded-full blur-[100px]" />
      </div>
      <Link to="/" className="flex items-center gap-2 mb-8 relative z-10">
        <div className="h-9 w-9 rounded-lg bg-brand flex items-center justify-center brand-glow">
          <span className="font-display font-black text-background text-lg leading-none">C</span>
        </div>
        <span className="font-display font-bold text-xl tracking-tight">
          course<span className="text-brand">flix</span>
        </span>
      </Link>

      <div className="w-full max-w-sm rounded-3xl border border-white/[0.08] bg-surface p-6 md:p-8 relative z-10">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">
          {mode === "signin" ? "Welcome back" : "Make an account"}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Save courses to your shortlist and rate the ones you've actually taken.
        </p>

        <button
          type="button"
          onClick={google}
          disabled={busy || oauthProcessing}
          className="mt-6 w-full h-11 rounded-xl bg-white text-black font-semibold text-sm hover:opacity-90 transition active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? "Redirecting…" : "Continue with Google"}
        </button>

        <div className="flex items-center gap-3 my-5 text-xs text-neutral-500">
          <div className="h-px flex-1 bg-white/[0.08]" /> or <div className="h-px flex-1 bg-white/[0.08]" />
        </div>

        {forgotPassword ? (
          sent ? (
            <p className="text-sm text-brand">We sent a password reset link to {email}. Check your email.</p>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="w-full h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 text-sm outline-none focus:border-brand/60 focus:ring-2 focus:ring-white/30" />
              <button disabled={busy} className="w-full h-11 rounded-xl bg-brand text-primary-foreground font-semibold text-sm hover:bg-brand-glow transition disabled:opacity-60 active:scale-[0.98]">{busy ? "Sending…" : "Send reset link"}</button>
            </form>
          )
        ) : sent ? (
          <p className="text-sm text-brand">We sent a confirmation link to {email}. Click it, then come back and sign in.</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "signup" && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" maxLength={40} className="w-full h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 text-sm outline-none focus:border-brand/60 focus:ring-2 focus:ring-white/30" />}
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mail.utoronto.ca" className="w-full h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 text-sm outline-none focus:border-brand/60 focus:ring-2 focus:ring-white/30" />
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 text-sm outline-none focus:border-brand/60 focus:ring-2 focus:ring-white/30" />
            <button disabled={busy} className="w-full h-11 rounded-xl bg-brand text-primary-foreground font-semibold text-sm hover:bg-brand-glow transition disabled:opacity-60 active:scale-[0.98]">{busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}</button>
          </form>
        )}

        {forgotPassword ? (
          <button onClick={() => { setForgotPassword(false); setSent(false); }} className="mt-4 w-full text-xs text-neutral-500 hover:text-brand transition">Back to sign in</button>
        ) : (
          <>
            {mode === "signin" && <button onClick={() => { setForgotPassword(true); setSent(false); }} className="mt-4 w-full text-xs text-neutral-500 hover:text-brand transition">Forgot your password?</button>}
            <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setSent(false); }} className="mt-2 w-full text-xs text-neutral-500 hover:text-brand transition">{mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}</button>
          </>
        )}
      </div>

      <Link to="/" className="mt-6 text-xs text-neutral-500 hover:text-foreground relative z-10">Keep browsing without an account →</Link>
    </div>
  );
}

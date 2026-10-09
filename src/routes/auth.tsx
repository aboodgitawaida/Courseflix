import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
  Link,
  useSearch,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { resetPassword } from "@/lib/reset-password";
import { safeAuthRedirect } from "@/lib/auth-redirect";
import { PageBackdrop } from "@/components/PageBackdrop";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } =>
    typeof s["redirect"] === "string" ? { redirect: s["redirect"] as string } : {},

  head: () => ({
    meta: [
      { title: "Sign in — courseflix UTM" },
      {
        name: "description",
        content:
          "Create a courseflix account to save UTM courses to your shortlist and rate the courses you've taken.",
      },
      { property: "og:title", content: "Sign in to courseflix" },
      {
        property: "og:description",
        content: "Save courses to your shortlist and rate the ones you've taken.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthLayout,
});

function AuthLayout() {
  const { pathname } = useLocation();

  if (pathname.startsWith("/auth/reset-password")) {
    return <Outlet />;
  }

  return <AuthPage />;
}

export function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const dest = safeAuthRedirect(search.redirect);
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
      window.history.replaceState(
        {},
        document.title,
        `${window.location.pathname}${search.redirect ? `?redirect=${encodeURIComponent(search.redirect)}` : ""}`,
      );
      return;
    }

    if (!code) return;

    let active = true;
    setOauthProcessing(true);
    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        if (!active) return;
        if (error) toast.error(`Google sign-in failed: ${error.message}`);
        window.history.replaceState(
          {},
          document.title,
          `${window.location.pathname}${search.redirect ? `?redirect=${encodeURIComponent(search.redirect)}` : ""}`,
        );
      })
      .finally(() => {
        if (active) setOauthProcessing(false);
      });

    return () => {
      active = false;
    };
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
            data: { display_name: name.trim() || "UTM student" },
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
      if (
        mode === "signin" &&
        err instanceof Error &&
        err.message === "Invalid login credentials"
      ) {
        toast.error("Incorrect email or password. New here? Create an account to get started.");
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
      if (result.error) toast.error(result.error);
      else {
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
    <div className="relative grid min-h-screen overflow-x-clip pb-28 text-foreground lg:grid-cols-[1.1fr_1fr] lg:pb-0">
      <PageBackdrop />

      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/[0.08] p-10 lg:flex xl:p-14">
        <div
          aria-hidden="true"
          className="mesh-blob -left-20 top-1/4 h-[460px] w-[460px] bg-brand/30"
        />
        <Link to="/" className="relative wordmark text-3xl leading-none">
          Courseflix
        </Link>
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Your degree, curated
          </p>
          <h2 className="mt-4 font-mega text-6xl font-black leading-[0.92] tracking-[-0.05em] xl:text-7xl">
            Save it.
            <br />
            Rate it.
            <br />
            <span className="font-serif-accent text-gradient-brand pr-[0.05em] text-[1.12em] font-normal">
              Share it.
            </span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Build a shortlist, review the courses you've survived, and swap picks with friends — all
            free, all for UTM.
          </p>
        </div>
        <div aria-hidden="true" className="relative -mx-14 overflow-hidden">
          <div className="marquee-track font-mega text-5xl font-black uppercase text-outline">
            {[0, 1].map((k) => (
              <span key={k} className="flex shrink-0 gap-8 pr-8">
                <span>CSC108</span>
                <span>PSY100</span>
                <span>ECO101</span>
                <span>BIO152</span>
                <span>MAT135</span>
                <span>CCT109</span>
              </span>
            ))}
          </div>
        </div>
      </aside>

      <div className="relative flex flex-col items-center justify-center px-6 py-16">
        <Link to="/" className="wordmark relative z-10 mb-10 text-3xl leading-none lg:hidden">
          Courseflix
        </Link>
        <div className="glass relative z-10 w-full max-w-md rounded-[2rem] p-7 md:p-10">
          <h1 className="font-mega text-3xl font-extrabold tracking-[-0.04em] text-white md:text-4xl">
            {mode === "signin" ? "Welcome back" : "Make an account"}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Save courses to your shortlist and rate the ones you've actually taken.
          </p>
          <button
            type="button"
            onClick={google}
            disabled={busy || oauthProcessing}
            className="mt-7 w-full h-12 rounded-2xl bg-white text-black font-semibold text-sm hover:opacity-90 transition active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? "Redirecting…" : "Continue with Google"}
          </button>
          <div className="flex items-center gap-3 my-5 text-xs text-neutral-500">
            <div className="h-px flex-1 bg-white/[0.08]" /> or{" "}
            <div className="h-px flex-1 bg-white/[0.08]" />
          </div>
          {forgotPassword ? (
            sent ? (
              <p className="text-sm text-brand">
                We sent a password reset link to {email}. Check your email.
              </p>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full h-11 rounded-2xl bg-white/[0.04] border border-white/[0.08] px-4 text-sm outline-none transition focus:border-brand/60 focus:ring-4 focus:ring-brand/15"
                />
                <button
                  disabled={busy}
                  className="w-full h-11 shine rounded-2xl bg-brand text-primary-foreground font-semibold text-sm shadow-lg shadow-brand/30 hover:bg-brand-glow transition active:scale-[0.98] disabled:opacity-60"
                >
                  {busy ? "Sending…" : "Send reset link"}
                </button>
              </form>
            )
          ) : sent ? (
            <p className="text-sm text-brand">
              We sent a confirmation link to {email}. Click it, then come back and sign in.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
              {mode === "signup" && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Display name"
                  maxLength={40}
                  className="w-full h-11 rounded-2xl bg-white/[0.04] border border-white/[0.08] px-4 text-sm outline-none transition focus:border-brand/60 focus:ring-4 focus:ring-brand/15"
                />
              )}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@mail.utoronto.ca"
                className="w-full h-11 rounded-2xl bg-white/[0.04] border border-white/[0.08] px-4 text-sm outline-none transition focus:border-brand/60 focus:ring-4 focus:ring-brand/15"
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full h-11 rounded-2xl bg-white/[0.04] border border-white/[0.08] px-4 text-sm outline-none transition focus:border-brand/60 focus:ring-4 focus:ring-brand/15"
              />
              <button
                disabled={busy}
                className="w-full h-11 shine rounded-2xl bg-brand text-primary-foreground font-semibold text-sm shadow-lg shadow-brand/30 hover:bg-brand-glow transition active:scale-[0.98] disabled:opacity-60"
              >
                {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
              {mode === "signup" && (
                <p className="text-center text-[11px] leading-5 text-neutral-500">
                  By creating an account you agree to the{" "}
                  <Link to="/terms" className="underline hover:text-brand">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="underline hover:text-brand">
                    Privacy Policy
                  </Link>
                  .
                </p>
              )}
            </form>
          )}
          {forgotPassword ? (
            <button
              onClick={() => {
                setForgotPassword(false);
                setSent(false);
              }}
              className="mt-4 w-full text-xs text-neutral-500 hover:text-brand transition"
            >
              Back to sign in
            </button>
          ) : (
            <>
              {mode === "signin" && (
                <button
                  onClick={() => {
                    setForgotPassword(true);
                    setSent(false);
                  }}
                  className="mt-4 w-full text-xs text-neutral-500 hover:text-brand transition"
                >
                  Forgot your password?
                </button>
              )}
              <button
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setSent(false);
                }}
                className="mt-2 w-full text-xs text-neutral-500 hover:text-brand transition"
              >
                {mode === "signin"
                  ? "New here? Create an account"
                  : "Already have an account? Sign in"}
              </button>
            </>
          )}
        </div>
        <Link to="/" className="mt-6 text-xs text-neutral-500 hover:text-foreground relative z-10">
          Keep browsing without an account →
        </Link>
      </div>
    </div>
  );
}

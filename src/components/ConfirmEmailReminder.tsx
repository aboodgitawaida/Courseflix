import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { MailCheck, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useReviewVerification } from "@/lib/ratings";
import { sendReviewVerification } from "@/lib/review-verification";

const DISMISS_PREFIX = "courseflix.confirm-email.dismissed.";
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1_000;
const SHOW_AFTER_MS = 8_000;
const HIDDEN_ON = ["/auth", "/verify-email"];

function dismissedRecently(userId: string) {
  try {
    const at = Number(window.localStorage.getItem(DISMISS_PREFIX + userId) ?? "0");
    return Date.now() - at < SNOOZE_MS;
  } catch {
    return false;
  }
}

function rememberDismiss(userId: string) {
  try {
    window.localStorage.setItem(DISMISS_PREFIX + userId, String(Date.now()));
  } catch {
    // Storage may be unavailable in privacy-restricted browsers.
  }
}

/**
 * A gentle, dismissible nudge for email sign-ups who haven't confirmed yet.
 * Nothing is blocked: it shows the address (so typos get noticed) and offers the
 * same one-click link the review form uses. Comes back 3 days after a dismissal.
 */
export function ConfirmEmailReminder() {
  const { user } = useAuth();
  const { verified, loading } = useReviewVerification(user);
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const [visible, setVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const userId = user?.id ?? null;
  const eligible =
    Boolean(userId && user?.email) &&
    !loading &&
    !verified &&
    !HIDDEN_ON.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (!eligible || !userId || dismissedRecently(userId)) {
      setVisible(false);
      return;
    }
    // Let people look around first, and don't stack on top of the install prompt.
    const timer = window.setTimeout(() => {
      if (!document.querySelector('[aria-label="Install Courseflix"]')) setVisible(true);
    }, SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [eligible, userId]);

  function dismiss() {
    if (userId) rememberDismiss(userId);
    setVisible(false);
  }

  async function send() {
    setSending(true);
    try {
      const result = await sendReviewVerification();
      if (result.error) toast.error(result.error);
      else if (result.alreadyVerified) {
        setVisible(false);
        void queryClient.invalidateQueries({ queryKey: ["review-verified"] });
      } else setSent(true);
    } catch {
      toast.error("Could not send the email. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (!visible || !user?.email) return null;

  return (
    <div
      role="dialog"
      aria-label="Confirm your email"
      className="above-tabbar glass fixed inset-x-3 bottom-4 z-[var(--z-toast)] mx-auto flex max-w-md items-start gap-3 rounded-3xl bg-background/90 p-4 shadow-2xl shadow-black/60 animate-fade-in-up lg:inset-x-auto lg:left-6 lg:bottom-6 lg:mx-0"
    >
      <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {sent ? (
          <>
            <p className="text-sm font-semibold">Check your inbox</p>
            <p className="mt-1 text-xs text-muted-foreground">
              We sent a link to <span className="break-all text-foreground">{user.email}</span>. It
              works for 24 hours.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold">Confirm your email</p>
            <p className="mt-1 text-xs text-muted-foreground">
              One click unlocks reviews and makes sure password resets reach you at{" "}
              <span className="break-all text-foreground">{user.email}</span>.
            </p>
            <button
              type="button"
              onClick={() => void send()}
              disabled={sending}
              className="mt-3 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-brand-glow disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send confirmation link"}
            </button>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss email reminder"
        className="-m-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

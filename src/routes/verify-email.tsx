import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { PageBackdrop } from "@/components/PageBackdrop";
import { confirmReviewVerification } from "@/lib/review-verification";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Confirm your email — Courseflix" },
    ],
  }),
  component: VerifyEmailPage,
});

type Status = "checking" | "done" | "failed";

function VerifyEmailPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState("");
  const started = useRef(false);

  useEffect(() => {
    // Links are one-time; React may run effects twice in development.
    if (started.current) return;
    started.current = true;
    const token = new URLSearchParams(window.location.search).get("token") ?? "";
    window.history.replaceState({}, document.title, window.location.pathname);

    confirmReviewVerification({ data: token })
      .then((result) => {
        if (result.success) {
          setStatus("done");
          void queryClient.invalidateQueries({ queryKey: ["review-verified"] });
        } else {
          setStatus("failed");
          setMessage(result.error ?? "This link didn't work.");
        }
      })
      .catch((err: unknown) => {
        setStatus("failed");
        setMessage(err instanceof Error ? err.message : "This link didn't work.");
      });
  }, [queryClient]);

  return (
    <div className="relative grid min-h-screen place-items-center overflow-x-clip px-6 text-foreground">
      <PageBackdrop />
      <div className="glass relative w-full max-w-md rounded-3xl p-8 text-center">
        {status === "checking" && (
          <>
            <h1 className="font-display text-2xl font-bold">Confirming your email…</h1>
            <div className="mx-auto mt-6 h-2 w-40 animate-pulse rounded-full bg-brand/30" />
          </>
        )}
        {status === "done" && (
          <>
            <h1 className="font-display text-2xl font-bold">Email confirmed</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              You can now post course reviews. Thanks for helping keep Courseflix honest.
            </p>
          </>
        )}
        {status === "failed" && (
          <>
            <h1 className="font-display text-2xl font-bold">That link didn&apos;t work</h1>
            <p className="mt-3 text-sm text-muted-foreground">{message}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Open any course and tap &ldquo;Rate this course&rdquo; to send a new link.
            </p>
          </>
        )}
        {status !== "checking" && (
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow"
          >
            Back to browsing
          </Link>
        )}
      </div>
    </div>
  );
}

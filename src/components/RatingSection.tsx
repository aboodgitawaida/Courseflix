import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCourseRatings, useCourseStats, useDeleteRating, useSubmitRating } from "@/lib/ratings";
import { toast } from "sonner";
import { QueryErrorState } from "@/components/QueryErrorState";
import { announce } from "@/lib/a11y";

function Stars({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star`}
          className={`h-8 w-8 rounded-lg flex items-center justify-center transition ${
            n <= value ? "text-brand" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Star className={`h-5 w-5 ${n <= value ? "fill-current" : ""}`} />
        </button>
      ))}
    </div>
  );
}

function Scale({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">{label}</div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`h-9 w-9 rounded-lg text-sm font-semibold border transition ${
              n === value
                ? "bg-brand text-primary-foreground border-brand"
                : "bg-surface-2 border-border/50 hover:border-brand/50"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function RatingSection({ code }: { code: string }) {
  const { signedIn, user } = useAuth();
  const { data: reviews = [], error: reviewsError, refetch: refetchReviews } = useCourseRatings(code);
  const { data: stats, error: statsError, refetch: refetchStats } = useCourseStats(code);
  const submit = useSubmitRating(code);
  const remove = useDeleteRating();

  const mine = reviews.find((r) => r.user_id === user?.id);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(mine?.rating ?? 0);
  const [difficulty, setDifficulty] = useState(mine?.difficulty ?? 3);
  const [workload, setWorkload] = useState(mine?.workload ?? 3);
  const [again, setAgain] = useState(mine?.would_take_again ?? true);
  const [prof, setProf] = useState(mine?.prof_name ?? "");
  const [comment, setComment] = useState(mine?.comment ?? "");

  useEffect(() => {
    if (!reviewsError && !statsError) {
      announce(`${reviews.length} student rating${reviews.length === 1 ? "" : "s"} loaded.`);
    }
  }, [reviews.length, reviewsError, statsError]);

  async function save() {
    if (rating < 1) {
      toast.error("Pick a star rating first.");
      return;
    }
    try {
      await submit.mutateAsync({
        course_code: code,
        rating,
        difficulty,
        workload,
        would_take_again: again,
        prof_name: prof.trim().slice(0, 80) || null,
        comment: comment.trim().slice(0, 1000) || null,
      });
      toast.success("Thanks — your rating is live.");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save your rating");
    }
  }

  async function deleteReview() {
    if (!mine || !window.confirm("Delete your review? This cannot be undone.")) return;
    try {
      await remove.mutateAsync({ id: mine.id, courseCode: code });
      setOpen(false);
      toast.success("Your review was deleted.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete your review");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="font-display text-2xl font-bold">
          Student ratings{" "}
          <span className="text-sm font-medium text-muted-foreground">
            ({stats?.rating_count ?? 0})
          </span>
        </h2>
        {signedIn ? (
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-full bg-brand text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-brand-glow transition"
          >
            {mine ? "Edit your rating" : "Rate this course"}
          </button>
        ) : (
          <Link
            to="/auth"
            search={{ redirect: `/course/${code}` }}
            className="rounded-full bg-surface-2 border border-border/50 px-4 py-2 text-sm font-semibold hover:border-brand/50 transition"
          >
            Sign in to rate
          </Link>
        )}
      </div>

      {open && (
        <div className="rounded-2xl bg-surface border border-brand/30 p-5 space-y-4 mb-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Overall</div>
            <Stars value={rating} onChange={setRating} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Scale label="Difficulty" value={difficulty} onChange={setDifficulty} />
            <Scale label="Workload" value={workload} onChange={setWorkload} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={again} onChange={(e) => setAgain(e.target.checked)} className="accent-brand h-4 w-4" />
            I'd take this course again
          </label>
          <input
            value={prof}
            onChange={(e) => setProf(e.target.value)}
            maxLength={80}
            placeholder="Prof you had (optional)"
            className="w-full h-10 rounded-xl bg-surface-2 border border-border/50 px-3 text-sm outline-none focus:border-brand/60"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="What was it actually like? (optional)"
            className="w-full rounded-xl bg-surface-2 border border-border/50 px-3 py-2 text-sm outline-none focus:border-brand/60"
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={submit.isPending}
              className="rounded-full bg-brand text-primary-foreground px-5 py-2 text-sm font-semibold hover:bg-brand-glow transition disabled:opacity-60"
            >
              {submit.isPending ? "Saving…" : "Post rating"}
            </button>
            <button onClick={() => setOpen(false)} className="rounded-full px-5 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
              Cancel
            </button>
            {mine && (
              <button
                onClick={deleteReview}
                disabled={remove.isPending}
                className="ml-auto rounded-full px-4 py-2 text-sm font-semibold text-red-300 transition hover:text-red-200 disabled:opacity-60"
              >
                {remove.isPending ? "Deleting…" : "Delete review"}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(reviewsError || statsError) && (
          <QueryErrorState
            message="Could not load student ratings."
            onRetry={() => {
              void refetchReviews();
              void refetchStats();
            }}
          />
        )}
        {reviews.length === 0 && (
          <div className="rounded-2xl bg-surface border border-border/40 p-5 text-muted-foreground text-sm">
            <div className="h-4 w-2/3 animate-pulse rounded bg-primary/10" />
            {signedIn && !open && (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="mt-3 rounded-full border border-brand/40 px-4 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/10"
              >
                Rate this course
              </button>
            )}
          </div>
        )}
        {reviews.map((r) => (
          <div key={r.id} className="rounded-2xl bg-surface border border-border/40 p-5">
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 text-brand font-semibold">
                <Star className="h-3.5 w-3.5 fill-current" /> {r.rating}/5
              </span>
              <span className="text-muted-foreground">
                · difficulty {r.difficulty}/5 · workload {r.workload}/5
                {r.prof_name ? ` · ${r.prof_name}` : ""}
              </span>
            </div>
            {r.comment && <p className="text-foreground/90 leading-relaxed mt-2">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

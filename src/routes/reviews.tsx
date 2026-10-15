import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TopNav } from "@/components/TopNav";
import { PageBackdrop } from "@/components/PageBackdrop";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useAuth } from "@/hooks/use-auth";
import { useDeleteRating, useMyRatings, useSubmitRating } from "@/lib/ratings";
import { getCourse } from "@/lib/courses";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "My reviews — Courseflix UTM" },
      { name: "description", content: "View and manage your CourseFlix course reviews." },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const { signedIn, user } = useAuth();
  const { data: reviews = [], isLoading, error, refetch } = useMyRatings(user?.id);
  const remove = useDeleteRating();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    courseCode: string;
    rating: number;
    difficulty: number;
    workload: number;
    wouldTakeAgain: boolean;
    profName: string;
    comment: string;
  } | null>(null);
  const submit = useSubmitRating(draft?.courseCode ?? "");

  async function deleteReview(id: string, courseCode: string) {
    if (!window.confirm(`Delete your review for ${courseCode}? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await remove.mutateAsync({ id, courseCode });
      toast.success("Your review was deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete your review");
    } finally {
      setDeletingId(null);
    }
  }

  function startEditing(review: (typeof reviews)[number]) {
    setEditingId(review.id);
    setDraft({
      courseCode: review.course_code,
      rating: review.rating,
      difficulty: review.difficulty,
      workload: review.workload,
      wouldTakeAgain: review.would_take_again,
      profName: review.prof_name ?? "",
      comment: review.comment ?? "",
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setDraft(null);
  }

  async function saveEdit() {
    if (!draft || draft.rating < 1) {
      toast.error("Pick a star rating first.");
      return;
    }
    try {
      await submit.mutateAsync({
        course_code: draft.courseCode,
        rating: draft.rating,
        difficulty: draft.difficulty,
        workload: draft.workload,
        would_take_again: draft.wouldTakeAgain,
        prof_name: draft.profName.trim().slice(0, 80) || null,
        comment: draft.comment.trim().slice(0, 1000) || null,
      });
      toast.success("Your review was updated.");
      cancelEditing();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update your review");
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-clip text-foreground">
      <PageBackdrop />
      <TopNav />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-10 md:px-10">
        <h1 className="font-mega text-[clamp(2.6rem,7vw,5.5rem)] font-black leading-[0.92] tracking-[-0.05em] animate-fade-in-up">
          My{" "}
          <span className="font-serif-accent text-gradient-brand pr-[0.05em] text-[1.12em] font-normal">
            reviews.
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review the courses you have rated and remove anything you no longer want to keep.
        </p>

        {!signedIn ? (
          <div className="mt-8 rounded-3xl glass p-6">
            <h2 className="font-display text-2xl">Sign in to see your reviews</h2>
            <Link
              to="/auth"
              search={{ redirect: "/reviews" }}
              className="mt-4 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow"
            >
              Sign in
            </Link>
          </div>
        ) : isLoading ? (
          <div className="mt-8 space-y-3">
            <div className="h-28 animate-pulse rounded-2xl bg-primary/10" />
            <div className="h-28 animate-pulse rounded-2xl bg-primary/10" />
          </div>
        ) : error ? (
          <div className="mt-8">
            <QueryErrorState
              message="Could not load your reviews."
              onRetry={() => void refetch()}
            />
          </div>
        ) : reviews.length === 0 ? (
          <div className="mt-8 rounded-3xl glass p-6">
            <h2 className="font-display text-2xl">No reviews yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Rate a course and it will appear here.
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow"
            >
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {reviews.map((review) => {
              const course = getCourse(review.course_code);
              return (
                <article key={review.id} className="rounded-3xl glass p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <Link
                        to="/course/$code"
                        params={{ code: review.course_code }}
                        className="font-display text-2xl font-bold transition hover:text-brand"
                      >
                        {review.course_code}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {course?.title ?? "Course details unavailable"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(review)}
                        className="rounded-full border border-brand/40 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/10"
                      >
                        Edit review
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteReview(review.id, review.course_code)}
                        disabled={deletingId === review.id}
                        className="inline-flex items-center gap-2 rounded-full border border-red-400/30 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-400/10 disabled:opacity-60"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingId === review.id ? "Deleting…" : "Delete review"}
                      </button>
                    </div>
                  </div>
                  {editingId === review.id && draft ? (
                    <div
                      className="mt-4 space-y-4 rounded-xl border border-brand/30 bg-surface-2 p-4"
                      data-eagle-review
                    >
                      <div>
                        <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                          Overall
                        </p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              aria-label={`${value} star`}
                              onClick={() => setDraft({ ...draft, rating: value })}
                              className={`text-xl ${value <= draft.rating ? "text-brand" : "text-muted-foreground"}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {(["difficulty", "workload"] as const).map((field) => (
                          <label
                            key={field}
                            className="text-xs uppercase tracking-wider text-muted-foreground"
                          >
                            {field}
                            <select
                              value={draft[field]}
                              onChange={(event) =>
                                setDraft({ ...draft, [field]: Number(event.target.value) })
                              }
                              className="mt-1 block h-9 w-full rounded-lg border border-border/50 bg-background px-2 text-sm text-foreground"
                            >
                              {[1, 2, 3, 4, 5].map((value) => (
                                <option key={value} value={value}>
                                  {value}/5
                                </option>
                              ))}
                            </select>
                          </label>
                        ))}
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={draft.wouldTakeAgain}
                          onChange={(event) =>
                            setDraft({ ...draft, wouldTakeAgain: event.target.checked })
                          }
                          className="accent-brand"
                        />
                        I’d take this course again
                      </label>
                      <input
                        value={draft.profName}
                        onChange={(event) => setDraft({ ...draft, profName: event.target.value })}
                        maxLength={80}
                        placeholder="Prof you had (optional)"
                        className="h-10 w-full rounded-xl border border-border/50 bg-background px-3 text-sm outline-none focus:border-brand/60"
                      />
                      <textarea
                        value={draft.comment}
                        onChange={(event) => setDraft({ ...draft, comment: event.target.value })}
                        maxLength={1000}
                        rows={3}
                        placeholder="What was it actually like? (optional)"
                        className="w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-brand/60"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void saveEdit()}
                          disabled={submit.isPending}
                          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow disabled:opacity-60"
                        >
                          {submit.isPending ? "Saving…" : "Save changes"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="rounded-full px-5 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                        <span className="inline-flex items-center gap-1 font-semibold text-brand">
                          <Star className="h-4 w-4 fill-current" /> {review.rating}/5
                        </span>
                        <span className="text-muted-foreground">
                          Difficulty {review.difficulty}/5 · Workload {review.workload}/5
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-3 leading-relaxed text-foreground/90">{review.comment}</p>
                      )}
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TopNav } from "@/components/TopNav";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useAuth } from "@/hooks/use-auth";
import { useDeleteRating, useMyRatings } from "@/lib/ratings";
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-10 md:px-10">
        <h1 className="font-display text-4xl font-black md:text-5xl">My reviews</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review the courses you have rated and remove anything you no longer want to keep.
        </p>

        {!signedIn ? (
          <div className="mt-8 rounded-2xl border border-border/50 bg-surface p-6">
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
            <QueryErrorState message="Could not load your reviews." onRetry={() => void refetch()} />
          </div>
        ) : reviews.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-border/50 bg-surface p-6">
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
                <article key={review.id} className="rounded-2xl border border-border/50 bg-surface p-5">
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
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1 font-semibold text-brand">
                      <Star className="h-4 w-4 fill-current" /> {review.rating}/5
                    </span>
                    <span className="text-muted-foreground">
                      Difficulty {review.difficulty}/5 · Workload {review.workload}/5
                    </span>
                  </div>
                  {review.comment && <p className="mt-3 leading-relaxed text-foreground/90">{review.comment}</p>}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

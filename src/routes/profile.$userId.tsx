import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, UserRound } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useAuth } from "@/hooks/use-auth";
import { useFriendships, useFriendShortlist } from "@/lib/social";
import { avatarSrc, usePublicProfile } from "@/lib/profile";
import { useMyRatings } from "@/lib/ratings";
import { getCourse } from "@/lib/courses";

export const Route = createFileRoute("/profile/$userId")({
  head: () => ({ meta: [{ title: "Student profile — Courseflix UTM" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { userId } = Route.useParams();
  const { signedIn, user } = useAuth();
  const { data: profile, isLoading, error } = usePublicProfile(userId);
  const { data: friendships } = useFriendships();
  const { data: reviews = [] } = useMyRatings(userId);
  const { data: shortlist = [], error: shortlistError } = useFriendShortlist(userId);
  const isFriend = Boolean(
    friendships?.accepted.some(
      (row) => row.requester_id === user?.id && row.addressee_id === userId ||
        row.addressee_id === user?.id && row.requester_id === userId,
    ),
  );
  const canView = user?.id === userId || !profile?.is_private || isFriend;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-10 md:px-10">
        {!signedIn ? (
          <div className="rounded-2xl border border-border/50 bg-surface p-6">
            <h1 className="font-display text-3xl font-black">Sign in to view profiles</h1>
            <Link to="/auth" search={{ redirect: `/profile/${userId}` }} className="mt-4 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground">
              Sign in
            </Link>
          </div>
        ) : isLoading ? (
          <div className="h-48 animate-pulse rounded-2xl bg-primary/10" />
        ) : error ? (
          <QueryErrorState message="Could not load this profile." onRetry={() => window.location.reload()} />
        ) : !profile ? (
          <p className="text-muted-foreground">Profile not found.</p>
        ) : (
          <>
            <section className="rounded-2xl border border-border/50 bg-surface p-6">
              <div className="flex items-center gap-4">
                <img src={avatarSrc(profile.avatar_id)} alt="" width={72} height={72} className="h-[72px] w-[72px] rounded-2xl object-contain" />
                <div>
                  <h1 className="font-display text-4xl font-black">{profile.display_name}</h1>
                  {profile.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
                </div>
              </div>
              {!canView ? (
                <p className="mt-6 rounded-xl border border-border/50 bg-surface-2 p-4 text-sm text-muted-foreground">
                  This account is private. Become friends to see their reviews and shortlist.
                </p>
              ) : (
                <>
                  {(profile.major_id || profile.year) && (
                    <p className="mt-5 text-sm text-muted-foreground">
                      {profile.major_id ?? "UTM student"}{profile.year ? ` · Year ${profile.year}` : ""}
                    </p>
                  )}
                  <h2 className="mt-8 font-display text-2xl font-bold">Reviews</h2>
                  {reviews.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">No public reviews yet.</p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {reviews.map((review) => (
                        <Link key={review.id} to="/course/$code" params={{ code: review.course_code }} className="block rounded-xl border border-border/50 bg-surface-2 p-4 transition hover:border-brand/50">
                          <div className="flex items-center gap-2 text-sm font-semibold text-brand">
                            <Star className="h-4 w-4 fill-current" /> {review.rating}/5 · {review.course_code}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{getCourse(review.course_code)?.title ?? "Course"}</p>
                          {review.comment && <p className="mt-2 text-sm text-foreground/90">{review.comment}</p>}
                        </Link>
                      ))}
                    </div>
                  )}
                  <h2 className="mt-8 font-display text-2xl font-bold">Shortlist</h2>
                  {shortlistError ? (
                    <p className="mt-2 text-sm text-muted-foreground">This shortlist is private.</p>
                  ) : shortlist.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">No saved courses yet.</p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {shortlist.map((code) => (
                        <Link key={code} to="/course/$code" params={{ code }} className="rounded-full border border-border/60 bg-surface-2 px-3 py-1.5 text-xs font-semibold transition hover:border-brand/60 hover:text-brand">
                          {code}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

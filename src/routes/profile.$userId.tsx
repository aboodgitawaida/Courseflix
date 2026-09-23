import { createFileRoute, Link } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { useAuth } from "@/hooks/use-auth";
import { avatarSrc, usePublicProfile } from "@/lib/profile";
import { useFriendShortlist } from "@/lib/social";

export const Route = createFileRoute("/profile/$userId")({
  head: () => ({ meta: [{ title: "Student profile — Courseflix UTM" }] }),
  component: StudentProfilePage,
});

function StudentProfilePage() {
  const { userId } = Route.useParams();
  const { signedIn, user } = useAuth();
  const { data: profile, isLoading, error } = usePublicProfile(userId);
  const { data: shortlist = [], error: shortlistError } = useFriendShortlist(userId);
  const isOwner = user?.id === userId;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-10 md:px-10">
        {!signedIn ? (
          <section className="rounded-2xl border border-border/50 bg-surface p-6">
            <h1 className="font-display text-3xl font-black">Sign in to view this profile</h1>
            <Link to="/auth" search={{ redirect: `/profile/${userId}` }} className="mt-4 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground">
              Sign in
            </Link>
          </section>
        ) : isLoading ? (
          <div className="h-48 animate-pulse rounded-2xl bg-primary/10" />
        ) : error ? (
          <p className="rounded-xl border border-border/50 bg-surface p-5 text-sm text-muted-foreground">Could not load this profile.</p>
        ) : !profile ? (
          <p className="rounded-xl border border-border/50 bg-surface p-5 text-sm text-muted-foreground">Profile not found.</p>
        ) : (
          <section className="rounded-2xl border border-border/50 bg-surface p-6">
            <div className="flex items-center gap-4">
              <img src={avatarSrc(profile.avatar_id)} alt="" width={72} height={72} className="h-[72px] w-[72px] rounded-2xl object-contain" />
              <div className="min-w-0">
                <h1 className="truncate font-display text-3xl font-black">{profile.display_name}</h1>
                {profile.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
                {(profile.major_id || profile.year) && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {profile.major_id ?? "UTM student"}{profile.year ? ` · Year ${profile.year}` : ""}
                  </p>
                )}
              </div>
            </div>
            <h2 className="mt-8 font-display text-2xl font-bold">Shortlist</h2>
            {shortlistError && !isOwner ? (
              <p className="mt-2 text-sm text-muted-foreground">This shortlist is visible to accepted friends only.</p>
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
          </section>
        )}
      </main>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, Lock, Settings, UserCheck, UserMinus, UserPlus, X } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { PageBackdrop } from "@/components/PageBackdrop";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useAuth } from "@/hooks/use-auth";
import { avatarSrc } from "@/lib/profile";
import { getMajor } from "@/lib/majors";
import { getCourse } from "@/lib/courses";
import { achievementDefinition } from "@/lib/achievements";
import {
  useFriendShortlist,
  useProfileView,
  useRemoveFriend,
  useRespondToRequest,
  useSendFriendRequest,
  type ProfileView,
} from "@/lib/social";

export const Route = createFileRoute("/u/$username")({
  head: () => ({
    meta: [{ title: "Student profile — Courseflix UTM" }, { name: "robots", content: "noindex" }],
  }),
  component: ProfilePage,
});

function Shortlist({ userId }: { userId: string }) {
  const { data: codes = [], isLoading, error } = useFriendShortlist(userId);
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading shortlist…</p>;
  if (error) return <p className="text-sm text-muted-foreground">Could not load the shortlist.</p>;
  if (codes.length === 0)
    return <p className="text-sm text-muted-foreground">No saved courses yet.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {codes.map((c) => (
        <Link
          key={c}
          to="/course/$code"
          params={{ code: c }}
          className="rounded-full border border-border/60 bg-surface-2 px-3 py-1.5 text-xs font-semibold transition hover:border-brand/60 hover:text-brand"
        >
          {c}
          {getCourse(c) ? "" : " (unlisted)"}
        </Link>
      ))}
    </div>
  );
}

function RelationshipButton({ profile }: { profile: ProfileView }) {
  const send = useSendFriendRequest();
  const respond = useRespondToRequest();
  const remove = useRemoveFriend();
  const busy = send.isPending || respond.isPending || remove.isPending;
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60";
  const primary = `${base} bg-brand text-primary-foreground hover:bg-brand-glow`;
  const quiet = `${base} border border-border/60 hover:border-brand/50`;

  async function run(action: () => Promise<unknown>, done: string) {
    try {
      await action();
      toast.success(done);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  switch (profile.relationship) {
    case "self":
      return (
        <Link to="/settings" hash="profile" className={quiet}>
          <Settings className="h-4 w-4" /> Edit profile
        </Link>
      );
    case "friends":
      return (
        <button
          disabled={busy}
          onClick={() =>
            void run(() => remove.mutateAsync(profile.friendship_id!), "Friend removed.")
          }
          className={quiet}
        >
          <UserCheck className="h-4 w-4" /> Friends · Remove
        </button>
      );
    case "outgoing":
      return (
        <button
          disabled={busy}
          onClick={() =>
            void run(() => remove.mutateAsync(profile.friendship_id!), "Request cancelled.")
          }
          className={quiet}
        >
          <X className="h-4 w-4" /> Requested · Cancel
        </button>
      );
    case "incoming":
      return (
        <div className="flex gap-2">
          <button
            disabled={busy}
            onClick={() =>
              void run(
                () => respond.mutateAsync({ id: profile.friendship_id!, accept: true }),
                "You're now friends.",
              )
            }
            className={primary}
          >
            <Check className="h-4 w-4" /> Accept
          </button>
          <button
            disabled={busy}
            onClick={() =>
              void run(
                () => respond.mutateAsync({ id: profile.friendship_id!, accept: false }),
                "Request declined.",
              )
            }
            className={quiet}
          >
            <UserMinus className="h-4 w-4" /> Decline
          </button>
        </div>
      );
    default:
      return (
        <button
          disabled={busy}
          onClick={() => void run(() => send.mutateAsync(profile.id), "Friend request sent.")}
          className={primary}
        >
          <UserPlus className="h-4 w-4" /> Add friend
        </button>
      );
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface-2/60 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold">{value}</div>
    </div>
  );
}

function ProfilePage() {
  const { username } = Route.useParams();
  const { signedIn } = useAuth();
  const { data: profile, isLoading, error, refetch } = useProfileView(username);

  const major = getMajor(profile?.major_id ?? null);
  const achievements = (profile?.achievement_ids ?? [])
    .map((id) => achievementDefinition(id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <div className="relative min-h-screen">
      <PageBackdrop />
      <TopNav />
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-10 md:px-10">
        {!signedIn && (
          <div className="rounded-3xl glass p-6">
            <h1 className="font-display text-2xl">Sign in to view profiles</h1>
            <Link
              to="/auth"
              search={{ redirect: `/u/${username}` }}
              className="mt-4 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow"
            >
              Sign in
            </Link>
          </div>
        )}

        {signedIn && isLoading && <div className="h-48 animate-pulse rounded-3xl bg-primary/10" />}

        {signedIn && error && (
          <QueryErrorState
            message="We couldn't load this profile."
            onRetry={() => void refetch()}
          />
        )}

        {signedIn && !isLoading && !error && !profile && (
          <div className="rounded-3xl glass p-6">
            <h1 className="font-display text-2xl">No student found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Nobody goes by @{username}. Usernames can change, so ask them for their current one.
            </p>
            <Link
              to="/friends"
              className="mt-4 inline-flex rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold transition hover:border-brand/50"
            >
              Back to friends
            </Link>
          </div>
        )}

        {signedIn && profile && (
          <>
            <div className="flex flex-wrap items-center gap-5">
              <img
                src={avatarSrc(profile.avatar_id)}
                alt=""
                width={96}
                height={96}
                className="h-24 w-24 rounded-full bg-surface-2 object-contain ring-2 ring-brand/40"
              />
              <div className="min-w-0 flex-1">
                <h1 className="truncate font-mega text-3xl font-black leading-tight md:text-4xl">
                  {profile.display_name}
                  {profile.is_verified && <VerifiedBadge className="ml-2 h-6 w-6" />}
                </h1>
                <p className="truncate text-sm text-muted-foreground">@{profile.username}</p>
              </div>
              <RelationshipButton profile={profile} />
            </div>

            {profile.can_view ? (
              <>
                <div className="mt-8 grid grid-cols-3 gap-3">
                  <Stat label="Program" value={major?.name ?? "Not set"} />
                  <Stat label="Year" value={profile.year ? `Year ${profile.year}` : "Not set"} />
                  <Stat label="Friends" value={String(profile.friend_count ?? 0)} />
                </div>

                <section className="mt-8">
                  <h2 className="font-display text-2xl">Shortlist</h2>
                  <div className="mt-3">
                    <Shortlist userId={profile.id} />
                  </div>
                </section>

                {achievements.length > 0 && (
                  <section className="mt-8">
                    <h2 className="font-display text-2xl">Achievements</h2>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {achievements.map((a) => (
                        <div
                          key={a.id}
                          title={`${a.name}: ${a.description}`}
                          className="flex items-center gap-2 rounded-full border border-border/60 bg-surface-2 py-1 pl-1 pr-3 text-xs font-semibold"
                        >
                          <img src={a.icon} alt="" width={28} height={28} className="h-7 w-7" />
                          {a.name}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <div className="mt-8 rounded-3xl glass p-6 text-center">
                <Lock className="mx-auto h-6 w-6 text-muted-foreground" />
                <h2 className="mt-3 font-display text-xl">This account is private</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {profile.relationship === "outgoing"
                    ? "Your request is pending. Once they accept, you'll see their program, year and shortlist."
                    : "Add them as a friend to see their program, year and shortlist."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

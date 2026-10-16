import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookmarkCheck,
  CalendarHeart,
  GraduationCap,
  LockKeyhole,
  Trophy,
  UserPlus,
} from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { PageBackdrop } from "@/components/PageBackdrop";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useAuth } from "@/hooks/use-auth";
import { avatarSrc } from "@/lib/profile";
import { getMajor } from "@/lib/majors";
import { getCourse } from "@/lib/courses";
import { useFriendAchievements } from "@/lib/achievements";
import { toast } from "sonner";
import {
  useFriendShortlist,
  useFriendships,
  usePublicProfile,
  useRespondToRequest,
  useSendFriendRequest,
} from "@/lib/social";

export const Route = createFileRoute("/profile/$id")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Profile — Courseflix UTM" },
      { name: "description", content: "A friend's Courseflix profile." },
    ],
  }),
  component: FriendProfilePage,
});

function FriendProfilePage() {
  const { id } = Route.useParams();
  const { signedIn } = useAuth();
  const { data: friendships, isLoading: friendshipsLoading } = useFriendships();
  const uid = friendships?.uid ?? null;
  const friendship = friendships?.accepted.find(
    (row) =>
      (row.requester_id === uid && row.addressee_id === id) ||
      (row.addressee_id === uid && row.requester_id === id),
  );
  const isSelf = uid === id;
  const canView = signedIn && (isSelf || Boolean(friendship));

  return (
    <div className="relative min-h-screen overflow-x-clip text-foreground">
      <PageBackdrop />
      <TopNav />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-10 md:px-10">
        <Link
          to="/friends"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Friends
        </Link>

        {!signedIn ? (
          <div className="mt-6 rounded-3xl glass p-6">
            <h1 className="font-display text-2xl">Sign in to view profiles</h1>
            <Link
              to="/auth"
              search={{ redirect: `/profile/${id}` }}
              className="mt-4 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow"
            >
              Sign in
            </Link>
          </div>
        ) : friendshipsLoading ? (
          <div className="mt-6 space-y-4">
            <div className="h-36 animate-pulse rounded-3xl bg-primary/10" />
            <div className="h-48 animate-pulse rounded-3xl bg-primary/10" />
          </div>
        ) : !canView ? (
          <LockedProfile
            userId={id}
            pendingOut={Boolean(friendships?.outgoing.some((row) => row.addressee_id === id))}
            incomingId={friendships?.incoming.find((row) => row.requester_id === id)?.id ?? null}
          />
        ) : (
          <ProfileBody userId={id} friendsSince={friendship?.created_at ?? null} />
        )}
      </main>
    </div>
  );
}

function ProfileBody({ userId, friendsSince }: { userId: string; friendsSince: string | null }) {
  const profile = usePublicProfile(userId);
  const shortlist = useFriendShortlist(userId);
  const achievements = useFriendAchievements(userId);

  if (profile.isLoading) {
    return <div className="mt-6 h-36 animate-pulse rounded-3xl bg-primary/10" />;
  }
  if (profile.error || !profile.data) {
    return (
      <div className="mt-6">
        <QueryErrorState
          message="Could not load this profile."
          onRetry={() => void profile.refetch()}
        />
      </div>
    );
  }

  const p = profile.data;
  const major = getMajor(p.major_id);
  const codes = shortlist.data ?? [];
  const earned = (achievements.data ?? []).filter((a) => a.unlocked);

  return (
    <>
      <section className="mt-6 rounded-3xl glass glow-ring p-6 md:p-8 animate-fade-in-up">
        <div className="flex flex-wrap items-center gap-5">
          <img
            src={avatarSrc(p.avatar_id)}
            alt=""
            width={96}
            height={96}
            className="h-24 w-24 rounded-full border border-border/60 bg-surface-2 object-contain"
          />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-mega text-[clamp(2rem,5vw,3.25rem)] font-black leading-none tracking-[-0.04em]">
              {p.display_name}
              {p.is_verified && <VerifiedBadge className="ml-2 h-6 w-6 align-middle" />}
            </h1>
            {p.username && <p className="mt-1 text-sm text-muted-foreground">@{p.username}</p>}
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              {major && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-surface-2 px-3 py-1">
                  {major.emoji} {major.name}
                </span>
              )}
              {p.year && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-surface-2 px-3 py-1">
                  <GraduationCap className="h-3.5 w-3.5" /> Year {p.year}
                </span>
              )}
              {friendsSince && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-surface-2 px-3 py-1">
                  <CalendarHeart className="h-3.5 w-3.5" /> Friends since{" "}
                  {new Date(friendsSince).toLocaleDateString(undefined, {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Stat
            icon={<BookmarkCheck className="h-4 w-4" />}
            value={shortlist.isLoading ? "–" : codes.length}
            label="Shortlisted"
          />
          <Stat
            icon={<Trophy className="h-4 w-4" />}
            value={
              achievements.isLoading ? "–" : `${earned.length}/${achievements.data?.length ?? 0}`
            }
            label="Achievements"
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-2xl">Shortlist</h2>
        {shortlist.isLoading ? (
          <div className="mt-3 h-20 animate-pulse rounded-xl bg-primary/10" />
        ) : shortlist.error ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {p.display_name}'s shortlist is private.
          </p>
        ) : codes.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No saved courses yet.</p>
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {codes.map((code) => {
              const course = getCourse(code);
              return (
                <Link
                  key={code}
                  to="/course/$code"
                  params={{ code }}
                  className="rounded-xl glass p-3 transition hover:border-brand/60 hover:text-brand"
                >
                  <div className="text-sm font-bold">{code}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {course?.title ?? "Unlisted course"}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-2xl">Achievements</h2>
        {achievements.isLoading ? (
          <div className="mt-3 h-28 animate-pulse rounded-xl bg-primary/10" />
        ) : achievements.error ? (
          <p className="mt-2 text-sm text-muted-foreground">Achievements aren't available.</p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {achievements.data!.map((a) => (
              <div
                key={a.id}
                title={a.description}
                className={`rounded-2xl border p-3 text-center transition ${
                  a.unlocked
                    ? `border-brand/40 bg-gradient-to-br ${a.accent}`
                    : "border-border/40 bg-surface/50 opacity-50 grayscale"
                }`}
              >
                <img
                  src={a.icon}
                  alt=""
                  className="mx-auto h-12 w-12 object-contain image-rendering-pixelated"
                />
                <div className="mt-2 truncate text-xs font-bold">{a.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {a.unlocked && a.unlockedAt
                    ? new Date(a.unlockedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Locked"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface-2 px-4 py-3">
      <div className="font-mega text-2xl font-black text-brand">{value}</div>
      <div className="mt-0.5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
    </div>
  );
}

function LockedProfile({
  userId,
  pendingOut,
  incomingId,
}: {
  userId: string;
  pendingOut: boolean;
  incomingId: string | null;
}) {
  const profile = usePublicProfile(userId);
  const send = useSendFriendRequest();
  const respond = useRespondToRequest();
  const p = profile.data;
  const major = getMajor(p?.major_id ?? null);
  const name = p?.display_name ?? "This student";

  async function add() {
    try {
      await send.mutateAsync(userId);
      toast.success(`Friend request sent to ${name}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send request");
    }
  }

  return (
    <div className="mt-6 rounded-3xl glass p-8">
      {p ? (
        <div className="flex flex-wrap items-center gap-4">
          <img
            src={avatarSrc(p.avatar_id)}
            alt=""
            width={72}
            height={72}
            className="h-[72px] w-[72px] rounded-full border border-border/60 bg-surface-2 object-contain"
          />
          <div className="min-w-0">
            <h1 className="truncate font-display text-3xl font-bold">
              {p.display_name}
              {p.is_verified && <VerifiedBadge className="ml-2 h-5 w-5 align-middle" />}
            </h1>
            <p className="text-sm text-muted-foreground">
              {p.username ? `@${p.username}` : ""}
              {major ? ` · ${major.emoji} ${major.name}` : ""}
            </p>
          </div>
        </div>
      ) : (
        <LockKeyhole className="h-7 w-7 text-brand" />
      )}
      <p className="mt-4 max-w-lg text-sm text-muted-foreground">
        <LockKeyhole className="mr-1 inline h-3.5 w-3.5 -translate-y-px" />
        Shortlists and achievements are visible once you've added each other as friends.
      </p>
      <div className="mt-6">
        {incomingId ? (
          <button
            disabled={respond.isPending}
            onClick={() => respond.mutate({ id: incomingId, accept: true })}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" /> Accept friend request
          </button>
        ) : pendingOut || send.isSuccess ? (
          <span className="inline-flex rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold text-muted-foreground">
            Request pending
          </span>
        ) : p ? (
          <button
            disabled={send.isPending}
            onClick={() => void add()}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" /> Add friend
          </button>
        ) : (
          <Link
            to="/friends"
            className="inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow"
          >
            Find friends
          </Link>
        )}
      </div>
    </div>
  );
}

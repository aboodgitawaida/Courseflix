import { createFileRoute, Link } from "@tanstack/react-router";
import { BookmarkPlus, Sparkles, Trophy, UserPlus } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { PageBackdrop } from "@/components/PageBackdrop";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useAuth } from "@/hooks/use-auth";
import { avatarSrc } from "@/lib/profile";
import { getCourse } from "@/lib/courses";
import { achievementDefinition } from "@/lib/achievements";
import { useFriendFeed, type FeedItem } from "@/lib/feed";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Feed — Courseflix UTM" },
      { name: "description", content: "What your UTM friends are planning to take." },
    ],
  }),
  component: FeedPage,
});

function timeAgo(at: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(at).getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(at).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function FeedPage() {
  const { signedIn } = useAuth();
  const feed = useFriendFeed();

  return (
    <div className="relative min-h-screen overflow-x-clip text-foreground">
      <PageBackdrop />
      <TopNav />
      <main className="mx-auto max-w-2xl px-6 pb-28 pt-10 md:px-10">
        <h1 className="font-mega text-[clamp(2.25rem,6vw,3.5rem)] font-black leading-none tracking-[-0.04em]">
          Feed
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          What your friends are shortlisting and unlocking.
        </p>

        {!signedIn ? (
          <div className="mt-8 rounded-3xl glass p-6">
            <h2 className="font-display text-2xl">Sign in to see your friends' activity</h2>
            <Link
              to="/auth"
              search={{ redirect: "/feed" }}
              className="mt-4 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow"
            >
              Sign in
            </Link>
          </div>
        ) : feed.isLoading ? (
          <div className="mt-8 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-primary/10" />
            ))}
          </div>
        ) : feed.error ? (
          <div className="mt-8">
            <QueryErrorState
              message="Could not load your feed."
              onRetry={() => void feed.refetch()}
            />
          </div>
        ) : feed.friendCount === 0 ? (
          <div className="mt-8 rounded-3xl glass p-8">
            <Sparkles className="h-7 w-7 text-brand" />
            <h2 className="mt-4 font-display text-2xl font-bold">Your feed is empty</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Add classmates to see what they're planning to take — and who's in your courses.
            </p>
            <Link
              to="/friends"
              className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow"
            >
              <UserPlus className="h-4 w-4" /> Find friends
            </Link>
          </div>
        ) : (
          <ol className="mt-8 space-y-3">
            {feed.items.slice(0, 80).map((item) => (
              <FeedRow key={item.id} item={item} people={feed.people} />
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}

function FeedRow({
  item,
  people,
}: {
  item: FeedItem;
  people: ReturnType<typeof useFriendFeed>["people"];
}) {
  const p = people?.get(item.userId);
  const name = p?.display_name ?? "A friend";
  const achievement =
    item.kind === "achievement" ? achievementDefinition(item.achievementId) : null;
  const course = item.kind === "shortlist" ? getCourse(item.code) : null;

  return (
    <li className="flex items-start gap-3 rounded-2xl glass p-4 animate-fade-in-up">
      <Link to="/profile/$id" params={{ id: item.userId }} className="shrink-0">
        <img
          src={avatarSrc(p?.avatar_id)}
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 rounded-full bg-surface-2 object-contain transition hover:scale-105"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug">
          <Link
            to="/profile/$id"
            params={{ id: item.userId }}
            className="font-semibold transition hover:text-brand"
          >
            {name}
            {p?.is_verified && <VerifiedBadge className="ml-1 h-3.5 w-3.5" />}
          </Link>{" "}
          {item.kind === "shortlist" && "shortlisted"}
          {item.kind === "achievement" && "unlocked"}
          {item.kind === "friends" && "and you became friends"}
          {achievement && <span className="font-semibold"> {achievement.name}</span>}
          <span className="ml-2 text-xs text-muted-foreground">{timeAgo(item.at)}</span>
        </p>
        {item.kind === "shortlist" && (
          <Link
            to="/course/$code"
            params={{ code: item.code }}
            className="mt-2 flex items-center gap-2 rounded-xl border border-border/60 bg-surface-2/60 px-3 py-2 transition hover:border-brand/60"
          >
            <BookmarkPlus className="h-4 w-4 shrink-0 text-brand" />
            <span className="text-sm font-bold">{item.code}</span>
            <span className="truncate text-xs text-muted-foreground">
              {course?.title ?? "Unlisted course"}
            </span>
          </Link>
        )}
      </div>
      {achievement ? (
        <img src={achievement.icon} alt="" className="h-10 w-10 shrink-0 object-contain" />
      ) : item.kind === "achievement" ? (
        <Trophy className="h-5 w-5 shrink-0 text-amber-500" />
      ) : null}
    </li>
  );
}

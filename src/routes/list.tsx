import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Bookmark,
  Copy,
  Link2,
  MessageCircle,
  Share2,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { PageBackdrop } from "@/components/PageBackdrop";
import { CourseCard } from "@/components/CourseCard";
import { getCourse } from "@/lib/courses";
import { useAuth } from "@/hooks/use-auth";
import { useShortlist, useToggleShortlist } from "@/lib/ratings";
import { siteUrl } from "@/lib/site";
import { parseShortlistCodesWithStats, parseShortlistSearch } from "@/lib/validation";
import { QueryErrorState } from "@/components/QueryErrorState";
import { announce } from "@/lib/a11y";
import { ShareStoryButton } from "@/components/ShareStoryButton";
import { renderShortlistStory } from "@/lib/story-card";

export const Route = createFileRoute("/list")({
  validateSearch: parseShortlistSearch,

  head: () => ({
    meta: [
      { title: "My Short List — Courseflix UTM" },
      {
        name: "description",
        content:
          "Your saved UTM courses in one place. Share your shortlist link with friends and compare picks before enrolment opens.",
      },
      { property: "og:title", content: "My Shortlist — Courseflix UTM" },
      {
        property: "og:description",
        content: "Save UTM courses, share your shortlist, and compare picks with friends.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl("/list") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: siteUrl("/list") }],
  }),
  component: ListPage,
});

function ListPage() {
  const { ids } = Route.useSearch();
  const { signedIn } = useAuth();
  const { data: saved = [], isLoading, error: shortlistError, refetch } = useShortlist();
  const toggle = useToggleShortlist();

  const shared = !!ids;
  const { codes, skipped: skippedCount } = useMemo(() => {
    const raw: string[] = shared ? ids!.split(",") : (saved as string[]);
    return parseShortlistCodesWithStats(raw, (code) => Boolean(getCourse(code)));
  }, [shared, ids, saved]);

  const courses = codes.map((c) => getCourse(c)).filter(Boolean) as NonNullable<
    ReturnType<typeof getCourse>
  >[];
  const shareUrl = siteUrl(`/list?ids=${encodeURIComponent(courses.map((c) => c.code).join(","))}`);
  const shareText = `My UTM course shortlist 👇\n${courses.map((c) => `• ${c.code} — ${c.title}`).join("\n")}\n\n${shareUrl}`;

  useEffect(() => {
    if (!shared && signedIn && !isLoading && !shortlistError) {
      announce(`${courses.length} shortlist course${courses.length === 1 ? "" : "s"} loaded.`);
    }
  }, [courses.length, isLoading, shared, shortlistError, signedIn]);

  function copy(text: string, msg: string) {
    if (!navigator.clipboard) {
      toast.error("Copying isn't supported in this browser.");
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => toast.success(msg),
      () => toast.error("Could not copy. Check your browser permissions."),
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-clip text-foreground">
      <PageBackdrop />
      <TopNav />

      <div className="relative px-6 md:px-10 pt-10 pb-20 max-w-6xl">
        <div className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
          <Bookmark className="h-3 w-3" /> {shared ? "SHARED SHORTLIST" : "MY SHORTLIST"}
        </div>
        <h1 className="mt-5 font-mega text-[clamp(2.6rem,7vw,5.5rem)] font-black leading-[0.92] tracking-[-0.05em] animate-fade-in-up">
          {shared ? (
            <>
              A friend's{" "}
              <span className="font-serif-accent text-gradient-brand pr-[0.05em] text-[1.12em] font-normal">
                list.
              </span>
            </>
          ) : (
            <>
              My{" "}
              <span className="font-serif-accent text-gradient-brand pr-[0.05em] text-[1.12em] font-normal">
                list.
              </span>
            </>
          )}
        </h1>
        <p className="text-sm text-neutral-500 mt-2" role="status" aria-live="polite">
          {courses.length} course{courses.length === 1 ? "" : "s"}
          {shared ? " · shared link" : " saved"}
        </p>
        {shared && skippedCount > 0 && (
          <p className="mt-3 max-w-2xl text-xs text-amber-200/80">
            {skippedCount} shared entr{skippedCount === 1 ? "y was" : "ies were"} skipped because
            {skippedCount === 1 ? " it was" : " they were"} invalid, unavailable, or duplicated.
          </p>
        )}

        {courses.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/wrapped"
              search={shared ? { ids } : {}}
              className="shine inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black shadow-lg shadow-white/10 transition hover:bg-white/90 active:scale-[0.97]"
            >
              <Sparkles className="h-4 w-4" /> {shared ? "See their Wrapped" : "See my Wrapped"}
            </Link>
            <ShareStoryButton
              render={() => renderShortlistStory(courses, { shared })}
              fileName="courseflix-lineup.png"
            />
            <button
              onClick={() => copy(shareUrl, "Shortlist link copied")}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow focus-visible:ring-2 focus-visible:ring-red-600/50"
            >
              <Share2 className="h-4 w-4" /> Share my shortlist
            </button>
            <button
              onClick={() => copy(shareUrl, "Link copied")}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-surface-2 px-5 py-2.5 text-sm font-semibold transition hover:border-brand/50 hover:shadow-lg hover:shadow-red-900/20 focus-visible:ring-2 focus-visible:ring-red-600/50"
            >
              <Link2 className="h-4 w-4" /> Copy link
            </button>
            <a
              href={`https://www.reddit.com/r/UTM/submit?title=${encodeURIComponent("My UTM course shortlist")}&text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-surface-2 px-5 py-2.5 text-sm font-semibold transition hover:border-brand/50 hover:shadow-lg hover:shadow-red-900/20 focus-visible:ring-2 focus-visible:ring-red-600/50"
            >
              <MessageCircle className="h-4 w-4" /> Post to r/UTM
            </a>
            <button
              onClick={() => copy(shareText, "Discord-ready list copied")}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-surface-2 px-5 py-2.5 text-sm font-semibold transition hover:border-brand/50 hover:shadow-lg hover:shadow-red-900/20 focus-visible:ring-2 focus-visible:ring-red-600/50"
            >
              <Copy className="h-4 w-4" /> Copy for Discord
            </button>
          </div>
        )}

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brand/30 bg-brand/5 p-5 backdrop-blur-md">
          <Users className="h-5 w-5 shrink-0 text-brand" />
          <p className="text-sm text-neutral-500 leading-relaxed">
            Planning courses with friends? Share your shortlist link to compare schedule overlaps
            before enrolment opens.
          </p>
        </div>

        {!shared && !signedIn && (
          <div className="mt-8 rounded-3xl glass p-6">
            <h2 className="font-display text-2xl text-white font-bold tracking-tight">
              Sign in to save courses
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              Your shortlist syncs to your account so it's there on any device.
            </p>
            <Link
              to="/auth"
              search={{ redirect: "/list" }}
              className="mt-4 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-brand-glow transition focus-visible:ring-2 focus-visible:ring-red-600/50"
            >
              Sign in
            </Link>
          </div>
        )}

        {!shared && signedIn && isLoading && (
          <div className="mt-8 space-y-4">
            <div className="h-28 animate-pulse rounded-2xl bg-primary/10" />
            <div className="h-28 animate-pulse rounded-2xl bg-primary/10" />
          </div>
        )}

        {!shared &&
          signedIn &&
          !isLoading &&
          courses.length === 0 &&
          (shortlistError ? (
            <QueryErrorState
              message="Could not load your shortlist."
              onRetry={() => void refetch()}
            />
          ) : (
            <div className="mt-8 rounded-3xl glass p-6">
              <h2 className="font-display text-2xl text-white font-bold tracking-tight">
                Nothing saved yet
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                Hit “Add to shortlist” on any course and it shows up here.
              </p>
              <Link
                to="/"
                className="mt-4 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-brand-glow transition focus-visible:ring-2 focus-visible:ring-red-600/50"
              >
                Browse courses
              </Link>
            </div>
          ))}

        {courses.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-4">
            {courses.map((c) => (
              <div key={c.code} className="relative shrink-0">
                <CourseCard course={c} />
                {!shared && signedIn && (
                  <button
                    disabled={toggle.isPending}
                    onClick={async () => {
                      try {
                        await toggle.mutateAsync({ code: c.code, saved: true });
                        toast.success(`${c.code} removed`);
                      } catch (err) {
                        toast.error(
                          err instanceof Error ? err.message : `Could not remove ${c.code}`,
                        );
                      }
                    }}
                    aria-label={`Remove ${c.code}`}
                    className="absolute bottom-3 right-3 z-20 h-9 w-9 rounded-full bg-black/70 border border-white/20 flex items-center justify-center hover:bg-black transition disabled:cursor-wait disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

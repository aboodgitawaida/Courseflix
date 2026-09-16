import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import { Bookmark, Copy, Link2, MessageCircle, Share2, Trash2, Users } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { CourseCard } from "@/components/CourseCard";
import { getCourse } from "@/lib/courses";
import { useAuth } from "@/hooks/use-auth";
import { useShortlist, useToggleShortlist } from "@/lib/ratings";

const SITE = "https://courseflix-utm.lovable.app";

export const Route = createFileRoute("/list")({
  validateSearch: (s: Record<string, unknown>): { ids?: string } =>
    typeof s['ids'] === "string" ? { ids: s['ids'] as string } : {},

  head: () => ({
    meta: [
      { title: "My Short List — Courseflix UTM" },
      { name: "description", content: "Your saved UTM courses in one place. Share your shortlist link with friends and compare picks before enrolment opens." },
      { property: "og:title", content: "My Shortlist — Courseflix UTM" },
      { property: "og:description", content: "Save UTM courses, share your shortlist, and compare picks with friends." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/list` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/list` }],
  }),
  component: ListPage,
});

function ListPage() {
  const { ids } = Route.useSearch();
  const { signedIn } = useAuth();
  const { data: saved = [], isLoading } = useShortlist();
  const toggle = useToggleShortlist();

  const shared = !!ids;
  const codes = useMemo(() => {
    const raw: string[] = shared ? ids!.split(",") : (saved as string[]);
    return [...new Set(raw.map((c) => c.trim().toUpperCase()).filter(Boolean))];
  }, [shared, ids, saved]);

  const courses = codes.map((c) => getCourse(c)).filter(Boolean) as NonNullable<ReturnType<typeof getCourse>>[];
  const shareUrl = `${SITE}/list?ids=${courses.map((c) => c.code).join(",")}`;
  const shareText = `My UTM course shortlist 👇\n${courses.map((c) => `• ${c.code} — ${c.title}`).join("\n")}\n\n${shareUrl}`;

  function copy(text: string, msg: string) {
    navigator.clipboard?.writeText(text);
    toast.success(msg);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />

      <div className="px-6 md:px-10 pt-10 pb-20 max-w-6xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand backdrop-blur-md">
          <Bookmark className="h-3 w-3" /> {shared ? "SHARED SHORTLIST" : "MY SHORTLIST"}
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-black mt-3 leading-[0.95] text-white tracking-tight">
          {shared ? "A friend's course list" : "My List"}
        </h1>
        <p className="text-sm text-neutral-400 mt-2">
          {courses.length} course{courses.length === 1 ? "" : "s"}
          {shared ? " · shared link" : " saved"}
        </p>

        {courses.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
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
              rel="noreferrer"
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
          <p className="text-sm text-neutral-400">
            Planning courses with friends? Share your shortlist link to compare schedule overlaps before enrolment opens.
          </p>
        </div>

        {!shared && !signedIn && (
          <div className="mt-8 rounded-2xl border border-neutral-800 bg-surface p-6">
            <h2 className="font-display text-2xl text-white font-bold tracking-tight">Sign in to save courses</h2>
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

        {!shared && signedIn && !isLoading && courses.length === 0 && (
          <div className="mt-8 rounded-2xl border border-neutral-800 bg-surface p-6">
            <h2 className="font-display text-2xl text-white font-bold tracking-tight">Nothing saved yet</h2>
            <p className="text-sm text-neutral-400 mt-1">
              Hit “Add to shortlist” on any course and it shows up here.
            </p>
            <Link to="/" className="mt-4 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-brand-glow transition focus-visible:ring-2 focus-visible:ring-red-600/50">
              Browse courses
            </Link>
          </div>
        )}

        {courses.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-4">
            {courses.map((c) => (
              <div key={c.code} className="relative shrink-0">
                <CourseCard course={c} />
                {!shared && signedIn && (
                  <button
                    onClick={async () => {
                      await toggle.mutateAsync({ code: c.code, saved: true });
                      toast.success(`${c.code} removed`);
                    }}
                    aria-label={`Remove ${c.code}`}
                    className="absolute bottom-3 right-3 z-20 h-9 w-9 rounded-full bg-black/70 border border-white/20 flex items-center justify-center hover:bg-black transition"
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

import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, Bookmark, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useCourseUI } from "@/hooks/use-course-ui";
import { useMajor } from "@/hooks/use-major";
import { MAJORS, getMajor } from "@/lib/majors";

export function TopNav() {
  const { signedIn, user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { setSearchOpen } = useCourseUI();
  const { major, setMajor } = useMajor();
  const currentMajor = getMajor(major);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  function scrollToCreator(e: React.MouseEvent) {
    e.preventDefault();
    const go = (tries = 0) => {
      const el = document.getElementById("creator");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (tries < 20) setTimeout(() => go(tries + 1), 100);
    };
    if (pathname === "/") go();
    else navigate({ to: "/" }).then(() => go());
  }

  const label =
    (user?.user_metadata?.['display_name'] as string | undefined) ?? user?.email?.split("@")[0] ?? "Account";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 md:gap-4 md:px-10">
        <Link to="/" className="shrink-0">
          <span className="wordmark font-display text-2xl leading-none md:text-3xl">Courseflix</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-muted-foreground lg:flex">
          <Link to="/" className="transition hover:text-foreground">Browse</Link>
          <Link to="/list" className="transition hover:text-foreground">My Shortlist</Link>
          <a href="/#creator" onClick={scrollToCreator} className="transition hover:text-foreground">Creator</a>
        </nav>

        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Search courses"
          className="ml-auto hidden h-9 min-w-[220px] items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-left text-sm text-muted-foreground transition hover:border-brand/50 sm:flex"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 truncate">Search courses…</span>
          <kbd className="rounded border border-white/15 bg-black/50 px-1.5 py-0.5 text-[10px] font-semibold">⌘K</kbd>
        </button>

        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Search courses"
          className="ml-auto grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/10 sm:hidden"
        >
          <Search className="h-4 w-4" />
        </button>

        <label className="hidden items-center gap-2 md:flex">
          <span className="sr-only">My program</span>
          <select
            value={major ?? ""}
            onChange={(e) => setMajor(e.target.value || null)}
            className="h-9 max-w-[180px] truncate rounded-full border border-white/10 bg-white/5 px-3 text-xs font-semibold outline-none transition hover:border-brand/50"
            aria-label="My program"
          >
            <option value="">My Program: Select</option>
            {MAJORS.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#121216]">
                {m.emoji} {m.name}
              </option>
            ))}
          </select>
        </label>

        <Link
          to="/list"
          aria-label="My shortlist"
          title={currentMajor ? `My shortlist · ${currentMajor.name}` : "My shortlist"}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition hover:bg-white/10"
        >
          <Bookmark className="h-4 w-4" />
        </Link>

        {signedIn ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="hidden max-w-[140px] items-center gap-1.5 truncate rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold sm:inline-flex">
              <User className="h-3.5 w-3.5 text-brand" /> {label}
            </span>
            <button
              onClick={signOut}
              aria-label="Sign out"
              className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-brand px-3 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow"
          >
            <User className="h-4 w-4" /> <span className="hidden sm:inline">Sign in</span>
          </Link>
        )}
      </div>
    </header>
  );
}

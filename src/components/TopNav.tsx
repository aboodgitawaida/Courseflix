import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, Bookmark, User, Menu, X, Users, Settings, LifeBuoy, Star } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCourseUI } from "@/hooks/use-course-ui";
import { useMajor } from "@/hooks/use-major";
import { MAJORS, getMajor } from "@/lib/majors";
import { ProfileMenu } from "@/components/ProfileMenu";
import { NotificationBell } from "@/components/NotificationBell";

export function TopNav() {
  const { signedIn } = useAuth();
  const navigate = useNavigate();
  const { setSearchOpen } = useCourseUI();
  const { major, setMajor } = useMajor();
  const currentMajor = getMajor(major);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function scrollToCreator(e: React.MouseEvent) {
    e.preventDefault();
    setMobileMenuOpen(false);
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

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-background/70 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 md:gap-4 md:px-10">
        <Link to="/" aria-label="Courseflix home" className="shrink-0">
          <span className="wordmark font-display text-2xl leading-none md:text-3xl">
            Courseflix
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-muted-foreground lg:flex">
          <Link to="/" className="transition hover:text-foreground">
            Browse
          </Link>
          <Link to="/list" className="transition hover:text-foreground">
            My Shortlist
          </Link>
          {signedIn && (
            <Link to="/reviews" className="transition hover:text-foreground">
              My Reviews
            </Link>
          )}
          <a
            href="/#creator"
            onClick={scrollToCreator}
            className="transition hover:text-foreground"
          >
            Creator
          </a>
        </nav>

        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Search courses"
          className="ml-auto hidden h-9 min-w-[220px] items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 text-left text-sm text-muted-foreground transition hover:border-brand/50 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-white/30 sm:flex"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 truncate">Search courses…</span>
          <kbd className="rounded border border-white/[0.12] bg-black/50 px-1.5 py-0.5 text-[10px] font-semibold">
            ⌘K
          </kbd>
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
            className="h-9 max-w-[180px] truncate rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-md px-3 text-xs font-semibold outline-none transition hover:border-brand/50 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-white/30"
            aria-label="My program"
          >
            <option value="">My Program: Select</option>
            {MAJORS.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#121215]">
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
            <NotificationBell />
            <ProfileMenu />
          </div>
        ) : (
          <Link
            to="/auth"
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-brand px-3 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow"
          >
            <User className="h-4 w-4" /> <span className="hidden sm:inline">Sign in</span>
          </Link>
        )}

        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/30 lg:hidden"
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-white/[0.08] bg-background/95 px-4 py-3 backdrop-blur-xl lg:hidden"
        >
          <div className="grid gap-1 text-sm font-medium">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-2.5 transition hover:bg-white/10 hover:text-foreground ${
                pathname === "/" ? "bg-white/10 text-foreground" : "text-muted-foreground"
              }`}
              aria-current={pathname === "/" ? "page" : undefined}
            >
              Browse
            </Link>
            <Link
              to="/list"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-2.5 transition hover:bg-white/10 hover:text-foreground ${
                pathname === "/list" ? "bg-white/10 text-foreground" : "text-muted-foreground"
              }`}
              aria-current={pathname === "/list" ? "page" : undefined}
            >
              <Bookmark className="mr-2 inline h-4 w-4" /> My shortlist
            </Link>
            <Link
              to="/friends"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-2.5 transition hover:bg-white/10 hover:text-foreground ${
                pathname === "/friends" ? "bg-white/10 text-foreground" : "text-muted-foreground"
              }`}
              aria-current={pathname === "/friends" ? "page" : undefined}
            >
              <Users className="mr-2 inline h-4 w-4" /> Friends
            </Link>
            {signedIn && (
              <Link
                to="/reviews"
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-lg px-3 py-2.5 transition hover:bg-white/10 hover:text-foreground ${
                  pathname === "/reviews" ? "bg-white/10 text-foreground" : "text-muted-foreground"
                }`}
                aria-current={pathname === "/reviews" ? "page" : undefined}
              >
                <Star className="mr-2 inline h-4 w-4" /> My reviews
              </Link>
            )}
            <Link
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-2.5 transition hover:bg-white/10 hover:text-foreground ${
                pathname === "/settings" ? "bg-white/10 text-foreground" : "text-muted-foreground"
              }`}
              aria-current={pathname === "/settings" ? "page" : undefined}
            >
              <Settings className="mr-2 inline h-4 w-4" /> Settings
            </Link>
            <Link
              to="/help"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-2.5 transition hover:bg-white/10 hover:text-foreground ${
                pathname === "/help" ? "bg-white/10 text-foreground" : "text-muted-foreground"
              }`}
              aria-current={pathname === "/help" ? "page" : undefined}
            >
              <LifeBuoy className="mr-2 inline h-4 w-4" /> Help
            </Link>
            <a
              href="/#creator"
              onClick={scrollToCreator}
              className="rounded-lg px-3 py-2.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
            >
              Creator
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}

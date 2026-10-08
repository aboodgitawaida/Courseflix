import { Link, useRouterState } from "@tanstack/react-router";
import { Search, Bookmark, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCourseUI } from "@/hooks/use-course-ui";
import { useMajor } from "@/hooks/use-major";
import { getMajor } from "@/lib/majors";
import { ProgramButton } from "@/components/ProgramPicker";
import { ProfileMenu } from "@/components/ProfileMenu";
import { NotificationBell } from "@/components/NotificationBell";
import { useGoToHomeSection, useHomeSection } from "@/hooks/use-home-section";

export function TopNav() {
  const { signedIn } = useAuth();
  const { setSearchOpen } = useCourseUI();
  const { major } = useMajor();
  const currentMajor = getMajor(major);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const section = useHomeSection();
  const goTo = useGoToHomeSection();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const desktopLink = (active: boolean) =>
    `relative rounded-full px-3 py-1.5 transition hover:text-foreground ${
      active ? "bg-white/[0.08] text-foreground" : ""
    }`;

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 md:px-6">
      <div
        className={`glass mx-auto flex h-14 items-center gap-2 rounded-full pl-5 pr-2 transition-all duration-500 md:gap-3 ${
          scrolled
            ? "max-w-6xl bg-background/95 shadow-2xl shadow-black/40 lg:bg-background/70"
            : "max-w-[1600px]"
        }`}
      >
        <Link
          to="/"
          aria-label="Courseflix home"
          onClick={(e) => goTo("browse", e)}
          className="shrink-0"
        >
          <span className="wordmark text-2xl leading-none md:text-[1.7rem]">Courseflix</span>
        </Link>

        <nav className="ml-2 hidden items-center gap-0.5 text-sm font-medium text-muted-foreground lg:flex">
          <Link
            to="/"
            onClick={(e) => goTo("browse", e)}
            className={desktopLink(pathname === "/" && section === "browse")}
          >
            Browse
          </Link>
          <Link to="/list" className={desktopLink(pathname === "/list")}>
            My Shortlist
          </Link>
          {signedIn && (
            <Link to="/reviews" className={desktopLink(pathname === "/reviews")}>
              My Reviews
            </Link>
          )}
          {signedIn && (
            <Link to="/achievements" className={desktopLink(pathname === "/achievements")}>
              Achievements
            </Link>
          )}
          <a
            href="/#creator"
            onClick={(e) => goTo("creator", e)}
            className={desktopLink(section === "creator")}
          >
            Creator
          </a>
        </nav>

        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Search courses"
          className="glow-ring ml-auto hidden h-9 min-w-[220px] items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 text-left text-sm text-muted-foreground transition hover:border-brand/50 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-white/30 sm:flex"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 truncate">Search courses…</span>
          <kbd className="rounded-md border border-white/[0.12] px-1.5 py-0.5 text-[10px] font-semibold">
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

        <ProgramButton />

        <Link
          to="/list"
          aria-label="My shortlist"
          title={currentMajor ? `My shortlist · ${currentMajor.name}` : "My shortlist"}
          className="hidden h-9 w-9 shrink-0 place-items-center rounded-full transition hover:bg-white/10 lg:grid"
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
            className="shine flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-brand/30 transition hover:bg-brand-glow"
          >
            <User className="h-4 w-4" /> <span className="hidden sm:inline">Sign in</span>
          </Link>
        )}
      </div>
    </header>
  );
}

import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  Award,
  Bookmark,
  Code2,
  Home,
  LifeBuoy,
  LogIn,
  Search,
  Settings,
  Star,
  UserRound,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCourseUI } from "@/hooks/use-course-ui";
import { useShortlist } from "@/lib/ratings";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const ME_PATHS = ["/friends", "/achievements", "/reviews", "/settings", "/help", "/auth"];

/** App-style bottom navigation for phones and tablets. */
export function MobileTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { signedIn } = useAuth();
  const { searchOpen, setSearchOpen } = useCourseUI();
  const { data: saved = [] } = useShortlist();
  const [meOpen, setMeOpen] = useState(false);

  const active = searchOpen
    ? 1
    : meOpen
      ? 3
      : pathname === "/"
        ? 0
        : pathname === "/list"
          ? 2
          : ME_PATHS.some((p) => pathname.startsWith(p))
            ? 3
            : -1;

  const tab =
    "relative z-10 flex flex-col items-center justify-center gap-0.5 rounded-full py-2 text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60";
  const tone = (i: number) => (active === i ? "text-primary-foreground" : "text-muted-foreground");

  function goCreator() {
    setMeOpen(false);
    const scroll = (tries = 0) => {
      const el = document.getElementById("creator");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else if (tries < 20) window.setTimeout(() => scroll(tries + 1), 100);
    };
    if (pathname === "/") scroll();
    else void navigate({ to: "/" }).then(() => scroll());
  }

  const meLinks = [
    ...(signedIn ? [] : [{ to: "/auth" as const, label: "Sign in", icon: LogIn }]),
    { to: "/friends" as const, label: "Friends", icon: Users },
    { to: "/achievements" as const, label: "Achievements", icon: Award },
    ...(signedIn ? [{ to: "/reviews" as const, label: "My reviews", icon: Star }] : []),
    { to: "/settings" as const, label: "Settings", icon: Settings },
    { to: "/help" as const, label: "Help", icon: LifeBuoy },
  ];

  return (
    <>
      <nav
        aria-label="Primary"
        className="mobile-tabbar glass fixed inset-x-3 z-50 rounded-full bg-background/80 p-1.5 shadow-2xl shadow-black/50 lg:hidden"
      >
        <div className="relative grid grid-cols-4">
          {active >= 0 && (
            <span
              aria-hidden="true"
              className="absolute inset-y-0 w-1/4 rounded-full bg-brand shadow-lg shadow-brand/40 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `translateX(${active * 100}%)` }}
            />
          )}
          <Link
            to="/"
            className={`${tab} ${tone(0)}`}
            aria-current={pathname === "/" ? "page" : undefined}
          >
            <Home className="h-5 w-5" />
            Browse
          </Link>
          <button type="button" onClick={() => setSearchOpen(true)} className={`${tab} ${tone(1)}`}>
            <Search className="h-5 w-5" />
            Search
          </button>
          <Link
            to="/list"
            className={`${tab} ${tone(2)}`}
            aria-current={pathname === "/list" ? "page" : undefined}
          >
            <span className="relative">
              <Bookmark className="h-5 w-5" />
              {saved.length > 0 && (
                <span className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[9px] font-bold text-black">
                  {saved.length > 99 ? "99+" : saved.length}
                </span>
              )}
            </span>
            Saved
          </Link>
          <button
            type="button"
            onClick={() => setMeOpen(true)}
            className={`${tab} ${tone(3)}`}
            aria-haspopup="dialog"
          >
            <UserRound className="h-5 w-5" />
            {signedIn ? "Me" : "More"}
          </button>
        </div>
      </nav>

      <Dialog open={meOpen} onOpenChange={setMeOpen}>
        <DialogContent className="top-auto bottom-0 max-w-none translate-y-0 rounded-b-none rounded-t-[2rem] border-white/10 bg-[#121216] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] data-[state=open]:slide-in-from-bottom-1/2 sm:rounded-t-[2rem] lg:hidden">
          <div
            aria-hidden="true"
            className="mx-auto -mt-1 mb-2 h-1 w-10 rounded-full bg-white/20"
          />
          <DialogTitle className="font-mega text-2xl font-extrabold tracking-tight">
            {signedIn ? "Your stuff" : "More"}
          </DialogTitle>
          <DialogDescription className="sr-only">Account and site links</DialogDescription>
          <div className="grid grid-cols-2 gap-2">
            {meLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMeOpen(false)}
                className={`glass flex min-h-14 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[0.97] ${
                  pathname.startsWith(to) ? "border-brand/50 text-brand" : ""
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" /> {label}
              </Link>
            ))}
            <button
              type="button"
              onClick={goCreator}
              className="glass flex min-h-14 items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition active:scale-[0.97]"
            >
              <Code2 className="h-4 w-4 shrink-0" /> Creator
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

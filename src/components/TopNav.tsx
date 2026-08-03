import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Bookmark, User, ChevronDown, LogOut } from "lucide-react";
import type { Major } from "@/lib/majors";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { SearchOverlay } from "./SearchOverlay";

export function TopNav({
  major,
  onChangeMajor,
}: {
  major?: Major;
  onChangeMajor?: () => void;
}) {
  const { signedIn, user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  function scrollToCreator(e: React.MouseEvent) {
    e.preventDefault();
    const go = () => {
      const el = document.getElementById("creator");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    if (pathname === "/") {
      go();
    } else {
      navigate({ to: "/" }).then(() => setTimeout(go, 120));
    }
  }

  const label = (user?.user_metadata?.['display_name'] as string | undefined) ?? user?.email?.split("@")[0] ?? "Account";

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/40">
        <div className="flex items-center justify-between px-6 md:px-10 h-16 gap-4">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <span className="wordmark font-display text-2xl md:text-3xl leading-none">Courseflix</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition">Browse</Link>
            <Link to="/list" className="hover:text-foreground transition">My Shortlist</Link>
            <a href="/#creator" onClick={scrollToCreator} className="hover:text-foreground transition">Creator</a>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {major && onChangeMajor && (
              <button
                onClick={onChangeMajor}
                className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-surface hover:bg-surface-2 border border-border/50 hover:border-brand/40 text-xs font-semibold transition"
                title="Change major"
              >
                <span>{major.emoji}</span>
                <span className="max-w-[120px] truncate">{major.name}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
            <button
              onClick={() => setSearchOpen(true)}
              className="h-9 w-9 rounded-full hover:bg-surface flex items-center justify-center transition"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link
              to="/list"
              className="h-9 w-9 rounded-full hover:bg-surface flex items-center justify-center transition"
              aria-label="My shortlist"
              title="My shortlist"
            >
              <Bookmark className="h-4 w-4" />
            </Link>
            {signedIn ? (
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-surface border border-border/50 text-xs font-semibold max-w-[140px] truncate">
                  <User className="h-3.5 w-3.5 text-brand" /> {label}
                </span>
                <button
                  onClick={signOut}
                  className="h-9 w-9 rounded-full hover:bg-surface flex items-center justify-center transition"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="h-9 px-3 rounded-full bg-brand text-primary-foreground text-sm font-semibold hover:bg-brand-glow transition flex items-center gap-1.5"
              >
                <User className="h-4 w-4" /> <span className="hidden sm:inline">Sign in</span>
              </Link>
            )}
          </div>
        </div>
      </header>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

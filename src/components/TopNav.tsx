import { Link } from "@tanstack/react-router";
import { Search, Bookmark, User } from "lucide-react";

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/40">
      <div className="flex items-center justify-between px-6 md:px-10 h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-mint flex items-center justify-center mint-glow">
            <span className="font-display font-black text-background text-lg leading-none">C</span>
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            course<span className="text-mint">flix</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition">Browse</Link>
          <a href="#" className="hover:text-foreground transition">For You</a>
          <a href="#" className="hover:text-foreground transition">My List</a>
          <a href="#" className="hover:text-foreground transition">Timetable</a>
        </nav>
        <div className="flex items-center gap-2">
          <button className="h-9 w-9 rounded-full hover:bg-surface flex items-center justify-center transition" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
          <button className="h-9 w-9 rounded-full hover:bg-surface flex items-center justify-center transition" aria-label="My list">
            <Bookmark className="h-4 w-4" />
          </button>
          <button className="h-9 px-3 rounded-full bg-mint text-primary-foreground text-sm font-semibold hover:bg-mint-glow transition flex items-center gap-1.5">
            <User className="h-4 w-4" /> <span className="hidden sm:inline">Sign in</span>
          </button>
        </div>
      </div>
    </header>
  );
}

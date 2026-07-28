import { Link } from "@tanstack/react-router";
import type { Course } from "@/lib/courses";
import { Play, Plus, Star } from "lucide-react";

export function Hero({ featured, major }: { featured: Course; major: string }) {
  const feat = featured;
  const [c1, c2] = feat.poster;


  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 70% 40%, ${c2} 0%, ${c1} 40%, var(--background) 90%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-mint/10 blur-3xl" />

      <div className="relative px-6 md:px-10 pt-12 md:pt-20 pb-16 md:pb-24 max-w-5xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-3 py-1 text-xs font-semibold text-mint mb-5">
          <span className="h-1.5 w-1.5 rounded-full bg-mint animate-pulse" />
          TOP PICK FOR {major.toUpperCase()}
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-black leading-[0.95] tracking-tight">
          {feat.code}
          <br />
          <span className="text-mint">{feat.title}</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base md:text-lg text-muted-foreground">
          {feat.vibe} {feat.description}
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm text-foreground/80">
          <span className="flex items-center gap-1 font-semibold"><Star className="h-4 w-4 fill-mint text-mint" /> {feat.rating.toFixed(1)}</span>
          <span>·</span>
          <span>{feat.wouldTakeAgain}% would retake</span>
          <span>·</span>
          <span>Top prof: <span className="text-foreground font-medium">{feat.topProfs[0].name}</span></span>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/course/$code"
            params={{ code: feat.code }}
            className="inline-flex items-center gap-2 rounded-full bg-mint text-primary-foreground px-6 py-3 font-semibold text-sm hover:bg-mint-glow transition mint-glow"
          >
            <Play className="h-4 w-4 fill-current" /> Course info
          </Link>
          <button className="inline-flex items-center gap-2 rounded-full bg-surface/80 backdrop-blur border border-border/50 px-6 py-3 font-semibold text-sm hover:bg-surface-2 transition">
            <Plus className="h-4 w-4" /> My list
          </button>
        </div>
      </div>
    </section>
  );
}

import { Link, useNavigate } from "@tanstack/react-router";
import type { Course } from "@/lib/courses";
import { Play, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useShortlist, useToggleShortlist } from "@/lib/ratings";
import { useState } from "react";
import { FALLBACK_MAJOR_IMAGE } from "@/lib/major-images";
import { getCourseImage } from "@/lib/course-images";

export function Hero({ featured, major }: { featured: Course; major: string }) {
  const feat = featured;
  const [c1, c2] = feat.poster;
  const [imageSrc, setImageSrc] = useState(() => getCourseImage(feat.subject));
  const navigate = useNavigate();
  const { signedIn } = useAuth();
  const { data: saved = [] } = useShortlist();
  const toggle = useToggleShortlist();
  const inList = saved.includes(feat.code);

  async function onToggleList() {
    if (!signedIn) {
      navigate({ to: "/auth", search: { redirect: `/course/${feat.code}` } });
      return;
    }

    try {
      await toggle.mutateAsync({ code: feat.code, saved: inList });
      toast.success(
        inList
          ? `${feat.code} removed from your shortlist`
          : `${feat.code} added to your shortlist`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update shortlist");
    }
  }

  return (
    <section className="relative overflow-hidden animate-fade-in-up">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 70% 40%, ${c2}33 0%, ${c1}33 40%, transparent 70%)`,
        }}
      />
      <img
        src={imageSrc}
        alt=""
        decoding="async"
        width={1200}
        height={675}
        className="absolute inset-0 h-full w-full object-cover opacity-35"
        onError={() => {
          if (imageSrc !== FALLBACK_MAJOR_IMAGE) setImageSrc(FALLBACK_MAJOR_IMAGE);
        }}
      />
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand/15 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-brand/10 blur-3xl" />

      <div className="relative px-6 md:px-10 pt-12 md:pt-20 pb-16 md:pb-24 max-w-5xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand mb-5 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
          TOP PICK FOR {major.toUpperCase()}
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-black leading-[0.95] tracking-tight text-white">
          {feat.code}
          <br />
          <span className="text-brand tracking-tight">{feat.title}</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base md:text-lg text-neutral-400 leading-relaxed">
          {feat.description}
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm text-foreground/80">
          <span className="flex items-center gap-1 font-semibold">
            <Star className="h-4 w-4 fill-brand text-brand" /> {feat.rating.toFixed(1)}
          </span>
          <span>·</span>
          <span>{feat.wouldTakeAgain}% would retake</span>
          <span>·</span>
          <span className="text-muted-foreground">Sample rating</span>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/course/$code"
            params={{ code: feat.code }}
            className="inline-flex items-center gap-2 rounded-full bg-brand text-primary-foreground px-6 py-3 font-semibold text-sm hover:bg-brand-glow transition brand-glow focus-visible:ring-2 focus-visible:ring-white/30 active:scale-[0.98]"
          >
            <Play className="h-4 w-4 fill-current" /> Course info
          </Link>
          <button
            onClick={() => void onToggleList()}
            disabled={toggle.isPending}
            aria-pressed={inList}
            className="inline-flex items-center gap-2 rounded-full bg-surface/80 backdrop-blur border border-white/[0.12] px-6 py-3 font-semibold text-sm hover:bg-surface-2 transition focus-visible:ring-2 focus-visible:ring-white/30 active:scale-[0.98] disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> {inList ? "In my list" : "My list"}
          </button>
        </div>
      </div>
    </section>
  );
}

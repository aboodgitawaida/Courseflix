import { Link, useNavigate } from "@tanstack/react-router";
import type { Course } from "@/lib/courses";
import { Play, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useShortlist, useToggleShortlist } from "@/lib/ratings";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";

export function Hero({ featured, major }: { featured: Course; major: string }) {
  const feat = featured;
  const [c1, c2] = feat.poster;
  const navigate = useNavigate();
  const { signedIn } = useAuth();
  const { data: saved = [] } = useShortlist();
  const toggle = useToggleShortlist();
  const inList = saved.includes(feat.code);
  const cardRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useTransform(pointerY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(pointerX, [-0.5, 0.5], [-8, 8]);

  function onCardMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function resetCardTilt() {
    pointerX.set(0);
    pointerY.set(0);
  }

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
    <section className="relative overflow-hidden bg-[#08080C]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-purple-500/5" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:url('data:image/svg+xml,%3Csvg viewBox=%220 0 180 180%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%22.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%22.8%22/%3E%3C/svg%3E')]" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 70% 40%, ${c2}33 0%, ${c1}33 40%, transparent 70%)`,
        }}
      />
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand/15 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-brand/10 blur-3xl" />

      <div className="relative grid max-w-7xl items-center gap-12 px-6 pb-16 pt-12 md:grid-cols-[1fr_340px] md:px-10 md:pb-24 md:pt-20">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
            TOP PICK FOR {major.toUpperCase()}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25, delay: 0.08 }}
            className="font-display text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl"
          >
            {feat.code}
            <br />
            <span className="text-brand tracking-tight">{feat.title}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25, delay: 0.16 }}
            className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-400 md:text-lg"
          >
            {feat.description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.24 }}
            className="mt-4 flex items-center gap-4 text-sm text-foreground/80"
          >
            <span className="flex items-center gap-1 font-semibold">
              <Star className="h-4 w-4 fill-brand text-brand" /> {feat.rating.toFixed(1)}
            </span>
            <span>·</span>
            <span>{feat.wouldTakeAgain}% would retake</span>
            <span>·</span>
            <span className="text-muted-foreground">Sample rating</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
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
          </motion.div>
        </div>
        <motion.div
          ref={cardRef}
          style={{ rotateX, rotateY, transformPerspective: 900 }}
          onMouseMove={onCardMove}
          onMouseLeave={resetCardTilt}
          className="group relative hidden aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-indigo-950/40 backdrop-blur-xl md:block"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-transparent to-purple-500/20" />
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage: `radial-gradient(circle at 30% 20%, ${c1}88, transparent 35%), radial-gradient(circle at 80% 70%, ${c2}66, transparent 45%)`,
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/60">
              Featured course
            </span>
            <div className="mt-2 font-display text-5xl font-bold text-white">{feat.code}</div>
            <div className="mt-1 text-sm font-medium text-white/70">{feat.title}</div>
          </div>
          <div className="absolute right-5 top-5 h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_24px_8px_rgba(34,211,238,0.35)]" />
        </motion.div>
      </div>
    </section>
  );
}

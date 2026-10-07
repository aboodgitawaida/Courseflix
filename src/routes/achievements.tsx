import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, LockKeyhole, Sparkles, Trophy } from "lucide-react";
import { useEffect } from "react";
import { TopNav } from "@/components/TopNav";
import { PageBackdrop } from "@/components/PageBackdrop";
import { useAuth } from "@/hooks/use-auth";
import { createAchievementNotifications, useAchievements } from "@/lib/achievements";
import { QueryErrorState } from "@/components/QueryErrorState";

export const Route = createFileRoute("/achievements")({
  head: () => ({ meta: [{ title: "Achievements — Courseflix UTM" }, { name: "description", content: "Collect Courseflix achievements as you explore UTM courses." }] }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const { signedIn } = useAuth();
  const { achievements, isLoading, error, refetch } = useAchievements(signedIn);
  const unlocked = achievements.filter((achievement) => achievement.unlocked).length;
  useEffect(() => {
    if (!signedIn || isLoading || error) return;
    void createAchievementNotifications(
      achievements.filter((achievement) => achievement.unlocked).map((achievement) => achievement.id),
    );
  }, [achievements, error, isLoading, signedIn]);

  return (
    <div className="relative min-h-screen overflow-x-clip text-foreground">
      <PageBackdrop />
      <TopNav />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-10 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand"><Trophy className="h-4 w-4" /> Your shelf</p>
            <h1 className="mt-3 font-mega text-[clamp(2.6rem,7vw,5.5rem)] font-black leading-[0.92] tracking-[-0.05em] animate-fade-in-up">
              Achieve<span className="font-serif-accent text-gradient-brand pr-[0.05em] text-[1.12em] font-normal">ments.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Tiny milestones for making Courseflix more useful for you — and for the next UTM student.</p>
          </div>
          {signedIn && <div className="glass glow-ring rounded-3xl px-6 py-4 text-right"><div className="font-mega text-4xl font-black text-brand">{unlocked}<span className="text-muted-foreground">/{achievements.length}</span></div><div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">unlocked</div></div>}
        </div>

        {!signedIn ? (
          <div className="mt-10 rounded-3xl glass p-8">
            <Sparkles className="h-7 w-7 text-brand" />
            <h2 className="mt-4 font-display text-3xl font-bold">Your story starts here</h2>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">Sign in to collect badges for reviews, shortlist picks, and building your Courseflix circle.</p>
            <Link to="/auth" search={{ redirect: "/achievements" }} className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground">Sign in <ArrowRight className="h-4 w-4" /></Link>
          </div>
        ) : isLoading ? <div className="mt-10 grid gap-4 sm:grid-cols-2"><div className="h-40 animate-pulse rounded-3xl bg-primary/10" /><div className="h-40 animate-pulse rounded-3xl bg-primary/10" /></div>
          : error ? <div className="mt-10"><QueryErrorState message="Could not load your achievements." onRetry={() => void refetch()} /></div>
          : <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{achievements.map((achievement) => <article key={achievement.id} className={`relative overflow-hidden rounded-3xl border p-5 transition duration-500 hover:-translate-y-1 ${achievement.unlocked ? `shine border-brand/40 bg-gradient-to-br shadow-xl shadow-brand/10 hover:shadow-brand/30 ${achievement.accent}` : "border-border/40 bg-surface/50 opacity-65 grayscale"}`}><div className="flex items-start justify-between gap-3"><div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-black/20"><img src={achievement.icon} alt="" className="h-12 w-12 object-contain image-rendering-pixelated" /></div>{achievement.unlocked ? <span className="rounded-full bg-brand/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand">Unlocked</span> : <LockKeyhole className="h-4 w-4 text-muted-foreground" />}</div><h2 className="mt-5 font-display text-2xl font-bold">{achievement.name}</h2><p className="mt-1 min-h-10 text-sm leading-5 text-muted-foreground">{achievement.description}</p><div className="mt-4"><div className="mb-1 flex justify-between text-[11px] font-semibold text-muted-foreground"><span>{achievement.unlocked ? "Complete" : "Progress"}</span><span>{achievement.progress}/{achievement.requirement}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-black/20"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(achievement.progress / achievement.requirement) * 100}%` }} /></div></div></article>)}</div>}
      </main>
    </div>
  );
}

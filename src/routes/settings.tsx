import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Lock, Unlock } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useSound } from "@/hooks/use-sound";
import { AVATARS, useProfile, useUpdateProfile } from "@/lib/profile";
import { MAJORS } from "@/lib/majors";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Account & settings — Courseflix UTM" },
      { name: "description", content: "Set your username, pick a UTM avatar, choose your program, and control whether your shortlist is public or private." },
      { property: "og:title", content: "Account & settings — Courseflix UTM" },
      { property: "og:description", content: "Username, avatar, program and privacy settings for your Courseflix account." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { signedIn } = useAuth();
  const { data: profile, isLoading, error: profileError } = useProfile();
  const update = useUpdateProfile();
  const { theme, toggleTheme } = useTheme();
  const { muted, toggleMuted, play } = useSound();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [majorId, setMajorId] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? "");
    setUsername(profile.username ?? "");
    setMajorId(profile.major_id ?? "");
    setYear(profile.year ? String(profile.year) : "");
  }, [profile]);

  async function save() {
    const handle = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, "");
    if (handle && handle.length < 3) {
      toast.error("Usernames need at least 3 characters.");
      return;
    }
    try {
      await update.mutateAsync({ display_name: displayName.trim() || "UTM student", username: handle || null, major_id: majorId || null, year: year ? Number(year) : null });
      play("pop");
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save profile");
    }
  }

  async function pickAvatar(id: string) {
    try {
      await update.mutateAsync({ avatar_id: id });
      play("pop");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update avatar");
    }
  }

  async function togglePrivacy() {
    if (!profile) {
      toast.error(profileError instanceof Error ? profileError.message : "Your profile is still loading.");
      return;
    }
    try {
      await update.mutateAsync({ is_private: !profile.is_private });
      play("toggle");
      toast.success(profile.is_private ? "Your shortlist is public now" : "Your shortlist is private now");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update privacy");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-10 md:px-10">
        <h1 className="font-display text-4xl font-black md:text-5xl">Account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your profile, avatar and privacy on Courseflix.</p>
        {!signedIn && <div className="mt-8 rounded-2xl border border-border/50 bg-surface p-6"><h2 className="font-display text-2xl">Sign in to manage your account</h2><Link to="/auth" search={{ redirect: "/settings" }} className="mt-4 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow">Sign in</Link></div>}
        {signedIn && profileError && <div className="mt-8 rounded-2xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">Could not load your profile. {profileError instanceof Error ? profileError.message : "Please refresh and try again."}</div>}
        {signedIn && !isLoading && profile && (
          <>
            <section className="mt-8 rounded-2xl border border-border/50 bg-surface p-6">
              <h2 className="font-display text-2xl">Profile</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm"><span className="text-muted-foreground">Display name</span><input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={40} className="mt-1 h-10 w-full rounded-lg border border-border/60 bg-surface-2 px-3 text-sm outline-none focus:border-brand" /></label>
                <label className="text-sm"><span className="text-muted-foreground">Username</span><input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="utm_goose" maxLength={24} className="mt-1 h-10 w-full rounded-lg border border-border/60 bg-surface-2 px-3 text-sm outline-none focus:border-brand" /></label>
                <label className="text-sm"><span className="text-muted-foreground">Program</span><select value={majorId} onChange={(e) => setMajorId(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border/60 bg-surface-2 px-3 text-sm outline-none focus:border-brand"><option value="">Not set</option>{MAJORS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
                <label className="text-sm"><span className="text-muted-foreground">Year of study</span><select value={year} onChange={(e) => setYear(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border/60 bg-surface-2 px-3 text-sm outline-none focus:border-brand"><option value="">Not set</option>{[1, 2, 3, 4, 5].map((y) => <option key={y} value={y}>Year {y}</option>)}</select></label>
              </div>
              <button onClick={() => void save()} disabled={update.isPending} className="mt-5 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow disabled:opacity-60">{update.isPending ? "Saving…" : "Save profile"}</button>
            </section>
            <section className="mt-6 rounded-2xl border border-border/50 bg-surface p-6"><h2 className="font-display text-2xl">Avatar</h2><p className="mt-1 text-sm text-muted-foreground">Pick your UTM icon.</p><div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">{AVATARS.map((a) => <button key={a.id} onClick={() => void pickAvatar(a.id)} aria-label={a.label} className={`relative aspect-square rounded-xl border p-2 transition ${profile.avatar_id === a.id ? "border-brand bg-brand/10" : "border-border/60 bg-surface-2 hover:border-brand/50"}`}><img src={a.src} alt={a.label} loading="lazy" width={512} height={512} className="h-full w-full object-contain" />{profile.avatar_id === a.id && <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-brand text-primary-foreground"><Check className="h-3 w-3" /></span>}</button>)}</div></section>
            <section id="preferences" className="mt-6 rounded-2xl border border-border/50 bg-surface p-6"><h2 className="font-display text-2xl">Preferences</h2><div className="mt-4 space-y-3"><button disabled={update.isPending} onClick={() => void togglePrivacy()} className="flex w-full items-center justify-between gap-3 rounded-xl border border-border/60 bg-surface-2 p-4 text-left transition hover:border-brand/50 disabled:opacity-60"><span className="flex items-center gap-3 text-sm font-semibold">{profile.is_private ? <Lock className="h-4 w-4 text-brand" /> : <Unlock className="h-4 w-4 text-brand" />}{profile.is_private ? "Private account" : "Public account"}</span><span className="text-xs text-muted-foreground">{profile.is_private ? "Only friends see your shortlist" : "Anyone signed in can see your shortlist"}</span></button><button onClick={() => { play("toggle"); toggleTheme(); }} className="flex w-full items-center justify-between gap-3 rounded-xl border border-border/60 bg-surface-2 p-4 text-left text-sm font-semibold transition hover:border-brand/50">Theme<span className="text-xs text-muted-foreground">{theme === "dark" ? "Dark" : "Light"}</span></button><button onClick={() => { if (muted) play("pop"); toggleMuted(); }} className="flex w-full items-center justify-between gap-3 rounded-xl border border-border/60 bg-surface-2 p-4 text-left text-sm font-semibold transition hover:border-brand/50">Interaction sounds<span className="text-xs text-muted-foreground">{muted ? "Muted" : "On"}</span></button></div></section>
          </>
        )}
      </div>
    </div>
  );
}

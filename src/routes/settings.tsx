import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TopNav } from "@/components/TopNav";
import { useAuth } from "@/hooks/use-auth";
import { useMyProfile, useUpdateProfile } from "@/lib/social";
import { AVATARS } from "@/lib/avatars";
import { MAJORS } from "@/lib/majors";
import { useTheme } from "@/hooks/use-theme";
import { useSound } from "@/hooks/use-sound";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Courseflix UTM" },
      { name: "description", content: "Set your username, pick a campus avatar, choose your program and control who can see your UTM course shortlist." },
      { property: "og:title", content: "Settings — Courseflix UTM" },
      { property: "og:description", content: "Manage your Courseflix profile, avatar and privacy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { signedIn } = useAuth();
  const { data: profile } = useMyProfile();
  const update = useUpdateProfile();
  const { theme, toggleTheme } = useTheme();
  const { muted, toggleMuted } = useSound();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarId, setAvatarId] = useState("hmalc");
  const [isPrivate, setIsPrivate] = useState(false);
  const [majorId, setMajorId] = useState("");

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? "");
    setUsername(profile.username ?? "");
    setAvatarId(profile.avatar_id ?? "hmalc");
    setIsPrivate(profile.is_private);
    setMajorId(profile.major_id ?? "");
  }, [profile]);

  async function save() {
    try {
      await update.mutateAsync({
        display_name: displayName.trim() || "UTM student",
        username,
        avatar_id: avatarId,
        is_private: isPrivate,
        major_id: majorId || null,
      });
      toast.success("Profile saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save profile");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-10 md:px-10">
        <h1 className="font-display text-4xl font-black md:text-6xl">Settings</h1>

        <section className="mt-8 rounded-2xl border border-border/50 bg-surface p-6">
          <h2 className="font-display text-2xl">Appearance</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={toggleTheme} className="rounded-full border border-border/60 bg-surface-2 px-5 py-2.5 text-sm font-semibold transition hover:border-brand/50">
              Theme: {theme === "dark" ? "Dark" : "Light"}
            </button>
            <button onClick={toggleMuted} className="rounded-full border border-border/60 bg-surface-2 px-5 py-2.5 text-sm font-semibold transition hover:border-brand/50">
              Sound effects: {muted ? "Off" : "On"}
            </button>
          </div>
        </section>

        <section id="account" className="mt-6 rounded-2xl border border-border/50 bg-surface p-6">
          <h2 className="font-display text-2xl">Account</h2>
          {!signedIn ? (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground">Sign in to set a username, avatar and privacy.</p>
              <Link to="/auth" search={{ redirect: "/settings" }} className="mt-4 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow">
                Sign in
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-5">
              <label className="block">
                <span className="text-sm font-semibold">Display name</span>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={60}
                  className="mt-1.5 w-full rounded-xl border border-border/60 bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-brand"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Username</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="utm_student"
                  maxLength={20}
                  className="mt-1.5 w-full rounded-xl border border-border/60 bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-brand"
                />
                <span className="mt-1 block text-xs text-muted-foreground">3–20 characters: letters, numbers, underscores. Friends search you by this.</span>
              </label>

              <div>
                <span className="text-sm font-semibold">Avatar</span>
                <div className="mt-2 flex flex-wrap gap-3">
                  {AVATARS.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setAvatarId(a.id)}
                      title={a.label}
                      aria-label={a.label}
                      className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition ${avatarId === a.id ? "border-brand" : "border-transparent opacity-70 hover:opacity-100"}`}
                    >
                      <img src={a.src} alt={a.label} width={512} height={512} loading="lazy" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="text-sm font-semibold">Program</span>
                <select
                  value={majorId}
                  onChange={(e) => setMajorId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border/60 bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-brand"
                >
                  <option value="">Not set</option>
                  {MAJORS.map((m) => (
                    <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>
                  ))}
                </select>
              </label>

              <div className="rounded-xl border border-border/50 bg-surface-2 p-4">
                <span className="text-sm font-semibold">Privacy</span>
                <div className="mt-2 flex gap-2">
                  {[
                    { v: false, label: "Public", hint: "Anyone signed in can see your shortlist" },
                    { v: true, label: "Private", hint: "Only accepted friends can see your shortlist" },
                  ].map((o) => (
                    <button
                      key={o.label}
                      onClick={() => setIsPrivate(o.v)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-left text-sm transition ${isPrivate === o.v ? "border-brand bg-brand/10" : "border-border/60 hover:border-brand/40"}`}
                    >
                      <span className="font-semibold">{o.label}</span>
                      <span className="block text-xs text-muted-foreground">{o.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => void save()}
                disabled={update.isPending}
                className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow disabled:opacity-60"
              >
                {update.isPending ? "Saving…" : "Save changes"}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Lock, LogOut, Moon, Palette, ShieldCheck, Sun, User, Volume2 } from "lucide-react";
import { SwitchTrack } from "@/components/ui/switch";
import { TopNav } from "@/components/TopNav";
import { PageBackdrop } from "@/components/PageBackdrop";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useSound } from "@/hooks/use-sound";
import { AVATARS, useProfile, useUpdateProfile } from "@/lib/profile";
import { MAJORS } from "@/lib/majors";
import { useMajor } from "@/hooks/use-major";
import { announce } from "@/lib/a11y";
import { deleteAccount } from "@/lib/delete-account";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Account & settings — Courseflix UTM" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { signedIn, user } = useAuth();
  const { data: profile, isLoading, error: profileError, refetch } = useProfile(user?.id);
  const update = useUpdateProfile();
  const { theme, toggleTheme } = useTheme();
  const { muted, toggleMuted, play } = useSound();
  const { setMajor } = useMajor();
  const initializedUserId = useRef<string | null>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [deleting, setDeleting] = useState(false);

  const active = useActiveSection(signedIn && !isLoading && Boolean(profile));
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [majorId, setMajorId] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    if (signedIn && !isLoading && !profileError && profile) announce("Account settings loaded.");
  }, [isLoading, profile, profileError, signedIn]);

  useEffect(() => {
    if (!user?.id || !profile || initializedUserId.current === user.id) return;

    const fallbackDisplay = user.user_metadata?.display_name ?? "UTM student";
    setDisplayName(profile.display_name ?? fallbackDisplay);
    setUsername(profile.username ?? "");
    setMajorId(profile.major_id ?? "");
    setYear(profile.year ? String(profile.year) : "");
    initializedUserId.current = user.id;
  }, [profile, user]);

  // A newly typed name is local draft state. Updating an avatar or privacy must
  // not rehydrate that draft from the older server snapshot.
  function markDraft<T>(setter: React.Dispatch<React.SetStateAction<T>>) {
    return (value: React.SetStateAction<T>) => setter(value);
  }

  async function save() {
    const handle = username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_.]/g, "");
    if (handle && handle.length < 3) {
      toast.error("Usernames need at least 3 characters.");
      return;
    }

    try {
      await update.mutateAsync({
        display_name: displayName.trim() || "UTM student",
        username: handle || null,
        major_id: majorId || null,
        year: year ? Number(year) : null,
      });
      setMajor(majorId || null);
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
      toast.error(
        profileError instanceof Error ? profileError.message : "Your profile is still loading.",
      );
      return;
    }

    try {
      await update.mutateAsync({ is_private: !profile.is_private });
      play("toggle");
      toast.success(
        profile.is_private ? "Your shortlist is public now" : "Your shortlist is private now",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update privacy");
    }
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/", replace: true });
  }

  async function removeAccount() {
    const typed = window.prompt(
      "This permanently deletes your account, reviews, shortlist and friends. Type DELETE to confirm.",
    );
    if (typed !== "DELETE") return;
    setDeleting(true);
    try {
      const result = await deleteAccount();
      if (result.error) throw new Error(result.error);
      await supabase.auth.signOut();
      toast.success("Your account was deleted.");
      void navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete your account");
      setDeleting(false);
    }
  }

  const field =
    "mt-1 h-10 w-full rounded-xl border border-border/60 bg-surface-2/70 px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25";

  return (
    <div className="relative min-h-screen overflow-x-clip text-foreground">
      <PageBackdrop />
      <TopNav />
      <div className="mx-auto max-w-5xl px-6 pb-24 pt-10 md:px-10">
        <h1 className="font-mega text-[clamp(2.6rem,7vw,5.5rem)] font-black leading-[0.92] tracking-[-0.05em] animate-fade-in-up">
          Settings
          <span className="font-serif-accent text-gradient-brand pr-[0.05em] text-[1.12em] font-normal">
            .
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your profile, how Courseflix looks and sounds, and who can see your shortlist.
        </p>

        {!signedIn && (
          <div className="mt-8 rounded-3xl glass p-6">
            <h2 className="font-display text-2xl">Sign in to manage your account</h2>
            <Link
              to="/auth"
              search={{ redirect: "/settings" }}
              className="mt-4 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Sign in
            </Link>
          </div>
        )}

        {signedIn && profileError && (
          <div className="mt-8">
            <QueryErrorState
              message="Could not load your profile."
              onRetry={() => void refetch()}
            />
          </div>
        )}

        {signedIn && isLoading && (
          <div className="mt-8 space-y-4">
            <div className="h-32 animate-pulse rounded-2xl bg-primary/10" />
            <div className="h-32 animate-pulse rounded-2xl bg-primary/10" />
            <div className="h-32 animate-pulse rounded-2xl bg-primary/10" />
          </div>
        )}

        {signedIn && !isLoading && profile && (
          <div className="mt-8 lg:grid lg:grid-cols-[200px_1fr] lg:items-start lg:gap-10">
            <nav
              aria-label="Settings sections"
              className="sticky top-20 z-10 -mx-6 mb-6 flex gap-1 overflow-x-auto px-6 pb-1 [scrollbar-width:none] lg:top-24 lg:mx-0 lg:mb-0 lg:flex-col lg:overflow-visible lg:px-0"
            >
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  aria-current={active === id ? "true" : undefined}
                  className={`inline-flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2 text-sm font-semibold transition lg:rounded-xl ${
                    active === id
                      ? "bg-brand text-primary-foreground"
                      : "glass text-muted-foreground hover:text-foreground lg:border-transparent lg:bg-transparent lg:shadow-none"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </a>
              ))}
            </nav>

            <div className="space-y-6">
              <section id="profile" className="scroll-mt-28 rounded-3xl glass p-6">
                <SectionHeading
                  title="Profile"
                  hint="How you show up to friends and on your shared shortlist."
                />
                <div className="mt-5 flex items-center gap-4">
                  <img
                    src={AVATARS.find((a) => a.id === profile.avatar_id)?.src ?? AVATARS[0]?.src}
                    alt=""
                    width={512}
                    height={512}
                    className="h-16 w-16 rounded-full bg-surface-2 object-contain ring-2 ring-brand/40"
                  />
                  <div className="min-w-0">
                    <div className="truncate font-semibold">
                      {displayName || "UTM student"}
                      {profile.is_verified && <VerifiedBadge className="ml-1 h-4 w-4" />}
                    </div>
                    <div className="truncate text-sm text-muted-foreground">
                      {username ? `@${username}` : "No username yet"}
                    </div>
                  </div>
                </div>

                <h3 className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Avatar
                </h3>
                <div className="mt-3 grid grid-cols-6 gap-2 sm:gap-3">
                  {AVATARS.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => void pickAvatar(a.id)}
                      aria-label={a.label}
                      aria-pressed={profile.avatar_id === a.id}
                      disabled={update.isPending}
                      className={`relative aspect-square rounded-xl border p-1.5 transition disabled:opacity-60 sm:p-2 ${profile.avatar_id === a.id ? "border-brand bg-brand/10" : "border-border/60 bg-surface-2 hover:border-brand/50"}`}
                    >
                      <img
                        src={a.src}
                        alt=""
                        loading="lazy"
                        width={512}
                        height={512}
                        className="h-full w-full object-contain"
                      />
                      {profile.avatar_id === a.id && (
                        <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-brand text-primary-foreground">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="text-muted-foreground">Display name</span>
                    <input
                      value={displayName}
                      onChange={(e) => markDraft(setDisplayName)(e.target.value)}
                      maxLength={40}
                      className={field}
                    />
                  </label>
                  <label className="text-sm">
                    <span className="text-muted-foreground">Username</span>
                    <input
                      value={username}
                      onChange={(e) => markDraft(setUsername)(e.target.value.toLowerCase())}
                      placeholder="utm_goose"
                      maxLength={24}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className={field}
                    />
                  </label>
                  <label className="text-sm">
                    <span className="text-muted-foreground">Program</span>
                    <select
                      value={majorId}
                      onChange={(e) => markDraft(setMajorId)(e.target.value)}
                      className={field}
                    >
                      <option value="">Not set</option>
                      {MAJORS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm">
                    <span className="text-muted-foreground">Year of study</span>
                    <select
                      value={year}
                      onChange={(e) => markDraft(setYear)(e.target.value)}
                      className={field}
                    >
                      <option value="">Not set</option>
                      {[1, 2, 3, 4, 5].map((y) => (
                        <option key={y} value={y}>
                          Year {y}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <button
                  onClick={() => void save()}
                  disabled={update.isPending}
                  className="mt-5 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow disabled:opacity-60"
                >
                  {update.isPending ? "Saving…" : "Save profile"}
                </button>
              </section>

              <section id="appearance" className="scroll-mt-28 rounded-3xl glass p-6">
                <SectionHeading
                  title="Appearance"
                  hint="Pick the theme that's easier on your eyes."
                />
                <div role="radiogroup" aria-label="Theme" className="mt-5 grid grid-cols-2 gap-3">
                  {(
                    [
                      { id: "dark", label: "Dark", icon: Moon },
                      { id: "light", label: "Light", icon: Sun },
                    ] as const
                  ).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      role="radio"
                      aria-checked={theme === id}
                      onClick={() => {
                        if (theme === id) return;
                        play("toggle");
                        toggleTheme();
                      }}
                      className={`flex items-center gap-3 rounded-2xl border p-4 text-left text-sm font-semibold transition ${
                        theme === id
                          ? "border-brand bg-brand/10"
                          : "border-border/60 bg-surface-2 hover:border-brand/50"
                      }`}
                    >
                      <span
                        className={`grid h-10 w-10 place-items-center rounded-xl ${id === "dark" ? "bg-black text-white" : "bg-white text-black"}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1">{label}</span>
                      {theme === id && <Check className="h-4 w-4 text-brand" />}
                    </button>
                  ))}
                </div>
              </section>

              <section id="sound" className="scroll-mt-28 rounded-3xl glass p-6">
                <SectionHeading title="Sound" hint="Little clicks and pops when you interact." />
                <ToggleRow
                  className="mt-5"
                  label="Interaction sounds"
                  description={muted ? "Off" : "On: taps, saves and toggles make a sound"}
                  on={!muted}
                  onToggle={() => {
                    if (muted) play("pop");
                    toggleMuted();
                  }}
                />
              </section>

              <section id="privacy" className="scroll-mt-28 rounded-3xl glass p-6">
                <SectionHeading
                  title="Privacy"
                  hint="Control who can find you and see your shortlist."
                />
                <ToggleRow
                  className="mt-5"
                  label="Private account"
                  description={
                    profile.is_private
                      ? "Hidden from search and only friends see your shortlist. People can still add you by exact @username."
                      : "Signed-in students can find you and see your shortlist"
                  }
                  on={profile.is_private}
                  disabled={update.isPending}
                  onToggle={() => void togglePrivacy()}
                />
              </section>

              <section id="account" className="scroll-mt-28 rounded-3xl glass p-6">
                <SectionHeading title="Account" />
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-surface-2 p-4">
                  <div className="min-w-0 text-sm">
                    <div className="text-muted-foreground">Signed in as</div>
                    <div className="truncate font-semibold">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => void signOut()}
                    className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm font-semibold transition hover:border-brand/50"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
                <div className="mt-4 rounded-2xl border border-destructive/40 p-4">
                  <h3 className="text-sm font-semibold text-destructive">Delete account</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Permanently remove your account and everything tied to it. This cannot be
                    undone.
                  </p>
                  <button
                    onClick={() => void removeAccount()}
                    disabled={deleting}
                    className="mt-4 inline-flex rounded-full border border-destructive/60 px-5 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-60"
                  >
                    {deleting ? "Deleting…" : "Delete my account"}
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "sound", label: "Sound", icon: Volume2 },
  { id: "privacy", label: "Privacy", icon: ShieldCheck },
  { id: "account", label: "Account", icon: Lock },
] as const;

/** The section nearest the top of the viewport, for highlighting the side nav. */
function useActiveSection(ready: boolean) {
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  useEffect(() => {
    if (!ready) return;
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => !!el,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActive(visible[0]!.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ready]);
  return active;
}

function SectionHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div>
      <h2 className="font-display text-2xl">{title}</h2>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  on,
  onToggle,
  disabled,
  className = "",
}: {
  label: string;
  description: string;
  on: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onToggle}
      className={`flex w-full items-center justify-between gap-4 rounded-2xl border border-border/60 bg-surface-2 p-4 text-left transition hover:border-brand/50 disabled:opacity-60 ${className}`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
      <SwitchTrack on={on} />
    </button>
  );
}

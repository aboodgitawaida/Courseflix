import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Award,
  Bookmark,
  ChevronRight,
  LifeBuoy,
  LogOut,
  Moon,
  Settings,
  User,
  Users,
  Volume2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useSound } from "@/hooks/use-sound";
import { avatarSrc, useProfile } from "@/lib/profile";
import { useShortlist } from "@/lib/ratings";
import { useAchievements } from "@/lib/achievements";
import { SwitchTrack } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const groupLabel =
  "px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground";

export function ProfileMenu() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { theme, toggleTheme } = useTheme();
  const { muted, toggleMuted, play } = useSound();
  const [open, setOpen] = useState(false);
  const { data: saved = [] } = useShortlist();
  // Only fetched while the menu is open.
  const { achievements } = useAchievements(open);
  const unlocked = achievements.filter((a) => a.unlocked).length;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const name =
    profile?.display_name ??
    user?.user_metadata?.display_name ??
    user?.email?.split("@")[0] ??
    "Account";
  const handle = profile?.username ? `@${profile.username}` : (user?.email ?? "");

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-border/60 bg-surface-2 pl-1 pr-3 transition hover:border-brand/50"
        aria-label="Account menu"
      >
        <img
          src={avatarSrc(profile?.avatar_id)}
          alt=""
          width={32}
          height={32}
          className="h-7 w-7 rounded-full bg-surface object-contain"
        />
        <span className="hidden max-w-[110px] truncate text-xs font-semibold sm:inline">
          {name}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-1.5">
        <DropdownMenuLabel className="p-0">
          <Link
            to="/settings"
            hash="profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg p-2 font-normal transition hover:bg-white/[0.06]"
          >
            <img
              src={avatarSrc(profile?.avatar_id)}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-full bg-surface-2 object-contain ring-2 ring-brand/40"
            />
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-sm font-semibold">{name}</span>
              <span className="block truncate text-xs text-muted-foreground">{handle}</span>
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <div className="mt-1 grid grid-cols-2 gap-1.5 px-2 pb-1 font-normal">
            <Link
              to="/list"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-border/60 bg-surface-2/60 px-3 py-2 transition hover:border-brand/50"
            >
              <span className="block font-mega text-lg font-bold leading-none">{saved.length}</span>
              <span className="text-[11px] text-muted-foreground">shortlisted</span>
            </Link>
            <Link
              to="/achievements"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-border/60 bg-surface-2/60 px-3 py-2 transition hover:border-brand/50"
            >
              <span className="block font-mega text-lg font-bold leading-none">
                {unlocked}
                <span className="text-muted-foreground">/{achievements.length}</span>
              </span>
              <span className="text-[11px] text-muted-foreground">achievements</span>
            </Link>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className={groupLabel}>You</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link to="/settings" hash="profile">
              <User className="mr-2 h-4 w-4" /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/list">
              <Bookmark className="mr-2 h-4 w-4" /> My shortlist
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/friends">
              <Users className="mr-2 h-4 w-4" /> Friends
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/achievements">
              <Award className="mr-2 h-4 w-4" /> Achievements
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className={groupLabel}>Preferences</DropdownMenuLabel>
          <DropdownMenuItem
            role="menuitemcheckbox"
            aria-checked={theme === "dark"}
            onSelect={(e) => {
              e.preventDefault();
              play("toggle");
              toggleTheme();
            }}
          >
            <Moon className="mr-2 h-4 w-4" />
            <span className="flex-1">Dark mode</span>
            <SwitchTrack on={theme === "dark"} />
          </DropdownMenuItem>
          <DropdownMenuItem
            role="menuitemcheckbox"
            aria-checked={!muted}
            onSelect={(e) => {
              e.preventDefault();
              if (muted) play("pop");
              toggleMuted();
            }}
          >
            <Volume2 className="mr-2 h-4 w-4" />
            <span className="flex-1">Interaction sounds</span>
            <SwitchTrack on={!muted} />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span className="flex-1">All settings</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/help">
            <LifeBuoy className="mr-2 h-4 w-4" /> Help centre
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => void signOut()}
          className="text-red-400 focus:text-red-300"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

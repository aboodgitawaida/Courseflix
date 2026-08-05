import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Moon, Settings, Sun, User, Users, Volume2, VolumeX, LifeBuoy } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useMyProfile } from "@/lib/social";
import { getAvatar } from "@/lib/avatars";
import { useTheme } from "@/hooks/use-theme";
import { useSound } from "@/hooks/use-sound";

export function ProfileMenu() {
  const { user } = useAuth();
  const { data: profile } = useMyProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { theme, toggleTheme } = useTheme();
  const { muted, toggleMuted, play } = useSound();

  const avatar = getAvatar(profile?.avatar_id);
  const label =
    profile?.username ??
    profile?.display_name ??
    (user?.user_metadata?.["display_name"] as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Account";

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-md border border-white/15 transition hover:border-brand/60"
      >
        <img src={avatar.src} alt="" width={512} height={512} loading="lazy" className="h-full w-full object-cover" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="truncate">
          <span className="block text-xs font-normal text-muted-foreground">Signed in as</span>
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" hash="account"><User className="mr-2 h-4 w-4" /> Account</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/friends"><Users className="mr-2 h-4 w-4" /> Friends</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/help"><LifeBuoy className="mr-2 h-4 w-4" /> Help Centre</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            toggleTheme();
            play("toggle");
          }}
        >
          {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            toggleMuted();
          }}
        >
          {muted ? <VolumeX className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />}
          {muted ? "Unmute sounds" : "Mute sounds"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

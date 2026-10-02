import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Award, LifeBuoy, LogOut, Moon, Settings, Sun, User, Users, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useSound } from "@/hooks/use-sound";
import { avatarSrc, useProfile } from "@/lib/profile";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function ProfileMenu() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { theme, toggleTheme } = useTheme();
  const { muted, toggleMuted, play } = useSound();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const name = profile?.display_name ?? user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "Account";
  const handle = profile?.username ? `@${profile.username}` : user?.email ?? "";

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return <DropdownMenu>
    <DropdownMenuTrigger className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-border/60 bg-surface-2 pl-1 pr-3 transition hover:border-brand/50" aria-label="Account menu">
      <img src={avatarSrc(profile?.avatar_id)} alt="" width={32} height={32} className="h-7 w-7 rounded-full bg-surface object-contain" />
      <span className="hidden max-w-[110px] truncate text-xs font-semibold sm:inline">{name}</span>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-60">
      <DropdownMenuLabel className="leading-tight"><div className="truncate text-sm">{name}</div><div className="truncate text-xs font-normal text-muted-foreground">{handle}</div></DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild><Link to="/settings"><User className="mr-2 h-4 w-4" /> Account</Link></DropdownMenuItem>
      <DropdownMenuItem asChild><Link to="/friends"><Users className="mr-2 h-4 w-4" /> Friends</Link></DropdownMenuItem>
      <DropdownMenuItem asChild><Link to="/achievements"><Award className="mr-2 h-4 w-4" /> Achievements</Link></DropdownMenuItem>
      <DropdownMenuItem asChild><Link to="/settings" hash="preferences"><Settings className="mr-2 h-4 w-4" /> Settings</Link></DropdownMenuItem>
      <DropdownMenuItem asChild><Link to="/help"><LifeBuoy className="mr-2 h-4 w-4" /> Help centre</Link></DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); play("toggle"); toggleTheme(); }}>{theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}{theme === "dark" ? "Light mode" : "Dark mode"}</DropdownMenuItem>
      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); if (muted) play("pop"); toggleMuted(); }}>{muted ? <VolumeX className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />}{muted ? "Sound off" : "Sound on"}</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={() => void signOut()}><LogOut className="mr-2 h-4 w-4" /> Sign out</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}

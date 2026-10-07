import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { avatarSrc } from "@/lib/profile";
import { useClearNotifications, useMarkNotificationsRead, useNotifications } from "@/lib/social";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { announce } from "@/lib/a11y";
import { achievementDefinition } from "@/lib/achievements";

function line(kind: string, name: string, code: string | null) {
  if (kind === "friend_request") return `${name} sent you a friend request`;
  if (kind === "friend_accepted") return `${name} accepted your friend request`;
  if (kind === "shortlist_add") return `${name} added ${code ?? "a course"} to their shortlist`;
  if (kind === "achievement_unlocked") {
    return `You unlocked ${achievementDefinition(code ?? "")?.name ?? "an achievement"}`;
  }
  return `${name} did something on Courseflix`;
}

function relativeMinutes(createdAt: string, now: number) {
  const minutes = Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 60_000));
  if (minutes < 1) return "just now";
  return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
}

export function NotificationBell() {
  const [now, setNow] = useState(() => Date.now());
  const { data, isLoading, error, refetch } = useNotifications();
  const markRead = useMarkNotificationsRead();
  const clearNotifications = useClearNotifications();
  const rows = data?.rows ?? [];
  const people = data?.people;
  const unread = rows.filter((r) => !r.read).length;
  useEffect(() => {
    if (!isLoading && !error)
      announce(`${rows.length} notification${rows.length === 1 ? "" : "s"} loaded.`);
  }, [error, isLoading, rows.length]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open && unread > 0) void markRead.mutateAsync();
      }}
    >
      <DropdownMenuTrigger
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full transition hover:bg-foreground/10"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2">
          <DropdownMenuLabel className="px-0">Activity</DropdownMenuLabel>
          {rows.length > 0 && (
            <button
              type="button"
              disabled={clearNotifications.isPending}
              onClick={() => void clearNotifications.mutateAsync()}
              className="text-[11px] font-semibold text-muted-foreground transition hover:text-brand disabled:opacity-60"
            >
              {clearNotifications.isPending ? "Clearing…" : "Clear notifications"}
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {isLoading && (
          <div className="space-y-2 px-2 py-4">
            <div className="h-10 animate-pulse rounded-xl bg-primary/10" />
            <div className="h-10 animate-pulse rounded-xl bg-primary/10" />
          </div>
        )}
        {error && (
          <div className="space-y-2 px-2 py-6 text-center text-xs text-destructive">
            <div>{error instanceof Error ? error.message : "Could not load activity."}</div>
            <button
              onClick={() => void refetch()}
              className="rounded-full border border-brand/40 px-3 py-1 text-brand"
            >
              Retry
            </button>
          </div>
        )}
        {!isLoading && !error && rows.length === 0 && (
          <div className="px-2 py-6 text-center text-xs text-muted-foreground">
            <p>Nothing yet. Add friends or unlock an achievement.</p>
            <Link
              to="/friends"
              className="mt-2 inline-block font-semibold text-brand underline underline-offset-4"
            >
              Find friends
            </Link>
          </div>
        )}
        {!error &&
          rows.slice(0, 12).map((r) => {
            const person = r.actor_id ? people?.get(r.actor_id) : undefined;
            const name = person?.display_name ?? "A student";
            const achievement =
              r.kind === "achievement_unlocked"
                ? achievementDefinition(r.course_code ?? "")
                : undefined;
            const destination =
              r.kind === "achievement_unlocked"
                ? "/achievements"
                : r.kind === "shortlist_add" && r.course_code
                  ? "/course/$code"
                  : "/friends";
            const params =
              r.kind === "shortlist_add" && r.course_code ? { code: r.course_code } : {};
            return (
              <DropdownMenuItem key={r.id} asChild>
                <Link to={destination} params={params} className="flex items-start gap-2">
                  <img
                    src={achievement?.icon ?? avatarSrc(person?.avatar_id)}
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 shrink-0 rounded-full object-contain"
                  />
                  <span className="min-w-0 flex-1 text-xs leading-snug">
                    {line(r.kind, name, r.course_code)}
                    {!r.read && (
                      <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-brand align-middle" />
                    )}
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">
                      {relativeMinutes(r.created_at, now)}
                    </span>
                  </span>
                </Link>
              </DropdownMenuItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

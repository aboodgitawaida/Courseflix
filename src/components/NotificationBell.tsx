import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Bell } from "lucide-react";
import { avatarSrc } from "@/lib/profile";
import { useMarkNotificationsRead, useNotifications } from "@/lib/social";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { announce } from "@/lib/a11y";

function line(kind: string, name: string, code: string | null) {
  if (kind === "friend_request") return `${name} sent you a friend request`;
  if (kind === "friend_accepted") return `${name} accepted your friend request`;
  if (kind === "shortlist_add") return `${name} added ${code ?? "a course"} to their shortlist`;
  return `${name} did something on Courseflix`;
}

export function NotificationBell() {
  const { data, isLoading, error, refetch } = useNotifications();
  const markRead = useMarkNotificationsRead();
  const rows = data?.rows ?? [];
  const people = data?.people;
  const unread = rows.filter((r) => !r.read).length;
  useEffect(() => {
    if (!isLoading && !error) announce(`${rows.length} notification${rows.length === 1 ? "" : "s"} loaded.`);
  }, [error, isLoading, rows.length]);
  return <DropdownMenu onOpenChange={(open) => { if (open && unread > 0) void markRead.mutateAsync(); }}>
    <DropdownMenuTrigger aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"} className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full transition hover:bg-foreground/10"><Bell className="h-4 w-4" />{unread > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-primary-foreground">{unread > 9 ? "9+" : unread}</span>}</DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-80"><DropdownMenuLabel>Activity</DropdownMenuLabel><DropdownMenuSeparator />
      {isLoading && (
        <div className="space-y-2 px-2 py-4">
          <div className="h-10 animate-pulse rounded-xl bg-primary/10" />
          <div className="h-10 animate-pulse rounded-xl bg-primary/10" />
        </div>
      )}
      {error && <div className="space-y-2 px-2 py-6 text-center text-xs text-destructive"><div>{error instanceof Error ? error.message : "Could not load activity."}</div><button onClick={() => void refetch()} className="rounded-full border border-brand/40 px-3 py-1 text-brand">Retry</button></div>}
      {!isLoading && !error && rows.length === 0 && <div className="px-2 py-6 text-center text-xs text-muted-foreground"><p>Nothing yet. Add friends to see their picks.</p><Link to="/friends" className="mt-2 inline-block font-semibold text-brand underline underline-offset-4">Find friends</Link></div>}
      {!error && rows.slice(0, 12).map((r) => { const person = r.actor_id ? people?.get(r.actor_id) : undefined; const name = person?.display_name ?? "A student"; return <DropdownMenuItem key={r.id} asChild><Link to={r.kind === "shortlist_add" && r.course_code ? "/course/$code" : "/friends"} params={r.kind === "shortlist_add" && r.course_code ? { code: r.course_code } : {}} className="flex items-start gap-2"><img src={avatarSrc(person?.avatar_id)} alt="" width={28} height={28} className="h-7 w-7 shrink-0 rounded-full object-contain" /><span className="text-xs leading-snug">{line(r.kind, name, r.course_code)}{!r.read && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-brand align-middle" />}</span></Link></DropdownMenuItem>; })}
    </DropdownMenuContent>
  </DropdownMenu>;
}

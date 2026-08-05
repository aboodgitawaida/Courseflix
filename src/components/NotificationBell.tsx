import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSeenAt, markNotificationsSeen, useNotifications } from "@/lib/social";

export function NotificationBell() {
  const { data: notifications = [] } = useNotifications();
  const [seenAt, setSeenAt] = useState(0);

  useEffect(() => {
    setSeenAt(getSeenAt());
  }, []);

  const unread = notifications.filter((n) => new Date(n.at).getTime() > seenAt).length;

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) return;
        markNotificationsSeen();
        setSeenAt(Date.now());
      }}
    >
      <DropdownMenuTrigger
        aria-label={unread ? `${unread} new notifications` : "Notifications"}
        className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full transition hover:bg-white/10"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            Nothing yet. Add friends to see their picks.
          </p>
        )}
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((n) => (
            <div key={n.id} className="border-b border-border/40 px-2 py-2.5 last:border-0">
              <p className="text-sm font-semibold">{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.body}</p>
            </div>
          ))}
        </div>
        <DropdownMenuSeparator />
        <Link to="/friends" className="block px-2 py-2 text-sm font-semibold text-brand hover:underline">
          Manage friends →
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

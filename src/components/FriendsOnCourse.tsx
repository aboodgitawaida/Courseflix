import { Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { avatarSrc } from "@/lib/profile";
import { useFriendsOnCourse } from "@/lib/friend-courses";

export function FriendsOnCourse({ code }: { code: string }) {
  const { friendIds, people } = useFriendsOnCourse(code);
  if (friendIds.length === 0) return null;
  const names = friendIds.map((id) => people?.get(id)?.display_name ?? "A friend");
  const summary =
    names.length === 1
      ? `${names[0]} shortlisted this`
      : names.length === 2
        ? `${names[0]} and ${names[1]} shortlisted this`
        : `${names[0]} and ${names.length - 1} other friends shortlisted this`;

  return (
    <div className="rounded-2xl glass p-4">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        <Users className="h-3.5 w-3.5" /> Friends
      </div>
      <div className="mt-3 flex -space-x-2">
        {friendIds.slice(0, 6).map((id) => {
          const p = people?.get(id);
          return (
            <Link
              key={id}
              to="/profile/$id"
              params={{ id }}
              title={p?.display_name ?? "Friend"}
              aria-label={`View ${p?.display_name ?? "friend"}'s profile`}
              className="rounded-full ring-2 ring-background transition hover:z-10 hover:scale-110"
            >
              <img
                src={avatarSrc(p?.avatar_id)}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-full bg-surface-2 object-contain"
              />
            </Link>
          );
        })}
      </div>
      <p className="mt-2 text-sm font-semibold">{summary}</p>
    </div>
  );
}

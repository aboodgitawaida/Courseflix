import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, Users, X, Check } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { useAuth } from "@/hooks/use-auth";
import { getAvatar } from "@/lib/avatars";
import {
  useFriendships,
  useRemoveFriend,
  useRespondToRequest,
  useSendFriendRequest,
  useUserSearch,
} from "@/lib/social";

export const Route = createFileRoute("/friends")({
  head: () => ({
    meta: [
      { title: "Friends — Courseflix UTM" },
      { name: "description", content: "Find UTM students by username, send friend requests and compare course shortlists before enrolment opens." },
      { property: "og:title", content: "Friends — Courseflix UTM" },
      { property: "og:description", content: "Add friends and compare UTM course shortlists." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FriendsPage,
});

function FriendsPage() {
  const { signedIn } = useAuth();
  const [q, setQ] = useState("");
  const { data: results = [] } = useUserSearch(q);
  const { data } = useFriendships();
  const send = useSendFriendRequest();
  const respond = useRespondToRequest();
  const remove = useRemoveFriend();

  const rows = data?.rows ?? [];
  const me = data?.me;
  const profiles = data?.profiles ?? {};
  const incoming = rows.filter((r) => r.status === "pending" && r.addressee_id === me);
  const outgoing = rows.filter((r) => r.status === "pending" && r.requester_id === me);
  const friends = rows.filter((r) => r.status === "accepted");

  const other = (r: { requester_id: string; addressee_id: string }) =>
    profiles[r.requester_id === me ? r.addressee_id : r.requester_id];

  async function run(p: Promise<unknown>, ok: string) {
    try {
      await p;
      toast.success(ok);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-10 md:px-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          <Users className="h-3 w-3" /> FRIENDS
        </div>
        <h1 className="font-display mt-3 text-4xl font-black md:text-6xl">Compare shortlists</h1>

        {!signedIn ? (
          <div className="mt-8 rounded-2xl border border-border/50 bg-surface p-6">
            <p className="text-sm text-muted-foreground">Sign in to find friends and share your list.</p>
            <Link to="/auth" search={{ redirect: "/friends" }} className="mt-4 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow">
              Sign in
            </Link>
          </div>
        ) : (
          <>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search students by username…"
              className="mt-8 w-full rounded-xl border border-border/60 bg-surface-2 px-4 py-3 text-sm outline-none focus:border-brand"
            />

            {results.length > 0 && (
              <div className="mt-3 space-y-2">
                {results
                  .filter((p) => p.id !== me)
                  .map((p) => (
                    <Row
                      key={p.id}
                      name={p.username ?? p.display_name}
                      sub={p.is_private ? "Private profile" : "Public profile"}
                      avatarId={p.avatar_id}
                      action={
                        <button
                          onClick={() => void run(send.mutateAsync(p.id), "Friend request sent")}
                          className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-brand-glow"
                        >
                          <UserPlus className="h-3.5 w-3.5" /> Add
                        </button>
                      }
                    />
                  ))}
              </div>
            )}

            <Section title={`Requests (${incoming.length})`}>
              {incoming.map((r) => (
                <Row
                  key={r.id}
                  name={other(r)?.username ?? other(r)?.display_name ?? "Student"}
                  sub="Wants to be friends"
                  avatarId={other(r)?.avatar_id}
                  action={
                    <div className="flex gap-1.5">
                      <button onClick={() => void run(respond.mutateAsync({ id: r.id, accept: true }), "Friend added")} aria-label="Accept" className="grid h-8 w-8 place-items-center rounded-full bg-brand text-primary-foreground">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => void run(respond.mutateAsync({ id: r.id, accept: false }), "Request declined")} aria-label="Decline" className="grid h-8 w-8 place-items-center rounded-full border border-border/60">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  }
                />
              ))}
            </Section>

            <Section title={`Friends (${friends.length})`}>
              {friends.map((r) => {
                const p = other(r);
                return (
                  <Row
                    key={r.id}
                    name={p?.username ?? p?.display_name ?? "Student"}
                    sub="Tap to view their shortlist"
                    avatarId={p?.avatar_id}
                    href={p?.username ? `/u/${p.username}` : undefined}
                    action={
                      <button onClick={() => void run(remove.mutateAsync(r.id), "Friend removed")} className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-semibold transition hover:border-brand/50">
                        Remove
                      </button>
                    }
                  />
                );
              })}
            </Section>

            {outgoing.length > 0 && (
              <Section title={`Sent (${outgoing.length})`}>
                {outgoing.map((r) => (
                  <Row
                    key={r.id}
                    name={other(r)?.username ?? other(r)?.display_name ?? "Student"}
                    sub="Pending"
                    avatarId={other(r)?.avatar_id}
                    action={
                      <button onClick={() => void run(remove.mutateAsync(r.id), "Request cancelled")} className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-semibold transition hover:border-brand/50">
                        Cancel
                      </button>
                    }
                  />
                ))}
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-3 space-y-2">
        {children ?? null}
        {Array.isArray(children) && children.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
        )}
      </div>
    </div>
  );
}

function Row({
  name,
  sub,
  avatarId,
  action,
  href,
}: {
  name: string;
  sub: string;
  avatarId?: string | undefined;
  action: React.ReactNode;
  href?: string | undefined;
}) {
  const avatar = getAvatar(avatarId);
  const inner = (
    <>
      <img src={avatar.src} alt="" width={512} height={512} loading="lazy" className="h-10 w-10 rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{sub}</p>
      </div>
    </>
  );
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-surface p-3">
      {href ? (
        <a href={href} className="flex min-w-0 flex-1 items-center gap-3">{inner}</a>
      ) : (
        inner
      )}
      {action}
    </div>
  );
}

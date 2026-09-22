import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Search, UserMinus, UserPlus, X } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { useAuth } from "@/hooks/use-auth";
import { avatarSrc } from "@/lib/profile";
import {
  useFriendShortlist,
  useFriendships,
  useProfileSearch,
  useRemoveFriend,
  useRespondToRequest,
  useSendFriendRequest,
} from "@/lib/social";
import { getCourse } from "@/lib/courses";
import { QueryErrorState } from "@/components/QueryErrorState";

export const Route = createFileRoute("/friends")({
  head: () => ({
    meta: [
      { title: "Friends — Courseflix UTM" },
      { name: "description", content: "Add UTM classmates on Courseflix, accept friend requests, and see which courses your friends have shortlisted." },
      { property: "og:title", content: "Friends — Courseflix UTM" },
      { property: "og:description", content: "See what your UTM friends are planning to take next term." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FriendsPage,
});

function FriendShortlist({ userId, name }: { userId: string; name: string }) {
  const { data: codes = [], isLoading, error } = useFriendShortlist(userId);
  if (isLoading) return <p className="text-xs text-muted-foreground">Loading shortlist…</p>;
  if (error) return <p className="text-xs text-muted-foreground">{name}'s shortlist is private.</p>;
  if (codes.length === 0) return <p className="text-xs text-muted-foreground">No saved courses yet.</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {codes.map((c) => (
        <Link
          key={c}
          to="/course/$code"
          params={{ code: c }}
          className="rounded-full border border-border/60 bg-surface-2 px-2.5 py-1 text-[11px] font-semibold transition hover:border-brand/60 hover:text-brand"
        >
          {c}
          {getCourse(c) ? "" : " (unlisted)"}
        </Link>
      ))}
    </div>
  );
}

function FriendsPage() {
  const { signedIn } = useAuth();
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const { data, isLoading, error: friendshipsError, refetch } = useFriendships();
  const { data: results = [], isFetching } = useProfileSearch(query);
  const send = useSendFriendRequest();
  const respond = useRespondToRequest();
  const remove = useRemoveFriend();

  const uid = data?.uid ?? null;
  const people = data?.people;
  const other = (r: { requester_id: string; addressee_id: string }) =>
    r.requester_id === uid ? r.addressee_id : r.requester_id;

  async function add(id: string) {
    try {
      await send.mutateAsync(id);
      toast.success("Friend request sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send request");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-10 md:px-10">
        <h1 className="font-display text-4xl font-black md:text-5xl">Friends</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Find classmates by username and compare what you're both planning to take.
        </p>

        {!signedIn && (
          <div className="mt-8 rounded-2xl border border-border/50 bg-surface p-6">
            <h2 className="font-display text-2xl">Sign in to add friends</h2>
            <Link
              to="/auth"
              search={{ redirect: "/friends" }}
              className="mt-4 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow"
            >
              Sign in
            </Link>
          </div>
        )}

        {signedIn && (
          <>
            <div className="mt-6 flex items-center gap-2 rounded-full border border-border/60 bg-surface-2 px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by username or name…"
                aria-label="Search students"
                className="h-11 flex-1 bg-transparent text-sm outline-none"
              />
            </div>

            {query.trim().length >= 2 && (
              <section className="mt-4 space-y-2">
                {isFetching && <p className="text-xs text-muted-foreground">Searching…</p>}
                {!isFetching && results.length === 0 && (
                  <p className="text-xs text-muted-foreground">No students matched that.</p>
                )}
                {results
                  .filter((p) => p.id !== uid)
                  .map((p) => (
                    <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-surface p-3">
                      <img src={avatarSrc(p.avatar_id)} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-contain" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{p.display_name}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {p.username ? `@${p.username}` : "no username yet"}
                        </div>
                      </div>
                      <button
                        onClick={() => void add(p.id)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-brand-glow"
                      >
                        <UserPlus className="h-3.5 w-3.5" /> Add
                      </button>
                    </div>
                  ))}
              </section>
            )}

            {(data?.incoming.length ?? 0) > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-2xl">Requests</h2>
                <div className="mt-3 space-y-2">
                  {data!.incoming.map((r) => {
                    const p = people?.get(r.requester_id);
                    return (
                      <div key={r.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-surface p-3">
                        <img src={avatarSrc(p?.avatar_id)} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-contain" />
                        <div className="min-w-0 flex-1 truncate text-sm font-semibold">
                          {p?.display_name ?? "A student"}
                        </div>
                        <button
                          disabled={respond.isPending}
                          onClick={() => respond.mutate({ id: r.id, accept: true })}
                          aria-label="Accept request"
                          className="grid h-8 w-8 place-items-center rounded-full bg-brand text-primary-foreground transition hover:bg-brand-glow disabled:cursor-wait disabled:opacity-60"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          disabled={respond.isPending}
                          onClick={() => respond.mutate({ id: r.id, accept: false })}
                          aria-label="Decline request"
                          className="grid h-8 w-8 place-items-center rounded-full border border-border/60 transition hover:border-brand/50 disabled:cursor-wait disabled:opacity-60"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="mt-8">
              <h2 className="font-display text-2xl">Your friends</h2>
              {friendshipsError && (
                <div className="mt-3">
                  <QueryErrorState
                    message="Could not load your friends."
                    onRetry={() => void refetch()}
                  />
                </div>
              )}
              {isLoading && <p className="mt-2 text-xs text-muted-foreground">Loading…</p>}
              {!isLoading && (data?.accepted.length ?? 0) === 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <p className="text-sm text-muted-foreground">No friends yet — find a classmate to get started.</p>
                  <button
                    type="button"
                    onClick={() => searchRef.current?.focus()}
                    className="text-xs font-semibold text-brand underline underline-offset-4"
                  >
                    Search students
                  </button>
                </div>
              )}
              <div className="mt-3 space-y-3">
                {data?.accepted.map((r) => {
                  const id = other(r);
                  const p = people?.get(id);
                  const name = p?.display_name ?? "A student";
                  return (
                    <div key={r.id} className="rounded-xl border border-border/50 bg-surface p-4">
                      <div className="flex items-center gap-3">
                        <img src={avatarSrc(p?.avatar_id)} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-contain" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">{name}</div>
                          <div className="truncate text-xs text-muted-foreground">{p?.username ? `@${p.username}` : ""}</div>
                        </div>
                        <button
                          disabled={remove.isPending}
                          onClick={() => remove.mutate(r.id)}
                          aria-label={`Remove ${name}`}
                          className="grid h-8 w-8 place-items-center rounded-full border border-border/60 transition hover:border-brand/50 disabled:cursor-wait disabled:opacity-60"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3">
                        <FriendShortlist userId={id} name={name} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {(data?.outgoing.length ?? 0) > 0 && (
              <p className="mt-6 text-xs text-muted-foreground">
                {data!.outgoing.length} request{data!.outgoing.length === 1 ? "" : "s"} still pending.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

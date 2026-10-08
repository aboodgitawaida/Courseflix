import { createFileRoute, Link } from "@tanstack/react-router";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Search, UserMinus, UserPlus, X } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { PageBackdrop } from "@/components/PageBackdrop";
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
import { announce } from "@/lib/a11y";

export const Route = createFileRoute("/friends")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Friends — Courseflix UTM" },
      {
        name: "description",
        content:
          "Add UTM classmates on Courseflix, accept friend requests, and see which courses your friends have shortlisted.",
      },
      { property: "og:title", content: "Friends — Courseflix UTM" },
      {
        property: "og:description",
        content: "See what your UTM friends are planning to take next term.",
      },
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
  if (codes.length === 0)
    return <p className="text-xs text-muted-foreground">No saved courses yet.</p>;
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

  useEffect(() => {
    if (signedIn && !isLoading && !friendshipsError) {
      announce(
        `${data?.accepted.length ?? 0} friend${data?.accepted.length === 1 ? "" : "s"} loaded.`,
      );
    }
  }, [data?.accepted.length, friendshipsError, isLoading, signedIn]);

  const uid = data?.uid ?? null;
  const people = data?.people;
  const other = (r: { requester_id: string; addressee_id: string }) =>
    r.requester_id === uid ? r.addressee_id : r.requester_id;
  const relationshipFor = (id: string) => {
    if (data?.accepted.some((row) => other(row) === id)) return "friends" as const;
    if (data?.outgoing.some((row) => row.addressee_id === id)) return "outgoing" as const;
    if (data?.incoming.some((row) => row.requester_id === id)) return "incoming" as const;
    return "none" as const;
  };

  async function add(id: string) {
    const relationship = relationshipFor(id);
    if (relationship === "friends") {
      toast.info("You are already friends with this student.");
      return;
    }
    if (relationship === "outgoing") {
      toast.info("Your friend request is still pending.");
      return;
    }
    if (relationship === "incoming") {
      toast.info("This student already sent you a request. Respond under Requests.");
      return;
    }
    try {
      await send.mutateAsync(id);
      toast.success("Friend request sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send request");
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-clip text-foreground">
      <PageBackdrop />
      <TopNav />
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-10 md:px-10">
        <h1 className="font-mega text-[clamp(2.6rem,7vw,5.5rem)] font-black leading-[0.92] tracking-[-0.05em] animate-fade-in-up">
          Your{" "}
          <span className="font-serif-accent text-gradient-brand pr-[0.05em] text-[1.12em] font-normal">
            people.
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Find classmates by username and compare what you're both planning to take.
        </p>

        {!signedIn && (
          <div className="mt-8 rounded-3xl glass p-6">
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
                {isFetching && (
                  <div className="space-y-2">
                    <div className="h-12 animate-pulse rounded-xl bg-primary/10" />
                    <div className="h-12 animate-pulse rounded-xl bg-primary/10" />
                  </div>
                )}
                {!isFetching && results.length === 0 && (
                  <p className="text-xs text-muted-foreground">No students matched that.</p>
                )}
                {results
                  .filter((p) => p.id !== uid)
                  .map((p) =>
                    (() => {
                      const relationship = relationshipFor(p.id);
                      const disabled = relationship !== "none";
                      const label =
                        relationship === "friends"
                          ? "Friends"
                          : relationship === "outgoing"
                            ? "Request pending"
                            : relationship === "incoming"
                              ? "Respond in Requests"
                              : "Add";
                      return (
                        <div key={p.id} className="flex items-center gap-3 rounded-xl glass p-3">
                          <img
                            src={avatarSrc(p.avatar_id)}
                            alt=""
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-contain"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold">
                              {p.display_name}
                              {p.is_verified && <VerifiedBadge className="ml-1 h-4 w-4" />}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {p.username ? `@${p.username}` : "no username yet"}
                            </div>
                          </div>
                          <button
                            onClick={() => void add(p.id)}
                            disabled={disabled}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              disabled
                                ? "cursor-default border border-border/60 text-muted-foreground"
                                : "bg-brand text-primary-foreground hover:bg-brand-glow"
                            }`}
                          >
                            {relationship === "none" && <UserPlus className="h-3.5 w-3.5" />}{" "}
                            {label}
                          </button>
                        </div>
                      );
                    })(),
                  )}
              </section>
            )}

            {(data?.incoming.length ?? 0) > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-2xl">Requests</h2>
                <div className="mt-3 space-y-2">
                  {data!.incoming.map((r) => {
                    const p = people?.get(r.requester_id);
                    return (
                      <div key={r.id} className="flex items-center gap-3 rounded-xl glass p-3">
                        <img
                          src={avatarSrc(p?.avatar_id)}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-contain"
                        />
                        <div className="min-w-0 flex-1 truncate text-sm font-semibold">
                          {p?.display_name ?? "A student"}
                          {p?.is_verified && <VerifiedBadge className="ml-1 h-4 w-4" />}
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
              {isLoading && (
                <div className="mt-3 space-y-3">
                  <div className="h-20 animate-pulse rounded-xl bg-primary/10" />
                  <div className="h-20 animate-pulse rounded-xl bg-primary/10" />
                </div>
              )}
              {!isLoading && (data?.accepted.length ?? 0) === 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    No friends yet — find a classmate to get started.
                  </p>
                  <p className="text-xs text-muted-foreground/80">
                    Use the search bar above to find friends.
                  </p>
                </div>
              )}
              <div className="mt-3 space-y-3">
                {data?.accepted.map((r) => {
                  const id = other(r);
                  const p = people?.get(id);
                  const name = p?.display_name ?? "A student";
                  return (
                    <div key={r.id} className="rounded-xl glass p-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to="/profile/$id"
                          params={{ id }}
                          aria-label={`View ${name}'s profile`}
                          className="group flex min-w-0 flex-1 items-center gap-3"
                        >
                          <img
                            src={avatarSrc(p?.avatar_id)}
                            alt=""
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-contain"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold transition group-hover:text-brand">
                              {name}
                              {p?.is_verified && <VerifiedBadge className="ml-1 h-4 w-4" />}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {p?.username ? `@${p.username}` : ""}
                            </div>
                          </div>
                        </Link>
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
                {data!.outgoing.length} request{data!.outgoing.length === 1 ? "" : "s"} still
                pending.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

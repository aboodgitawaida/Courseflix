import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ACTIVE_BRACKET_ID, type BracketConfig, type Tally } from "@/lib/bracket";

export type MyVote = { round: number; matchup: number; course_code: string };

/** The bracket's schedule and seeds, or null if it hasn't been set up yet. */
export function useBracketConfig(id = ACTIVE_BRACKET_ID) {
  return useQuery({
    queryKey: ["bracket", id],
    queryFn: async (): Promise<BracketConfig | null> => {
      const { data, error } = await supabase
        .from("brackets")
        .select("id, title, starts_at, round_hours, seeds")
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(`Could not load the bracket: ${error.message}`);
      if (!data) return null;
      return {
        id: data.id,
        title: data.title,
        startsAt: new Date(data.starts_at),
        roundHours: data.round_hours,
        seeds: data.seeds,
      };
    },
    staleTime: 10 * 60_000,
    retry: 1,
  });
}

export function useBracketTallies(id = ACTIVE_BRACKET_ID, live = false, enabled = true) {
  return useQuery({
    enabled,
    queryKey: ["bracket-tallies", id],
    queryFn: async (): Promise<Tally[]> => {
      const { data, error } = await supabase
        .from("bracket_vote_tallies")
        .select("round, matchup, course_code, votes")
        .eq("bracket_id", id);
      if (error) throw new Error(`Could not load votes: ${error.message}`);
      return (data ?? []).flatMap((row) =>
        row.round == null || row.matchup == null || !row.course_code
          ? []
          : [
              {
                round: row.round,
                matchup: row.matchup,
                course_code: row.course_code,
                votes: Number(row.votes ?? 0),
              },
            ],
      );
    },
    staleTime: 20_000,
    refetchInterval: live ? 30_000 : false,
    retry: 1,
  });
}

export function useMyBracketVotes(userId: string | undefined, id = ACTIVE_BRACKET_ID) {
  return useQuery({
    queryKey: ["bracket-my-votes", id, userId ?? null],
    enabled: Boolean(userId),
    queryFn: async (): Promise<MyVote[]> => {
      const { data, error } = await supabase
        .from("bracket_votes")
        .select("round, matchup, course_code")
        .eq("bracket_id", id);
      if (error) throw new Error(`Could not load your votes: ${error.message}`);
      return data ?? [];
    },
    retry: 1,
  });
}

/** Casts or changes a vote, updating the counts on screen straight away. */
export function useCastBracketVote(userId: string | undefined, id = ACTIVE_BRACKET_ID) {
  const queryClient = useQueryClient();
  const votesKey = ["bracket-my-votes", id, userId ?? null];
  const talliesKey = ["bracket-tallies", id];

  return useMutation({
    mutationFn: async (vote: MyVote) => {
      const { error } = await supabase.rpc("cast_bracket_vote", {
        _bracket: id,
        _round: vote.round,
        _matchup: vote.matchup,
        _course: vote.course_code,
      });
      if (error) throw new Error(error.message || "Could not save your vote");
    },
    onMutate: async (vote) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: votesKey }),
        queryClient.cancelQueries({ queryKey: talliesKey }),
      ]);
      const prevVotes = queryClient.getQueryData<MyVote[]>(votesKey) ?? [];
      const prevTallies = queryClient.getQueryData<Tally[]>(talliesKey) ?? [];
      const old = prevVotes.find((v) => v.round === vote.round && v.matchup === vote.matchup);
      if (old?.course_code === vote.course_code) return { prevVotes, prevTallies };

      const tallies = prevTallies.map((t) => ({ ...t }));
      const bump = (code: string, by: number) => {
        const row = tallies.find(
          (t) => t.round === vote.round && t.matchup === vote.matchup && t.course_code === code,
        );
        if (row) row.votes = Math.max(0, row.votes + by);
        else if (by > 0)
          tallies.push({ round: vote.round, matchup: vote.matchup, course_code: code, votes: by });
      };
      if (old) bump(old.course_code, -1);
      bump(vote.course_code, 1);

      queryClient.setQueryData(talliesKey, tallies);
      queryClient.setQueryData(votesKey, [
        ...prevVotes.filter((v) => !(v.round === vote.round && v.matchup === vote.matchup)),
        vote,
      ]);
      return { prevVotes, prevTallies };
    },
    onError: (_err, _vote, context) => {
      if (!context) return;
      queryClient.setQueryData(votesKey, context.prevVotes);
      queryClient.setQueryData(talliesKey, context.prevTallies);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: votesKey });
      void queryClient.invalidateQueries({ queryKey: talliesKey });
    },
  });
}

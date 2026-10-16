import { getRedditSignal } from "@/lib/reddit-signals";

/**
 * A 16-course knockout bracket that students vote on, one round at a time.
 * The schedule and the frozen seed list live in the `brackets` table; votes are
 * counted by the `bracket_vote_tallies` view. Results are worked out here, the
 * same way for every visitor, so no extra table of winners is needed.
 */

export const ACTIVE_BRACKET_ID = "hardest-course-fall-2026";
export const BRACKET_SIZE = 16;
export const ROUNDS = 4;
export const ROUND_NAMES = ["Round of 16", "Quarterfinals", "Semifinals", "Final"] as const;

// Standard seeding: 1 plays 16, 8 plays 9, and so on, so the top seeds can only
// meet late. Each pair is [seed, seed], 1-based.
const FIRST_ROUND_PAIRS: Array<[number, number]> = [
  [1, 16],
  [8, 9],
  [5, 12],
  [4, 13],
  [6, 11],
  [3, 14],
  [7, 10],
  [2, 15],
];

export type BracketConfig = {
  id: string;
  title: string;
  startsAt: Date;
  roundHours: number;
  seeds: string[];
};

export type Tally = { round: number; matchup: number; course_code: string; votes: number };

export type Entrant = { code: string; seed: number };

export type MatchupStatus = "waiting" | "open" | "closed";

export type Matchup = {
  round: number;
  index: number;
  a: Entrant | null;
  b: Entrant | null;
  votesA: number;
  votesB: number;
  status: MatchupStatus;
  /** Set once the round has closed and both entrants are known. */
  winner: Entrant | null;
};

export type BracketPhase =
  | { kind: "upcoming"; opensAt: Date }
  | { kind: "open"; round: number; closesAt: Date }
  | { kind: "finished"; endedAt: Date };

export function matchupsInRound(round: number) {
  return BRACKET_SIZE >> round;
}

export function roundWindow(config: BracketConfig, round: number) {
  const hour = 60 * 60 * 1000;
  const opens = new Date(config.startsAt.getTime() + (round - 1) * config.roundHours * hour);
  const closes = new Date(opens.getTime() + config.roundHours * hour);
  return { opens, closes };
}

export function bracketPhase(config: BracketConfig, now: Date): BracketPhase {
  if (now < config.startsAt) return { kind: "upcoming", opensAt: config.startsAt };
  for (let round = 1; round <= ROUNDS; round++) {
    const { closes } = roundWindow(config, round);
    if (now < closes) return { kind: "open", round, closesAt: closes };
  }
  return { kind: "finished", endedAt: roundWindow(config, ROUNDS).closes };
}

/** Builds every round's matchups from the votes so far. Ties go to the higher seed. */
export function buildBracket(config: BracketConfig, tallies: readonly Tally[], now: Date) {
  const votes = new Map<string, number>();
  for (const t of tallies) votes.set(`${t.round}:${t.matchup}:${t.course_code}`, t.votes);
  const count = (round: number, index: number, entrant: Entrant | null) =>
    entrant ? (votes.get(`${round}:${index}:${entrant.code}`) ?? 0) : 0;

  const rounds: Matchup[][] = [];
  let entrants: Array<Entrant | null> = FIRST_ROUND_PAIRS.flatMap(([a, b]) => [
    seedEntrant(config, a),
    seedEntrant(config, b),
  ]);

  for (let round = 1; round <= ROUNDS; round++) {
    const { opens, closes } = roundWindow(config, round);
    const status: MatchupStatus = now < opens ? "waiting" : now < closes ? "open" : "closed";
    const matchups: Matchup[] = [];
    for (let index = 0; index < matchupsInRound(round); index++) {
      const a = entrants[index * 2] ?? null;
      const b = entrants[index * 2 + 1] ?? null;
      const votesA = count(round, index, a);
      const votesB = count(round, index, b);
      let winner: Entrant | null = null;
      if (status === "closed" && a && b) {
        winner = votesA > votesB ? a : votesB > votesA ? b : a.seed < b.seed ? a : b;
      }
      matchups.push({ round, index, a, b, votesA, votesB, status, winner });
    }
    rounds.push(matchups);
    entrants = matchups.map((m) => m.winner);
  }
  return rounds;
}

export function champion(rounds: Matchup[][]): Entrant | null {
  return rounds[ROUNDS - 1]?.[0]?.winner ?? null;
}

function seedEntrant(config: BracketConfig, seed: number): Entrant | null {
  const code = config.seeds[seed - 1];
  return code ? { code, seed } : null;
}

/**
 * How the "hardest course" seeds were chosen: the catalog courses r/UTM most often
 * calls hard, at most two per subject so one department can't fill the bracket,
 * topped up by the next hardest overall. The result is frozen in the migration
 * that creates the bracket, so later Reddit updates don't reshuffle it mid-vote.
 */
export function pickHardestSeeds(catalogCodes: readonly string[], size = BRACKET_SIZE) {
  const ranked = catalogCodes
    .map((code) => ({ code, signal: getRedditSignal(code) }))
    .filter((r) => r.signal?.kind === "hard")
    .sort(
      (x, y) =>
        y.signal!.hard - x.signal!.hard ||
        y.signal!.votes - x.signal!.votes ||
        x.code.localeCompare(y.code),
    )
    .map((r) => r.code);

  const picked: string[] = [];
  const perSubject = new Map<string, number>();
  for (const code of ranked) {
    if (picked.length >= size) break;
    const subject = code.replace(/[0-9].*$/, "");
    if ((perSubject.get(subject) ?? 0) >= 2) continue;
    perSubject.set(subject, (perSubject.get(subject) ?? 0) + 1);
    picked.push(code);
  }
  for (const code of ranked) {
    if (picked.length >= size) break;
    if (!picked.includes(code)) picked.push(code);
  }
  return picked;
}

export function formatTimeLeft(ms: number) {
  if (ms <= 0) return "closing now";
  const minutes = Math.floor(ms / 60_000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${Math.max(1, mins)}m`;
}

#!/usr/bin/env node
// Prints course rankings from data/reddit-course-summary.json.
//   node scripts/reddit-rank.mjs easy        easiest courses
//   node scripts/reddit-rank.mjs hard        hardest courses
//   node scripts/reddit-rank.mjs light       lightest workload
//   node scripts/reddit-rank.mjs heavy       heaviest workload
//   node scripts/reddit-rank.mjs interesting most interesting
//   node scripts/reddit-rank.mjs liked       most positive
//   node scripts/reddit-rank.mjs CSC148      everything about one course
// Courses need at least MIN_VOTES opinions (default 3) to be ranked.

import { readFileSync } from "node:fs";

const { courses } = JSON.parse(readFileSync("data/reddit-course-summary.json", "utf8"));
const arg = process.argv[2] ?? "easy";
const MIN = Number(process.env.MIN_VOTES ?? 3);

const RANKINGS = {
  easy: ["difficulty", "easy", "hard"],
  hard: ["difficulty", "hard", "easy"],
  light: ["workload", "light", "heavy"],
  heavy: ["workload", "heavy", "light"],
  interesting: ["interest", "interesting", "boring"],
  liked: ["sentiment", "positive", "negative"],
};

if (RANKINGS[arg]) {
  const [field, good, bad] = RANKINGS[arg];
  const rows = Object.entries(courses)
    .map(([code, s]) => {
      const yes = s[field][good] ?? 0;
      const no = s[field][bad] ?? 0;
      return { code, yes, no, share: yes / Math.max(1, yes + no) };
    })
    .filter((r) => r.yes + r.no >= MIN)
    .sort((a, b) => b.share - a.share || b.yes - a.yes)
    .slice(0, 30);
  for (const r of rows)
    console.log(`${r.code}  ${Math.round(r.share * 100)}% ${good}  (${r.yes} vs ${r.no} ${bad})`);
} else {
  const s = courses[arg.toUpperCase()];
  console.log(s ? JSON.stringify(s, null, 2) : `No data for ${arg}`);
}

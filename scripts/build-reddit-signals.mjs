#!/usr/bin/env node
// Turns data/reddit-course-summary.json into src/lib/reddit-signals.json, the easy/hard
// opinion counts the site uses for its gold (easy) and red (hard) course highlights.
//   node scripts/build-reddit-signals.mjs     (or: npm run reddit-signals)
// Run after scripts/classify-reddit-reviews.mjs, then commit the JSON file.

import { readFileSync, writeFileSync } from "node:fs";

const { courses } = JSON.parse(readFileSync("data/reddit-course-summary.json", "utf8"));
const out = {};
for (const [code, s] of Object.entries(courses)) {
  const easy = s.difficulty.easy ?? 0;
  const hard = s.difficulty.hard ?? 0;
  if (easy + hard > 0) out[code] = [easy, hard];
}
const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
const note =
  "Counts of Reddit comments that call each UTM course easy or hard. Rebuild with: npm run reddit-signals";
writeFileSync(
  "src/lib/reddit-signals.json",
  JSON.stringify({ note, courses: sorted }, null, 2) + "\n",
);
console.log(`Wrote ${Object.keys(sorted).length} courses to src/lib/reddit-signals.json`);

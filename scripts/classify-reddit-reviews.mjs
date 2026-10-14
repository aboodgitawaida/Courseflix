#!/usr/bin/env node
// Asks Claude how each saved Reddit comment talks about the course it mentions, and
// writes a one-line summary in Claude's own words. Reads and updates
// data/reddit-reviews.json, then writes the positive ones to data/reddit-positive.json.
// Run after scrape-reddit-reviews.mjs:
//   ANTHROPIC_API_KEY=... node scripts/classify-reddit-reviews.mjs
// Results are cached on each comment, so reruns only classify new comments.

import { readFile, writeFile } from "node:fs/promises";
import Anthropic from "@anthropic-ai/sdk";

const IN = "data/reddit-reviews.json";
const OUT = "data/reddit-positive.json";
const BATCH = 25;

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Set ANTHROPIC_API_KEY (from https://console.anthropic.com/settings/keys).");
  process.exit(1);
}
const client = new Anthropic({ maxRetries: 4 });

const SYSTEM = `You label Reddit comments from University of Toronto Mississauga students.
Each item gives a course code and a comment that mentions it. Decide how the comment
talks about THAT course specifically:
- "positive": recommends it, calls it easy/interesting/useful/well taught, or says they enjoyed or did well in it.
- "negative": warns against it, calls it hard/boring/badly run, or says they regret it.
- "mixed": clearly both.
- "neutral": mentions the course without an opinion (questions, listings, logistics).
- "not_about_course": the code is unrelated or the opinion is about a different course.
A bare list of course names in reply to "what are easy/bird courses" counts as positive.
Also write a short summary (max 20 words) of what the comment says about the course,
in your own words, without quoting it. Use an empty summary for neutral or not_about_course.`;

const SCHEMA = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "integer" },
          sentiment: { type: "string", enum: ["positive", "negative", "mixed", "neutral", "not_about_course"] },
          summary: { type: "string" },
        },
        required: ["index", "sentiment", "summary"],
        additionalProperties: false,
      },
    },
  },
  required: ["results"],
  additionalProperties: false,
};

async function classify(items) {
  const content = items
    .map((it, i) => `<item index="${i}" course="${it.code}">\n${it.entry.text.slice(0, 2000)}\n</item>`)
    .join("\n");
  const response = await client.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 8000,
    output_config: { format: { type: "json_schema", schema: SCHEMA } },
    system: SYSTEM,
    messages: [{ role: "user", content }],
  });
  const text = response.content.find((b) => b.type === "text");
  if (!text) throw new Error(`No output (stop_reason: ${response.stop_reason})`);
  return JSON.parse(text.text).results;
}

async function main() {
  const data = JSON.parse(await readFile(IN, "utf8"));
  const pending = [];
  for (const [code, list] of Object.entries(data.courses)) {
    for (const entry of list) if (!entry.sentiment) pending.push({ code, entry });
  }
  console.log(`${pending.length} comments to classify`);

  for (let i = 0; i < pending.length; i += BATCH) {
    const batch = pending.slice(i, i + BATCH);
    try {
      for (const r of await classify(batch)) {
        const item = batch[r.index];
        if (!item) continue;
        item.entry.sentiment = r.sentiment;
        item.entry.summary = r.summary;
      }
    } catch (e) {
      console.log(`  batch ${i / BATCH + 1} failed, will retry next run: ${e.message.slice(0, 120)}`);
    }
    await writeFile(IN, JSON.stringify(data, null, 2));
    console.log(`  ${Math.min(i + BATCH, pending.length)}/${pending.length}`);
  }

  const positive = {};
  for (const [code, list] of Object.entries(data.courses)) {
    const good = list
      .filter((e) => e.sentiment === "positive")
      .map(({ summary, score, date, url }) => ({ summary, score, date, url }));
    if (good.length) positive[code] = good;
  }
  await writeFile(OUT, JSON.stringify({ updated: new Date().toISOString(), courses: positive }, null, 2));
  const total = Object.values(positive).reduce((n, l) => n + l.length, 0);
  console.log(`Saved ${total} positive comments across ${Object.keys(positive).length} courses to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

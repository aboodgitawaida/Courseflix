#!/usr/bin/env node
// Asks Claude how each saved Reddit comment talks about the course it mentions:
// sentiment, difficulty, workload, interest, professors, a tip and a one-line summary
// in Claude's own words. Reads and updates data/reddit-reviews.json, then writes:
//   data/reddit-positive.json        positive comments per course
//   data/reddit-course-summary.json  per-course counts (easy vs hard, etc.), sorted by comments
// Run after scrape-reddit-reviews.mjs:
//   ANTHROPIC_API_KEY=... node scripts/classify-reddit-reviews.mjs
// Results are cached on each comment, so reruns only classify new comments.

import { readFile, writeFile } from "node:fs/promises";
import Anthropic from "@anthropic-ai/sdk";

const IN = "data/reddit-reviews.json";
const POSITIVE_OUT = "data/reddit-positive.json";
const SUMMARY_OUT = "data/reddit-course-summary.json";
const BATCH = 25;
// Batches sent to Claude at the same time.
const CONCURRENCY = Number(process.env.CLASSIFY_CONCURRENCY ?? 5);
// Bump when the labels change so older entries are classified again.
const VERSION = 2;

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Set ANTHROPIC_API_KEY (from https://console.anthropic.com/settings/keys).");
  process.exit(1);
}
const client = new Anthropic({ maxRetries: 4 });

const SYSTEM = `You label Reddit comments from University of Toronto Mississauga students.
Each item gives a course code and a comment that mentions it. Judge only what the
comment says about THAT course. Use "unknown" whenever the comment does not say.

- sentiment: "positive" (recommends it, enjoyed it, did well), "negative" (warns against
  it, regrets it), "mixed", "neutral" (mentions it without an opinion: questions,
  listings, logistics), or "not_about_course" (the code is unrelated or the opinion is
  about a different course). A bare list of courses given in reply to "what are easy or
  bird courses" counts as positive and difficulty "easy".
- difficulty: "easy", "medium", "hard" or "unknown".
- workload: "light", "heavy" or "unknown".
- interest: "interesting", "boring" or "unknown".
- professors: instructor names the comment mentions for this course, with "good" or
  "bad" if the comment judges them, otherwise "neutral". Empty if none.
- tip: one piece of advice for doing well in the course, in your own words, or "".
- summary: at most 20 words on what the comment says about the course, in your own
  words without quoting it. "" for neutral or not_about_course.`;

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
          difficulty: { type: "string", enum: ["easy", "medium", "hard", "unknown"] },
          workload: { type: "string", enum: ["light", "heavy", "unknown"] },
          interest: { type: "string", enum: ["interesting", "boring", "unknown"] },
          professors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                opinion: { type: "string", enum: ["good", "bad", "neutral"] },
              },
              required: ["name", "opinion"],
              additionalProperties: false,
            },
          },
          tip: { type: "string" },
          summary: { type: "string" },
        },
        required: ["index", "sentiment", "difficulty", "workload", "interest", "professors", "tip", "summary"],
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
    max_tokens: 16000,
    output_config: { format: { type: "json_schema", schema: SCHEMA } },
    system: SYSTEM,
    messages: [{ role: "user", content }],
  });
  const text = response.content.find((b) => b.type === "text");
  if (!text) throw new Error(`No output (stop_reason: ${response.stop_reason})`);
  return JSON.parse(text.text).results;
}

function summarize(courses) {
  const summary = {};
  for (const [code, list] of Object.entries(courses)) {
    const about = list.filter((e) => e.labels && e.labels.sentiment !== "not_about_course");
    if (!about.length) continue;
    const count = (field) => {
      const c = {};
      for (const e of about) if (e.labels[field] !== "unknown") c[e.labels[field]] = (c[e.labels[field]] ?? 0) + 1;
      return c;
    };
    const profs = {};
    for (const e of about) {
      for (const p of e.labels.professors) {
        const key = p.name.trim();
        profs[key] ??= { good: 0, bad: 0, neutral: 0 };
        profs[key][p.opinion]++;
      }
    }
    summary[code] = {
      comments: about.length,
      sentiment: count("sentiment"),
      difficulty: count("difficulty"),
      workload: count("workload"),
      interest: count("interest"),
      professors: profs,
      tips: about.map((e) => e.labels.tip).filter(Boolean).slice(0, 10),
    };
  }
  return Object.fromEntries(Object.entries(summary).sort((a, b) => b[1].comments - a[1].comments));
}

async function main() {
  const data = JSON.parse(await readFile(IN, "utf8"));
  const pending = [];
  for (const [code, list] of Object.entries(data.courses)) {
    for (const entry of list) if (entry.labelsVersion !== VERSION) pending.push({ code, entry });
  }
  const batches = [];
  for (let i = 0; i < pending.length; i += BATCH) batches.push(pending.slice(i, i + BATCH));
  console.log(`${pending.length} comments to classify in ${batches.length} batches`);

  let finished = 0;
  let next = 0;
  async function worker() {
    while (next < batches.length) {
      const batch = batches[next++];
      try {
        for (const { index, ...labels } of await classify(batch)) {
          const item = batch[index];
          if (!item) continue;
          item.entry.labels = labels;
          item.entry.labelsVersion = VERSION;
        }
      } catch (e) {
        console.log(`  a batch failed, it will be retried next run: ${e.message.slice(0, 120)}`);
      }
      finished++;
      await writeFile(IN, JSON.stringify(data, null, 2));
      console.log(`  ${finished}/${batches.length} batches`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const positive = {};
  for (const [code, list] of Object.entries(data.courses)) {
    const good = list
      .filter((e) => e.labels?.sentiment === "positive")
      .map(({ labels, score, date, url }) => ({ summary: labels.summary, score, date, url }));
    if (good.length) positive[code] = good;
  }
  const updated = new Date().toISOString();
  await writeFile(POSITIVE_OUT, JSON.stringify({ updated, courses: positive }, null, 2));
  await writeFile(SUMMARY_OUT, JSON.stringify({ updated, courses: summarize(data.courses) }, null, 2));
  const total = Object.values(positive).reduce((n, l) => n + l.length, 0);
  console.log(`Saved ${total} positive comments to ${POSITIVE_OUT}`);
  console.log(`Saved per-course summary to ${SUMMARY_OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

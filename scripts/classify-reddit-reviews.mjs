#!/usr/bin/env node
// Asks an AI model how each saved Reddit comment talks about the course it mentions:
// sentiment, difficulty, workload, interest, professors, a tip and a one-line summary
// in Claude's own words. Reads and updates data/reddit-reviews.json, then writes:
//   data/reddit-positive.json        positive comments per course
//   data/reddit-course-summary.json  per-course counts (easy vs hard, etc.), sorted by comments
// Run after scrape-reddit-reviews.mjs:
//   GEMINI_API_KEY=... node scripts/classify-reddit-reviews.mjs      free tier, uses Google Gemini
//   node scripts/classify-reddit-reviews.mjs            free, uses a local Ollama model
//   ANTHROPIC_API_KEY=... node scripts/classify-reddit-reviews.mjs   paid, uses Claude
// Gemini key: https://aistudio.google.com (Get API key). Pick a model with GEMINI_MODEL=...
// Only courses with at least MIN_COMMENTS comments (default 5) are classified.
// Ollama: install from https://ollama.com, then `ollama pull llama3.1:8b`.
// Pick another local model with OLLAMA_MODEL=...
// Results are cached on each comment, so reruns only classify new comments.

import { readFile, writeFile } from "node:fs/promises";
import Anthropic from "@anthropic-ai/sdk";

const IN = "data/reddit-reviews.json";
const POSITIVE_OUT = "data/reddit-positive.json";
const SUMMARY_OUT = "data/reddit-course-summary.json";
const USE_CLAUDE = Boolean(process.env.ANTHROPIC_API_KEY);
const USE_GEMINI = !USE_CLAUDE && Boolean(process.env.GEMINI_API_KEY);
const GEMINI_URL = process.env.GEMINI_URL ?? "https://generativelanguage.googleapis.com";
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-flash-latest";
// Used for a request when the main model is overloaded.
const GEMINI_FALLBACK = process.env.GEMINI_FALLBACK ?? "gemini-flash-lite-latest";
const MIN_COMMENTS = Number(process.env.MIN_COMMENTS ?? 5);
const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.1:8b";
// A small local model does better with fewer comments at once, and the Mac runs one at a time.
const BATCH = USE_CLAUDE || USE_GEMINI ? 25 : 5;
// Batches sent to Claude at the same time.
const CONCURRENCY = Number(process.env.CLASSIFY_CONCURRENCY ?? (USE_CLAUDE ? 5 : 1));
// Bump when the labels change so older entries are classified again.
const VERSION = 3;

const client = USE_CLAUDE ? new Anthropic({ maxRetries: 4 }) : null;

const SYSTEM = `You label Reddit comments from University of Toronto Mississauga students.
Each item has a course code, the comment, and when available the post title it was
posted under (<thread>), the post's text (<post>) and the comment it replies to
(<replying_to>). Use that context to understand the comment, but judge only what the
comment's author says about THAT course. Use "unknown" whenever they do not say.

Fields:
- sentiment: "positive" (recommends it, enjoyed it, did well), "negative" (warns against
  it, regrets it, did badly), "mixed" (clearly both), "neutral" (no opinion: questions,
  logistics, course lists without a reason), or "not_about_course" (the code is
  unrelated, or the opinion is about a different course).
- difficulty: "easy", "medium", "hard" or "unknown".
- workload: "light", "heavy" or "unknown".
- interest: "interesting", "boring" or "unknown".
- professors: instructor names mentioned for this course, with "good" or "bad" if the
  author judges them, otherwise "neutral". Empty if none.
- tip: one piece of advice for doing well in the course, in your own words, or "".
- summary: at most 20 words on what the author says about the course, in your own words
  without quoting. "" when sentiment is neutral or not_about_course.
- confidence: "high" if the opinion is explicit, "medium" if it needs some reading
  between the lines, "low" if you are guessing (jokes, sarcasm you are unsure about,
  very short or ambiguous comments).

Rules:
- A list of courses replying to a request for easy or bird courses (see <thread> or
  <replying_to>) is a recommendation: sentiment "positive", difficulty "easy",
  confidence "medium". The same list with no such context is "neutral".
- A list replying to "what are the hardest courses" is sentiment "negative", difficulty
  "hard".
- Criticism of one professor's conduct is about the professor, not the course: record
  the professor as "bad" and keep the course sentiment "neutral" unless the author also
  judges the course.
- Read sarcasm and jokes for their real meaning. "Bird course my ass" means hard.
  A joke whose point is unclear gets confidence "low".
- "It's easy if you put in the work" is difficulty "medium", not "easy".
- Asking about a course ("is X hard?") is neutral with difficulty "unknown".
- Saying a course is easy because of high marks counts as difficulty "easy".

Examples:
1. course MAT102, thread "Hardest first year courses?", comment "MAT102 and MAT135 lol"
   -> negative, hard, confidence medium.
2. course PHL245, comment "PHL245 is a bird course my ass, failed the midterm"
   -> negative, hard, confidence high.
3. course SOC100, comment "easiest 4.0 of my life, barely studied"
   -> positive, easy, light, confidence high.
4. course CSC148, comment "Prof X is awful, never answers emails"
   -> neutral, unknown, professors [X bad], confidence high.`;

const SCHEMA = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "integer" },
          sentiment: {
            type: "string",
            enum: ["positive", "negative", "mixed", "neutral", "not_about_course"],
          },
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
          confidence: { type: "string", enum: ["high", "medium", "low"] },
          summary: { type: "string" },
        },
        required: [
          "index",
          "sentiment",
          "difficulty",
          "workload",
          "interest",
          "professors",
          "tip",
          "summary",
          "confidence",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["results"],
  additionalProperties: false,
};

async function classifyLocal(content) {
  let res;
  try {
    res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        format: SCHEMA,
        options: { temperature: 0 },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content },
        ],
      }),
    });
  } catch {
    throw new Error(
      `Could not reach Ollama at ${OLLAMA_URL}. Open the Ollama app, or set ANTHROPIC_API_KEY to use Claude.`,
    );
  }
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return JSON.parse((await res.json()).message.content).results;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Gemini answered but with nothing to read, usually because it blocked something in the batch.
class EmptyOutputError extends Error {}

async function classifyGemini(content, attempt = 1) {
  // After two overloaded replies, try the lighter model, which is usually less busy.
  const model = attempt > 2 ? GEMINI_FALLBACK : GEMINI_MODEL;
  let res;
  try {
    res = await fetch(`${GEMINI_URL}/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts: [{ text: content }] }],
        // These are student comments we only classify. The default filters can block a whole
        // batch because one comment is crude or sensitive, which leaves it unlabelled.
        safetySettings: [
          "HARM_CATEGORY_HARASSMENT",
          "HARM_CATEGORY_HATE_SPEECH",
          "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          "HARM_CATEGORY_DANGEROUS_CONTENT",
        ].map((category) => ({ category, threshold: "BLOCK_NONE" })),
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
          responseJsonSchema: SCHEMA,
        },
      }),
    });
  } catch (e) {
    // The computer lost its connection (Wi-Fi drop, sleep). Wait and try again.
    if (attempt > 8) throw e;
    const wait = Math.min(120_000, (Number(process.env.GEMINI_WAIT_MS) || 15_000) * attempt);
    console.log(`  no internet connection, waiting ${wait / 1000}s and trying again...`);
    await sleep(wait);
    return classifyGemini(content, attempt);
  }
  // The free tier allows a limited number of requests per minute and per day.
  if ((res.status === 429 || res.status >= 500) && attempt <= 5) {
    const wait = (Number(process.env.GEMINI_WAIT_MS) || 30_000) * attempt;
    console.log(`  Gemini ${res.status} (rate limit or busy), waiting ${wait / 1000}s...`);
    await sleep(wait);
    return classifyGemini(content, attempt + 1);
  }
  if (!res.ok) {
    const body = await res.text();
    // A bad key fails every batch the same way, so stop right away instead of retrying.
    if (res.status === 401 || res.status === 403 || /API key/i.test(body)) {
      console.error(
        `Gemini rejected the API key (${res.status}). Check GEMINI_API_KEY and try again.`,
      );
      process.exit(1);
    }
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    const why = json.promptFeedback?.blockReason ?? json.candidates?.[0]?.finishReason ?? "unknown";
    throw new EmptyOutputError(`Gemini returned no output (${why})`);
  }
  return JSON.parse(text).results;
}

async function checkOllama() {
  let tags;
  try {
    tags = await (await fetch(`${OLLAMA_URL}/api/tags`)).json();
  } catch {
    console.error("Ollama is not running. Install it from https://ollama.com and open the app,");
    console.error("or set ANTHROPIC_API_KEY to use Claude instead.");
    process.exit(1);
  }
  const names = (tags.models ?? []).map((m) => m.name);
  if (!names.some((n) => n === OLLAMA_MODEL || n.startsWith(`${OLLAMA_MODEL}:`))) {
    console.error(`The model ${OLLAMA_MODEL} is not downloaded. Run: ollama pull ${OLLAMA_MODEL}`);
    process.exit(1);
  }
}

async function classify(items) {
  const content = items
    .map((it, i) => {
      const e = it.entry;
      const ctx = [
        e.thread && `<thread>${e.thread}</thread>`,
        e.postText && `<post>${e.postText}</post>`,
        e.parent && `<replying_to>${e.parent}</replying_to>`,
      ].filter(Boolean);
      return [
        `<item index="${i}" course="${it.code}">`,
        ...ctx,
        `<comment>${e.text.slice(0, 2000)}</comment>`,
        "</item>",
      ].join("\n");
    })
    .join("\n");
  if (USE_GEMINI) return classifyGemini(content);
  if (!USE_CLAUDE) return classifyLocal(content);
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
    // Low-confidence labels are guesses, so they do not count toward the totals.
    const about = list.filter(
      (e) => e.labels && e.labels.sentiment !== "not_about_course" && e.labels.confidence !== "low",
    );
    if (!about.length) continue;
    const count = (field) => {
      const c = {};
      for (const e of about)
        if (e.labels[field] !== "unknown") c[e.labels[field]] = (c[e.labels[field]] ?? 0) + 1;
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
      tips: about
        .map((e) => e.labels.tip)
        .filter(Boolean)
        .slice(0, 10),
    };
  }
  return Object.fromEntries(Object.entries(summary).sort((a, b) => b[1].comments - a[1].comments));
}

async function main() {
  const data = JSON.parse(await readFile(IN, "utf8"));
  const pending = [];
  for (const [code, list] of Object.entries(data.courses)) {
    // Courses with only a comment or two are too thin to rank, so skip them.
    if (list.length < MIN_COMMENTS) continue;
    for (const entry of list) if (entry.labelsVersion !== VERSION) pending.push({ code, entry });
  }
  const batches = [];
  for (let i = 0; i < pending.length; i += BATCH) batches.push(pending.slice(i, i + BATCH));
  if (!USE_CLAUDE && !USE_GEMINI) await checkOllama();
  console.log(
    `Using ${USE_CLAUDE ? "Claude (paid)" : USE_GEMINI ? `Gemini ${GEMINI_MODEL} (free tier)` : `${OLLAMA_MODEL} on this computer (free)`}`,
  );
  console.log(`${pending.length} comments to classify in ${batches.length} batches`);

  let finished = 0;
  let failedInARow = 0;
  let next = 0;
  async function worker() {
    while (next < batches.length) {
      const batch = batches[next++];
      const apply = (items, results) => {
        for (const { index, ...labels } of results) {
          const item = items[index];
          if (!item) continue;
          item.entry.labels = labels;
          item.entry.labelsVersion = VERSION;
        }
      };
      try {
        try {
          apply(batch, await classify(batch));
        } catch (e) {
          if (!(e instanceof EmptyOutputError) || batch.length === 1) throw e;
          // One comment probably tripped it. Send them one at a time so only that one is left out.
          console.log(`  ${e.message}; retrying its ${batch.length} comments one by one`);
          let skipped = 0;
          for (const item of batch) {
            try {
              apply([item], await classify([item]));
            } catch (single) {
              if (!(single instanceof EmptyOutputError)) throw single;
              skipped++;
              console.log(`  skipped ${item.code} comment ${item.entry.id}: ${single.message}`);
            }
          }
          if (skipped === batch.length) throw e;
        }
        failedInARow = 0;
      } catch (e) {
        console.log(`  a batch failed, it will be retried next run: ${e.message.slice(0, 120)}`);
        // Many failures in a row means something is wrong, so stop instead of skipping everything.
        if (++failedInARow >= 5) {
          console.error("5 batches failed in a row. Check your internet connection and rerun.");
          process.exit(1);
        }
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
      .filter((e) => e.labels?.sentiment === "positive" && e.labels.confidence !== "low")
      .map(({ labels, score, date, url }) => ({ summary: labels.summary, score, date, url }));
    if (good.length) positive[code] = good;
  }
  const updated = new Date().toISOString();
  await writeFile(POSITIVE_OUT, JSON.stringify({ updated, courses: positive }, null, 2));
  await writeFile(
    SUMMARY_OUT,
    JSON.stringify({ updated, courses: summarize(data.courses) }, null, 2),
  );
  const total = Object.values(positive).reduce((n, l) => n + l.length, 0);
  console.log(`Saved ${total} positive comments to ${POSITIVE_OUT}`);
  console.log(`Saved per-course summary to ${SUMMARY_OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

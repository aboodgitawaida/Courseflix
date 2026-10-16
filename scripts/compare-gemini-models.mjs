#!/usr/bin/env node
// Test only: asks a second model to label a random sample of comments that the first model
// already labelled, using the classifier's exact prompt, then prints how often the two agree.
// It never writes to data/reddit-reviews.json.
//   GEMINI_MODEL=gemini-flash-latest node scripts/compare-gemini-models.mjs
//   PROVIDER=ollama node scripts/compare-gemini-models.mjs      the local Ollama model
// SAMPLE=150 sets how many comments (default 150). OLLAMA_MODEL=... picks another local model.

import { readFile } from "node:fs/promises";

const IN = "data/reddit-reviews.json";
const OLLAMA = process.env.PROVIDER === "ollama";
const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const MODEL = OLLAMA
  ? (process.env.OLLAMA_MODEL ?? "llama3.1:8b")
  : (process.env.GEMINI_MODEL ?? "gemini-flash-latest");
const SAMPLE = Number(process.env.SAMPLE ?? 150);
// The classifier sends the local model 5 comments at a time, so the test does too.
const BATCH = OLLAMA ? 5 : 25;
const VERSION = 3;

if (!OLLAMA && !process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in this Terminal window.");
  process.exit(1);
}

// Take the prompt and schema from the classifier so both models get identical instructions.
const src = await readFile("scripts/classify-reddit-reviews.mjs", "utf8");
const grab = (start, end) => {
  const a = src.indexOf(start);
  const b = src.indexOf(end, a);
  if (a < 0 || b < 0) throw new Error(`Could not find ${start} in the classifier`);
  return src.slice(a + start.length, b);
};
const SYSTEM = new Function(`return \`${grab("const SYSTEM = `", "`;\n")}\``)();
const SCHEMA = new Function(`return ${grab("const SCHEMA = ", "\n};\n")}\n}`)();

const data = JSON.parse(await readFile(IN, "utf8"));
const pool = [];
for (const [code, list] of Object.entries(data.courses))
  for (const entry of list) if (entry.labelsVersion === VERSION) pool.push({ code, entry });
for (let i = pool.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [pool[i], pool[j]] = [pool[j], pool[i]];
}
const sample = pool.slice(0, SAMPLE);
console.log(
  `Comparing ${sample.length} comments against ${MODEL} (${pool.length} labelled so far)`,
);

function content(items) {
  return items
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
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function askOllama(items) {
  let res;
  try {
    res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        format: SCHEMA,
        options: { temperature: 0 },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: content(items) },
        ],
      }),
    });
  } catch {
    throw new Error(`Could not reach Ollama at ${OLLAMA_URL}. Open the Ollama app and try again.`);
  }
  if (!res.ok) throw new Error(`Ollama replied ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return JSON.parse((await res.json()).message.content).results;
}

async function ask(items, attempt = 1) {
  if (OLLAMA) return askOllama(items);
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts: [{ text: content(items) }] }],
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
          responseJsonSchema: SCHEMA,
        },
      }),
    },
  );
  if ((res.status === 503 || res.status === 500) && attempt <= 6) {
    console.log(`  ${MODEL} is busy (${res.status}), waiting ${20 * attempt}s and trying again...`);
    await sleep(20_000 * attempt);
    return ask(items, attempt + 1);
  }
  if (!res.ok) {
    const err = new Error(`${MODEL} replied ${res.status}: ${(await res.text()).slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  const text = (await res.json()).candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(text).results;
}

const FIELDS = ["sentiment", "difficulty", "workload", "interest", "confidence"];
const stats = Object.fromEntries(
  FIELDS.map((f) => [f, { agree: 0, total: 0, real: 0, realAgree: 0 }]),
);
const diffs = [];
let done = 0;

for (let i = 0; i < sample.length; i += BATCH) {
  const batch = sample.slice(i, i + BATCH);
  let results;
  try {
    results = await ask(batch);
  } catch (e) {
    console.log(
      `\nStopped early: ${e.message}\nShowing the results from the ${done} comments finished.`,
    );
    break;
  }
  for (const { index, ...b } of results) {
    const item = batch[index];
    if (!item) continue;
    const a = item.entry.labels;
    done++;
    for (const f of FIELDS) {
      const s = stats[f];
      s.total++;
      if (a[f] === b[f]) s.agree++;
      // "Real" ignores comments where both models said unknown, which inflate agreement.
      if (!(a[f] === "unknown" && b[f] === "unknown")) {
        s.real++;
        if (a[f] === b[f]) s.realAgree++;
      }
    }
    if (a.sentiment !== b.sentiment || a.difficulty !== b.difficulty)
      diffs.push({ code: item.code, text: item.entry.text.slice(0, 160), first: a, second: b });
  }
  console.log(`  ${Math.min(i + BATCH, sample.length)}/${sample.length}`);
}

const pct = (n, d) => (d ? `${Math.round((100 * n) / d)}%` : "n/a");
console.log(`\nAgreement over ${done} comments (first model vs ${MODEL}):`);
for (const f of FIELDS) {
  const s = stats[f];
  console.log(
    `  ${f.padEnd(10)} ${pct(s.agree, s.total).padStart(4)} overall   ${pct(s.realAgree, s.real).padStart(4)} when at least one gave an answer (${s.real})`,
  );
}
console.log(`\n${diffs.length} comments differ on sentiment or difficulty. First 8:`);
for (const d of diffs.slice(0, 8)) {
  console.log(`\n${d.code}: "${d.text.replace(/\s+/g, " ")}"`);
  console.log(`  first : ${d.first.sentiment}, ${d.first.difficulty}, ${d.first.confidence}`);
  console.log(`  second: ${d.second.sentiment}, ${d.second.difficulty}, ${d.second.confidence}`);
}

#!/usr/bin/env node
// Builds a page you open in your browser to check the AI's labels by hand: random labelled
// comments with the AI's easy/hard verdict, and buttons for Right / Wrong / Unsure. It keeps a
// running accuracy score, and your answers are saved in the browser. Read-only: it never
// changes data/reddit-reviews.json.
//   node scripts/spot-check-reddit-labels.mjs        writes data/spot-check.html
//   open data/spot-check.html
// SAMPLE=100 sets the size. Most of the sample is comments labelled easy or hard (the ones that
// decide the gold and red courses), plus a few labelled "unknown" to catch opinions it missed.

import { readFileSync, writeFileSync } from "node:fs";

const SAMPLE = Number(process.env.SAMPLE ?? 100);
const OUT = "data/spot-check.html";
const { courses } = JSON.parse(readFileSync("data/reddit-reviews.json", "utf8"));

const all = Object.entries(courses).flatMap(([code, list]) =>
  list.filter((e) => e.labels).map((e) => ({ code, e })),
);
const counted = (d) => (x) => x.e.labels.difficulty === d && x.e.labels.confidence !== "low";
const pools = {
  easy: all.filter(counted("easy")),
  hard: all.filter(counted("hard")),
  unknown: all.filter(
    (x) => x.e.labels.difficulty === "unknown" && x.e.labels.sentiment !== "not_about_course",
  ),
};
const shuffle = (a) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};
const nUnknown = Math.round(SAMPLE * 0.2);
const nEach = Math.floor((SAMPLE - nUnknown) / 2);
const picked = shuffle([
  ...shuffle(pools.easy).slice(0, nEach),
  ...shuffle(pools.hard).slice(0, nEach),
  ...shuffle(pools.unknown).slice(0, nUnknown),
]);
const clip = (s, n) => (s && s.length > n ? `${s.slice(0, n)}…` : (s ?? ""));
const items = picked.map(({ code, e }) => ({
  id: e.id,
  course: code,
  thread: clip(e.thread, 200),
  parent: clip(e.parent, 500),
  text: clip(e.text, 1500),
  url: e.url,
  date: e.date,
  ai: {
    difficulty: e.labels.difficulty,
    sentiment: e.labels.sentiment,
    confidence: e.labels.confidence,
  },
}));

const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Label spot-check</title>
<style>
:root{--bg:#0b0b0f;--card:#14141b;--line:#2a2a36;--fg:#f2f2f5;--mut:#9a9aa8;--ok:#34d399;--bad:#f87171;--warn:#fbbf24;--acc:#7c8cff}
@media (prefers-color-scheme: light){:root{--bg:#f6f6f9;--card:#fff;--line:#dcdce6;--fg:#15151c;--mut:#5d5d6e}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif}
main{max-width:760px;margin:0 auto;padding:20px 16px 80px}
h1{font-size:22px;margin:0 0 4px}.sub{color:var(--mut);margin:0 0 16px}
.bar{position:sticky;top:0;background:var(--bg);padding:10px 0;border-bottom:1px solid var(--line);z-index:5}
.track{height:8px;background:var(--line);border-radius:9px;overflow:hidden}.fill{height:100%;background:var(--acc);width:0}
.stats{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:8px;font-size:13px;color:var(--mut)}.stats b{color:var(--fg)}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;margin:14px 0}
.card.done-ok{border-color:var(--ok)}.card.done-bad{border-color:var(--bad)}
.meta{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:12px;color:var(--mut)}
.code{font-weight:800;color:var(--fg);font-size:16px}
.ctx{font-size:13px;color:var(--mut);border-left:3px solid var(--line);padding-left:10px;margin:10px 0}
.txt{white-space:pre-wrap;margin:10px 0}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}
.chip{border:1px solid var(--line);border-radius:99px;padding:3px 10px;font-size:12px}
.chip.ai{border-color:var(--acc);color:var(--acc);font-weight:700}
.q{font-weight:600;margin:12px 0 8px}
.btns{display:flex;flex-wrap:wrap;gap:8px}
button{font:inherit;border:1px solid var(--line);background:transparent;color:var(--fg);border-radius:10px;padding:8px 14px;cursor:pointer}
button:hover{border-color:var(--acc)}button.sel{background:var(--acc);color:#fff;border-color:var(--acc)}
button.ok.sel{background:var(--ok);border-color:var(--ok);color:#052e1f}button.no.sel{background:var(--bad);border-color:var(--bad);color:#3b0a0a}
.fix{margin-top:10px;display:none}.fix.show{display:block}
a{color:var(--acc)}
#result{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;margin:18px 0}
pre{white-space:pre-wrap;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:10px;font-size:12px}
</style></head><body><main>
<h1>Label spot-check</h1>
<p class="sub">For each comment, is the AI's <b>difficulty</b> label right <i>for that course</i>? Easy = it says the course is easy; hard = hard; medium; unknown = no opinion on difficulty. Your answers save in this browser.</p>
<div class="bar"><div class="track"><div class="fill" id="fill"></div></div><div class="stats" id="stats"></div></div>
<div id="list"></div>
<div id="result"><b>Results</b><div id="summary" class="sub"></div><button id="copy">Copy results</button><pre id="out" hidden></pre></div>
</main>
<script>
const ITEMS = ${JSON.stringify(items).replace(/</g, "\\u003c")};
const KEY = "spot-check-v1";
let saved = {};
try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch {}
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch {} };
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const LABELS = ["easy", "medium", "hard", "unknown"];
const list = document.getElementById("list");
ITEMS.forEach((it, i) => {
  const el = document.createElement("div");
  el.className = "card"; el.id = "c" + it.id;
  el.innerHTML =
    '<div class="meta"><span class="code">' + esc(it.course) + '</span><span>#' + (i + 1) + ' of ' + ITEMS.length + '</span><span>' + esc(it.date) + '</span>' +
    (it.url ? '<a href="' + esc(it.url) + '" target="_blank" rel="noreferrer">open on Reddit</a>' : '') + '</div>' +
    (it.thread ? '<div class="ctx"><b>Thread:</b> ' + esc(it.thread) + '</div>' : '') +
    (it.parent ? '<div class="ctx"><b>Replying to:</b> ' + esc(it.parent) + '</div>' : '') +
    '<div class="txt">' + esc(it.text) + '</div>' +
    '<div class="chips"><span class="chip ai">AI says: ' + esc(it.ai.difficulty) + '</span><span class="chip">sentiment: ' + esc(it.ai.sentiment) + '</span><span class="chip">confidence: ' + esc(it.ai.confidence) + '</span></div>' +
    '<div class="q">Is the AI right about difficulty for ' + esc(it.course) + '?</div>' +
    '<div class="btns"><button class="ok" data-a="right">Right</button><button class="no" data-a="wrong">Wrong</button><button data-a="unsure">Unsure</button></div>' +
    '<div class="fix"><div class="q">What is it, then?</div><div class="btns">' + LABELS.map((l) => '<button data-fix="' + l + '">' + l + '</button>').join("") + '</div></div>';
  el.addEventListener("click", (ev) => {
    const b = ev.target.closest("button"); if (!b) return;
    const cur = saved[it.id] || {};
    if (b.dataset.a) saved[it.id] = { a: b.dataset.a, fix: b.dataset.a === "wrong" ? cur.fix : undefined };
    if (b.dataset.fix) saved[it.id] = { a: "wrong", fix: b.dataset.fix };
    persist(); paint();
  });
  list.appendChild(el);
});
function paint() {
  let right = 0, wrong = 0, unsure = 0;
  const by = {};
  ITEMS.forEach((it) => {
    const s = saved[it.id], el = document.getElementById("c" + it.id);
    el.className = "card" + (s?.a === "right" ? " done-ok" : s?.a === "wrong" ? " done-bad" : "");
    el.querySelectorAll("[data-a]").forEach((b) => b.classList.toggle("sel", s?.a === b.dataset.a));
    el.querySelector(".fix").classList.toggle("show", s?.a === "wrong");
    el.querySelectorAll("[data-fix]").forEach((b) => b.classList.toggle("sel", s?.fix === b.dataset.fix));
    if (!s) return;
    if (s.a === "unsure") { unsure++; return; }
    s.a === "right" ? right++ : wrong++;
    const k = it.ai.difficulty; by[k] = by[k] || { r: 0, w: 0 }; by[k][s.a === "right" ? "r" : "w"]++;
  });
  const judged = right + wrong, done = judged + unsure;
  document.getElementById("fill").style.width = (100 * done / ITEMS.length) + "%";
  const pct = (a, b) => b ? Math.round(100 * a / b) + "%" : "–";
  document.getElementById("stats").innerHTML = "<span><b>" + done + "</b> / " + ITEMS.length + " done</span><span>accuracy <b>" + pct(right, judged) + "</b> (" + right + " right, " + wrong + " wrong)</span><span>unsure " + unsure + "</span>";
  const parts = Object.entries(by).map(([k, v]) => "AI said <b>" + k + "</b>: " + pct(v.r, v.r + v.w) + " right (" + v.r + "/" + (v.r + v.w) + ")");
  document.getElementById("summary").innerHTML = judged ? parts.join("<br>") : "Answer a few comments to see results.";
}
document.getElementById("copy").onclick = () => {
  const rows = ITEMS.map((it) => ({ id: it.id, course: it.course, ai: it.ai.difficulty, answer: saved[it.id]?.a || "", correct: saved[it.id]?.a === "right" ? it.ai.difficulty : saved[it.id]?.fix || "" }));
  const out = document.getElementById("out"); out.hidden = false;
  out.textContent = document.getElementById("summary").innerText + "\\n\\n" + JSON.stringify(rows);
  navigator.clipboard?.writeText(out.textContent).catch(() => {});
};
paint();
</script></body></html>`;

writeFileSync(OUT, page);
const c = {
  easy: Math.min(nEach, pools.easy.length),
  hard: Math.min(nEach, pools.hard.length),
  unknown: Math.min(nUnknown, pools.unknown.length),
};
console.log(
  `Wrote ${items.length} comments to ${OUT} (${c.easy} labelled easy, ${c.hard} hard, ${c.unknown} unknown)`,
);
console.log("Open it with:  open data/spot-check.html");

#!/usr/bin/env node
// Collects UTM course comments from r/UTM and r/UofT through Reddit's official API.
// Writes data/reddit-reviews.json grouped by course code. Never touches Supabase.
//
// Run: npm run reddit-reviews
// Works without keys through Reddit's public JSON pages. If you have an approved
// API app, set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET to use OAuth instead.
// Optional: REDDIT_QUERIES="bird course,easy course" REDDIT_MAX_POSTS=50

import { mkdir, readFile, writeFile } from "node:fs/promises";

const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET } = process.env;

const USER_AGENT = "courseflix-review-collector/1.0";
const OUT = "data/reddit-reviews.json";
const MAX_POSTS = Number(process.env.REDDIT_MAX_POSTS ?? 40);
const QUERIES = (
  process.env.REDDIT_QUERIES ??
  "bird course,easy course,course review,thoughts on,how is,hardest course,breadth requirement,elective"
)
  .split(",")
  .map((q) => q.trim())
  .filter(Boolean);

// r/UofT covers all three campuses, so only keep its posts that are about UTM.
const SUBREDDITS = [
  { name: "UTM", suffix: "" },
  { name: "UofT", suffix: " UTM" },
];

// Matches CSC108, csc108h5, ANT102H5F, etc. UTM codes end in 5 when a suffix is present.
const COURSE_RE = /\b([A-Z]{3})\s?(\d{3})(?:\s?([HY])(\d))?/gi;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getToken() {
  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) return null;
  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`Token request failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

async function api(token, path) {
  // Stay well under Reddit's 100 requests/minute limit.
  // Public pages allow far fewer requests than OAuth, so wait longer without a token.
  await sleep(token ? 700 : 2500);
  const url = token
    ? `https://oauth.reddit.com${path}`
    : `https://www.reddit.com${path.replace(/^([^?]*)/, "$1.json")}`;
  const headers = { "User-Agent": USER_AGENT };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (res.status === 429) {
    await sleep(60_000);
    return api(token, path);
  }
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

function courseCodes(text, utmOnly) {
  const codes = new Set();
  for (const m of text.matchAll(COURSE_RE)) {
    const [, dept, num, , campus] = m;
    if (campus && campus !== "5") continue; // H1 = St. George, H3 = UTSC
    if (utmOnly && !campus && !/\butm\b|mississauga/i.test(text)) continue;
    codes.add(`${dept.toUpperCase()}${num}`);
  }
  return [...codes];
}

function flattenComments(children, out = []) {
  for (const c of children ?? []) {
    if (c.kind !== "t1") continue;
    const d = c.data;
    if (d.body && d.body !== "[deleted]" && d.body !== "[removed]") {
      out.push({ id: d.id, body: d.body, score: d.score, created: d.created_utc, permalink: d.permalink });
    }
    if (d.replies?.data?.children) flattenComments(d.replies.data.children, out);
  }
  return out;
}

async function main() {
  const token = await getToken();
  let existing = {};
  try {
    existing = JSON.parse(await readFile(OUT, "utf8")).courses ?? {};
  } catch {}
  const courses = existing;
  const seenComments = new Set(Object.values(courses).flat().map((r) => r.id));
  const seenPosts = new Set();

  for (const { name, suffix } of SUBREDDITS) {
    for (const q of QUERIES) {
      const params = new URLSearchParams({ q: q + suffix, restrict_sr: "1", sort: "relevance", t: "all", limit: "100" });
      const listing = await api(token, `/r/${name}/search?${params}`);
      const posts = listing.data.children.slice(0, MAX_POSTS);
      console.log(`r/${name} "${q}": ${posts.length} posts`);

      for (const { data: post } of posts) {
        if (seenPosts.has(post.id)) continue;
        seenPosts.add(post.id);
        const postText = `${post.title}\n${post.selftext ?? ""}`;
        const utmOnly = name !== "UTM";
        if (utmOnly && !/\butm\b|mississauga|h5\b/i.test(postText)) continue;

        const [, comments] = await api(token, `/comments/${post.id}?limit=500&depth=10`);
        for (const c of flattenComments(comments.data.children)) {
          if (seenComments.has(c.id)) continue;
          const codes = courseCodes(c.body, utmOnly && !/\butm\b|mississauga/i.test(postText));
          if (!codes.length) continue;
          seenComments.add(c.id);
          for (const code of codes) {
            (courses[code] ??= []).push({
              id: c.id,
              subreddit: name,
              thread: post.title,
              text: c.body,
              score: c.score,
              date: new Date(c.created * 1000).toISOString().slice(0, 10),
              url: `https://www.reddit.com${c.permalink}`,
            });
          }
        }
      }
    }
  }

  for (const list of Object.values(courses)) list.sort((a, b) => b.score - a.score);
  await mkdir("data", { recursive: true });
  await writeFile(OUT, JSON.stringify({ updated: new Date().toISOString(), courses }, null, 2));
  const total = Object.values(courses).reduce((n, l) => n + l.length, 0);
  console.log(`Saved ${total} comments across ${Object.keys(courses).length} courses to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

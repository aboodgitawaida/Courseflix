#!/usr/bin/env node
// Collects UTM course comments from r/UTM and r/UofT.
// Writes data/reddit-reviews.json grouped by course code. Never touches Supabase.
//
// Run: npm run reddit-reviews
// Without keys it reads the Arctic Shift public Reddit archive
// (https://arctic-shift.photon-reddit.com), since Reddit blocks keyless requests.
// With an approved Reddit API app, set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET
// to read Reddit directly instead.
// Optional: REDDIT_QUERIES="bird course,easy course" REDDIT_MAX_POSTS=50

import { mkdir, readFile, writeFile } from "node:fs/promises";

const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET } = process.env;

const USER_AGENT = "courseflix-review-collector/1.0";
const ARCHIVE = "https://arctic-shift.photon-reddit.com/api";
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
const SUBREDDITS = ["UTM", "UofT"];

// Matches CSC108, csc108h5, ANT102H5F, etc. UTM codes end in 5 when a suffix is present.
const COURSE_RE = /\b([A-Z]{3})\s?(\d{3})(?:\s?([HY])(\d))?/gi;
const UTM_RE = /\butm\b|mississauga/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, headers = {}) {
  await sleep(1000);
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, ...headers } });
  if (res.status === 429) {
    console.log("Rate limited, waiting a minute...");
    await sleep(60_000);
    return getJson(url, headers);
  }
  if (!res.ok) throw new Error(`${url} -> ${res.status} ${(await res.text()).slice(0, 500)}`);
  return res.json();
}

async function redditSource() {
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
  const auth = { Authorization: `Bearer ${(await res.json()).access_token}` };

  const flatten = (children, out = []) => {
    for (const c of children ?? []) {
      if (c.kind !== "t1") continue;
      out.push(c.data);
      if (c.data.replies?.data?.children) flatten(c.data.replies.data.children, out);
    }
    return out;
  };

  return {
    async posts(sub, q) {
      const params = new URLSearchParams({ q, restrict_sr: "1", sort: "relevance", t: "all", limit: "100" });
      const listing = await getJson(`https://oauth.reddit.com/r/${sub}/search?${params}`, auth);
      return listing.data.children.map((c) => c.data);
    },
    async comments(post) {
      const [, comments] = await getJson(`https://oauth.reddit.com/comments/${post.id}?limit=500&depth=10`, auth);
      return flatten(comments.data.children);
    },
  };
}

function archiveSource() {
  return {
    async posts(sub, q) {
      const params = new URLSearchParams({ subreddit: sub, query: q, limit: "100" });
      return (await getJson(`${ARCHIVE}/posts/search?${params}`)).data ?? [];
    },
    async comments(post) {
      const params = new URLSearchParams({ link_id: post.id, limit: "100" });
      return (await getJson(`${ARCHIVE}/comments/search?${params}`)).data ?? [];
    },
  };
}

function courseCodes(text, utmOnly) {
  const codes = new Set();
  for (const m of text.matchAll(COURSE_RE)) {
    const [, dept, num, , campus] = m;
    if (campus && campus !== "5") continue; // H1 = St. George, H3 = UTSC
    if (utmOnly && !campus && !UTM_RE.test(text)) continue;
    codes.add(`${dept.toUpperCase()}${num}`);
  }
  return [...codes];
}

async function main() {
  const useReddit = REDDIT_CLIENT_ID && REDDIT_CLIENT_SECRET;
  const source = useReddit ? await redditSource() : archiveSource();
  console.log(`Reading from ${useReddit ? "Reddit API" : "Arctic Shift archive"}`);

  let courses = {};
  try {
    courses = JSON.parse(await readFile(OUT, "utf8")).courses ?? {};
  } catch {}
  const seenComments = new Set(Object.values(courses).flat().map((r) => r.id));
  const seenPosts = new Set();

  for (const sub of SUBREDDITS) {
    const isUofT = sub !== "UTM";
    for (const q of QUERIES) {
      const posts = (await source.posts(sub, isUofT ? `${q} UTM` : q)).slice(0, MAX_POSTS);
      console.log(`r/${sub} "${q}": ${posts.length} posts`);

      for (const post of posts) {
        if (seenPosts.has(post.id)) continue;
        seenPosts.add(post.id);
        const postText = `${post.title}\n${post.selftext ?? ""}`;
        if (isUofT && !UTM_RE.test(postText) && !/h5\b/i.test(postText)) continue;

        for (const c of await source.comments(post)) {
          if (!c.body || c.body === "[deleted]" || c.body === "[removed]" || seenComments.has(c.id)) continue;
          const codes = courseCodes(c.body, isUofT && !UTM_RE.test(postText));
          if (!codes.length) continue;
          seenComments.add(c.id);
          for (const code of codes) {
            (courses[code] ??= []).push({
              id: c.id,
              subreddit: sub,
              thread: post.title,
              text: c.body,
              score: c.score,
              date: new Date(c.created_utc * 1000).toISOString().slice(0, 10),
              url: `https://www.reddit.com${c.permalink ?? `/r/${sub}/comments/${post.id}/_/${c.id}/`}`,
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

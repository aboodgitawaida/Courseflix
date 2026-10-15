#!/usr/bin/env node
// Collects UTM course comments from r/UTM and r/UofT.
// Writes data/reddit-reviews.json grouped by course code. Never touches Supabase.
//
// Run: npm run reddit-reviews
// Without keys it reads the Arctic Shift public Reddit archive
// (https://arctic-shift.photon-reddit.com), since Reddit blocks keyless requests.
// With an approved Reddit API app, set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET
// to read Reddit directly instead.
// r/UTM is small enough that the archive mode reads every comment ever posted there,
// resuming from where the last run stopped. r/UofT is too big for that, so it uses searches.
// Optional: REDDIT_QUERIES="bird course,easy course" REDDIT_MAX_POSTS=50

import { readFileSync } from "node:fs";
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

// Real UTM course codes from the calendar, so phrases like "top 100" are not counted.
const UTM_COURSES = new Set(
  [
    ...readFileSync(new URL("../src/lib/utm-catalog.ts", import.meta.url), "utf8").matchAll(
      /"([A-Z]{3}\d{3})[HY]5/g,
    ),
  ].map((m) => m[1]),
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, headers = {}, attempt = 1) {
  // A short pause keeps the archive happy; busy replies are retried with longer waits below.
  await sleep(400);
  let res;
  try {
    res = await fetch(url, { headers: { "User-Agent": USER_AGENT, ...headers } });
  } catch (e) {
    // A dropped connection or Wi-Fi blip: wait and try again like a busy reply.
    if (attempt >= 4) throw e;
    console.log(`  network error, retrying in ${15 * attempt}s...`);
    await sleep(15_000 * attempt);
    return getJson(url, headers, attempt + 1);
  }
  // 429 is a rate limit; the archive also answers 422 "Timeout" when it is busy.
  if ((res.status === 429 || res.status === 422 || res.status >= 500) && attempt < 4) {
    const wait = 15_000 * attempt;
    console.log(`  ${res.status}, retrying in ${wait / 1000}s...`);
    await sleep(wait);
    return getJson(url, headers, attempt + 1);
  }
  if (!res.ok) throw new Error(`${url} -> ${res.status} ${(await res.text()).slice(0, 500)}`);
  return res.json();
}

async function redditSource() {
  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`Token request failed: ${res.status} ${await res.text()}`);
  const auth = { Authorization: `Bearer ${(await res.json()).access_token}` };

  return {
    async posts(sub, q) {
      const params = new URLSearchParams({
        q,
        restrict_sr: "1",
        sort: "relevance",
        t: "all",
        limit: "100",
      });
      const listing = await getJson(`https://oauth.reddit.com/r/${sub}/search?${params}`, auth);
      return listing.data.children.map((c) => c.data);
    },
    async comments(post) {
      const [, comments] = await getJson(
        `https://oauth.reddit.com/comments/${post.id}?limit=500&depth=10`,
        auth,
      );
      return flatten(comments.data.children);
    },
  };
}

function archiveSource() {
  return {
    async posts(sub, q) {
      // Full-text search times out on a subreddit as big as r/UofT, so search titles there.
      const field = sub === "UTM" ? "query" : "title";
      const params = new URLSearchParams({ subreddit: sub, [field]: q, limit: "100" });
      return (await getJson(`${ARCHIVE}/posts/search?${params}`)).data ?? [];
    },
    // Every comment in the subreddit, oldest first, starting after the given timestamp.
    async allComments(sub, after) {
      const params = new URLSearchParams({
        subreddit: sub,
        limit: "auto",
        sort: "asc",
        // Only the fields we keep, so each page downloads faster.
        fields: "id,body,score,created_utc,link_id",
      });
      if (after) params.set("after", String(after));
      return (await getJson(`${ARCHIVE}/comments/search?${params}`)).data ?? [];
    },
    async comments(post) {
      const params = new URLSearchParams({ link_id: post.id, limit: "9999" });
      return flatten((await getJson(`${ARCHIVE}/comments/tree?${params}`)).data);
    },
  };
}

// Both Reddit and the archive return comment trees in Reddit's nested format.
function flatten(children, out = []) {
  for (const c of children ?? []) {
    if (c.kind !== "t1") continue;
    out.push(c.data);
    if (c.data.replies?.data?.children) flatten(c.data.replies.data.children, out);
  }
  return out;
}

function courseCodes(text, utmOnly) {
  const codes = new Set();
  for (const m of text.matchAll(COURSE_RE)) {
    const [, dept, num, , campus] = m;
    if (campus && campus !== "5") continue; // H1 = St. George, H3 = UTSC
    if (utmOnly && !campus && !UTM_RE.test(text)) continue;
    const code = `${dept.toUpperCase()}${num}`;
    if (UTM_COURSES.has(code)) codes.add(code);
  }
  return [...codes];
}

// Saved after every thread so stopping the script midway keeps what it found.
async function save(courses, done, cursors) {
  for (const list of Object.values(courses)) list.sort((a, b) => b.score - a.score);
  await mkdir("data", { recursive: true });
  const body = { updated: new Date().toISOString(), doneSearches: [...done], cursors, courses };
  await writeFile(OUT, JSON.stringify(body, null, 2));
}

async function main() {
  const useReddit = REDDIT_CLIENT_ID && REDDIT_CLIENT_SECRET;
  const source = useReddit ? await redditSource() : archiveSource();
  console.log(`Reading from ${useReddit ? "Reddit API" : "Arctic Shift archive"}`);

  let courses = {};
  // Searches that already finished are skipped on reruns. Set REDDIT_REFRESH=1 to redo them.
  let done = new Set();
  let cursors = {};
  try {
    const saved = JSON.parse(await readFile(OUT, "utf8"));
    // Drop codes saved by older runs that are not real UTM courses.
    courses = Object.fromEntries(
      Object.entries(saved.courses ?? {}).filter(([code]) => UTM_COURSES.has(code)),
    );
    if (!process.env.REDDIT_REFRESH) done = new Set(saved.doneSearches ?? []);
    cursors = saved.cursors ?? {};
  } catch {}
  const seenComments = new Set(
    Object.values(courses)
      .flat()
      .map((r) => r.id),
  );
  const seenPosts = new Set();

  const add = (c, sub, thread, utmOnly) => {
    if (!c.body || c.body === "[deleted]" || c.body === "[removed]" || seenComments.has(c.id))
      return;
    const codes = courseCodes(c.body, utmOnly);
    if (!codes.length) return;
    seenComments.add(c.id);
    const linkId = (c.link_id ?? "").replace(/^t3_/, "");
    for (const code of codes) {
      (courses[code] ??= []).push({
        id: c.id,
        subreddit: sub,
        thread,
        text: c.body,
        score: c.score,
        date: new Date(c.created_utc * 1000).toISOString().slice(0, 10),
        url: `https://www.reddit.com${c.permalink ?? `/r/${sub}/comments/${linkId}/_/${c.id}/`}`,
      });
    }
  };

  if (!useReddit) {
    // Page through all of r/UTM. Each page's last timestamp is saved, so a rerun resumes.
    let after = cursors.UTM;
    console.log(
      `Reading every r/UTM comment${after ? ` after ${new Date(after * 1000).toISOString().slice(0, 10)}` : ""}...`,
    );
    for (;;) {
      let page;
      try {
        page = await source.allComments("UTM", after);
      } catch (e) {
        console.log(
          `Stopped at ${after ? new Date(after * 1000).toISOString().slice(0, 10) : "start"}; rerun to continue. (${e.message.slice(-60)})`,
        );
        break;
      }
      if (!page.length) break;
      for (const c of page) add(c, "UTM", "", false);
      after = page.at(-1).created_utc;
      cursors.UTM = after;
      await save(courses, done, cursors);
      console.log(
        `  up to ${new Date(after * 1000).toISOString().slice(0, 10)}: ${seenComments.size} course comments`,
      );
    }
  }

  for (const sub of SUBREDDITS) {
    // The full crawl above already covers r/UTM.
    if (!useReddit && sub === "UTM") continue;
    const isUofT = sub !== "UTM";
    for (const q of QUERIES) {
      const key = `${sub}:${q}`;
      if (done.has(key)) {
        console.log(`r/${sub} "${q}": already done`);
        continue;
      }
      let posts;
      try {
        posts = (await source.posts(sub, isUofT ? `${q} UTM` : q)).slice(0, MAX_POSTS);
      } catch (e) {
        console.log(`r/${sub} "${q}": search skipped (${e.message.slice(-60)})`);
        continue;
      }
      console.log(`r/${sub} "${q}": ${posts.length} posts`);

      for (const post of posts) {
        if (seenPosts.has(post.id)) continue;
        seenPosts.add(post.id);
        const postText = `${post.title}\n${post.selftext ?? ""}`;
        if (isUofT && !UTM_RE.test(postText) && !/h5\b/i.test(postText)) continue;

        let comments;
        try {
          comments = await source.comments(post);
        } catch (e) {
          console.log(`  skipped "${post.title}": ${e.message.slice(0, 120)}`);
          continue;
        }
        const utmOnly = isUofT && !UTM_RE.test(postText);
        for (const c of comments) add(c, sub, post.title, utmOnly);
        await save(courses, done, cursors);
      }
      done.add(key);
      await save(courses, done, cursors);
    }
  }

  const total = Object.values(courses).reduce((n, l) => n + l.length, 0);
  console.log(`Saved ${total} comments across ${Object.keys(courses).length} courses to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

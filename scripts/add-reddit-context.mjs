#!/usr/bin/env node
// Adds context to saved Reddit comments so the classifier can judge them properly:
// the title of the post each comment is under, and the start of the comment (or post)
// it replies to. A bare "MAT102, CSC108" means little alone but a lot under
// "What are the easiest first-year courses?".
// Reads the Arctic Shift archive and updates data/reddit-reviews.json in place.
// Run after scrape-reddit-reviews.mjs and before classify-reddit-reviews.mjs:
//   node scripts/add-reddit-context.mjs
// Takes a few minutes. Comments that already have context are skipped on reruns.

import { readFile, writeFile } from "node:fs/promises";

const ARCHIVE = process.env.ARCHIVE_URL ?? "https://arctic-shift.photon-reddit.com/api";
const FILE = "data/reddit-reviews.json";
const CHUNK = 100;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, attempt = 1) {
  await sleep(400);
  let res;
  try {
    res = await fetch(url, { headers: { "User-Agent": "courseflix-review-collector/1.0" } });
  } catch (e) {
    if (attempt >= 4) throw e;
    await sleep(15_000 * attempt);
    return getJson(url, attempt + 1);
  }
  if ((res.status === 429 || res.status === 422 || res.status >= 500) && attempt < 4) {
    console.log(`  ${res.status}, retrying in ${15 * attempt}s...`);
    await sleep(15_000 * attempt);
    return getJson(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`${url} -> ${res.status} ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).data ?? [];
}

async function byIds(kind, ids) {
  const out = new Map();
  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK);
    try {
      for (const item of await getJson(`${ARCHIVE}/${kind}/ids?ids=${chunk.join(",")}`)) {
        out.set(item.id, item);
      }
    } catch (e) {
      console.log(`  skipped ${chunk.length} ${kind}: ${e.message.slice(0, 100)}`);
    }
    console.log(`  ${kind}: ${Math.min(i + CHUNK, ids.length)}/${ids.length}`);
  }
  return out;
}

const clip = (text, n) => (text ?? "").replace(/\s+/g, " ").trim().slice(0, n);

async function main() {
  const data = JSON.parse(await readFile(FILE, "utf8"));
  const entries = Object.values(data.courses).flat();
  const save = () => writeFile(FILE, JSON.stringify(data, null, 2));

  // 1. Which post and which parent each comment belongs to.
  const missing = [...new Set(entries.filter((e) => !e.contextDone).map((e) => e.id))];
  console.log(`${missing.length} comments need context`);
  if (!missing.length) return;
  const comments = await byIds("comments", missing);

  // 2. Fetch the posts and parent comments they point to.
  const postIds = new Set();
  const parentIds = new Set();
  for (const c of comments.values()) {
    if (c.link_id) postIds.add(c.link_id.replace(/^t3_/, ""));
    if (c.parent_id?.startsWith("t1_")) parentIds.add(c.parent_id.slice(3));
  }
  const posts = await byIds("posts", [...postIds]);
  const parents = await byIds("comments", [...parentIds]);

  // 3. Store the context on every saved copy of each comment.
  let added = 0;
  for (const e of entries) {
    const c = comments.get(e.id);
    if (!c) continue;
    const post = posts.get((c.link_id ?? "").replace(/^t3_/, ""));
    if (post) {
      e.thread = e.thread || clip(post.title, 300);
      e.postText = clip(post.selftext, 400);
    }
    if (c.parent_id?.startsWith("t1_"))
      e.parent = clip(parents.get(c.parent_id.slice(3))?.body, 400);
    e.contextDone = true;
    added++;
  }
  await save();
  console.log(`Added context to ${added} saved comments in ${FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

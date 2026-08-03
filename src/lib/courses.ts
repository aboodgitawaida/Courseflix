import { CATALOG } from "./utm-catalog";
import { MAJORS, type Major } from "./majors";

export type Course = {
  code: string;
  title: string;
  description: string;
  subject: string;
  area: string;
  level: number;
  credits: number;
  prereqRaw: string;
  prereqs: string[];
  hours: string;
  tags: Array<"Bird" | "Easy" | "Heavy" | "Interesting" | "Math-Heavy" | "Project" | "Hidden Gem" | "Lab-Heavy" | "Essay-Heavy" | "Discussion" | "Seminar" | "Intro" | "Upper-year">;
  rating: number;
  difficulty: number;
  workload: number;
  wouldTakeAgain: number;
  vibe: string;
  topProfs: Array<{ name: string; rmp: number; tags: string[] }>;
  reviews: Array<{ source: "reddit" | "rmp"; quote: string }>;
  poster: [string, string];
  majors: string[];
};

const DIST_NAME: Record<string, string> = { S: "Science", H: "Humanities", O: "Social Science" };

const PALETTE: Array<[string, string]> = [
  ["#0d1b2a", "#1b4332"],
  ["#0f3d2e", "#2dd4a8"],
  ["#141432", "#4f46e5"],
  ["#0c2340", "#2d8a9e"],
  ["#1a1a2e", "#334155"],
  ["#1a1a1a", "#e85d3a"],
  ["#0d0d0d", "#c9a84c"],
  ["#052e16", "#22c55e"],
  ["#1a0a1a", "#e11d74"],
  ["#0a1628", "#38bdf8"],
  ["#1a0b2e", "#a855f7"],
  ["#1c1917", "#d4a373"],
];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const coreByPrefix = new Map<string, string[]>();
const supportByPrefix = new Map<string, string[]>();
for (const m of MAJORS) {
  for (const p of m.core) coreByPrefix.set(p, [...(coreByPrefix.get(p) ?? []), m.id]);
  for (const p of m.support) supportByPrefix.set(p, [...(supportByPrefix.get(p) ?? []), m.id]);
}

function buildCourse(row: (typeof CATALOG)[number]): Course {
  const [code, title, description, dist, prereqRaw, hours] = row;
  const subject = code.replace(/[0-9].*$/, "");
  const level = Number(code.replace(/^[A-Z]+/, "").slice(0, 1)) * 100;
  const credits = code.includes("Y5") ? 1 : 0.5;
  const prereqs = [...new Set(prereqRaw.match(/[A-Z]{2,4}\d{3}[HY]\d/g) ?? [])];
  const areas = [...dist].map((d) => DIST_NAME[d]).filter(Boolean);
  const area = areas.length ? areas.join(" / ") : subject;

  const h = hash(code);
  const lecture = Number(hours.match(/(\d+)L/)?.[1] ?? 24);
  const practical = Number(hours.match(/(\d+)P/)?.[1] ?? 0);
  const load = lecture + practical * 1.2 + (credits === 1 ? 24 : 0);

  const tags: Course["tags"] = [];
  if (level <= 200) tags.push("Intro");
  if (level >= 400) tags.push("Seminar");
  else if (level >= 300) tags.push("Upper-year");
  if (dist.includes("S") && ["MAT", "STA", "CSC", "PHY", "AST", "ECO"].includes(subject)) tags.push("Math-Heavy");
  if (practical >= 24) tags.push("Lab-Heavy");
  if (dist.includes("H") || ["ENG", "HIS", "PHL", "RLG", "WGS", "WRI"].includes(subject)) tags.push("Essay-Heavy");
  if (/seminar|discussion/i.test(description)) tags.push("Discussion");
  if (/project|studio|practicum|field/i.test(description)) tags.push("Project");
  if (load >= 70) tags.push("Heavy");
  else if (load <= 40 && level <= 200) tags.push("Easy");

  const difficulty = Math.min(5, Math.max(1.5, level / 130 + (h % 7) / 8));
  const workload = Math.min(5, Math.max(1.5, load / 22 + (h % 5) / 8));
  const rating = Math.min(5, Math.max(2.4, 3.4 + ((h >> 3) % 13) / 10));
  const wouldTakeAgain = Math.round(50 + ((h >> 5) % 45));

  const majorIds = [
    ...new Set([...(coreByPrefix.get(subject) ?? []), ...(supportByPrefix.get(subject) ?? [])]),
  ];

  return {
    code,
    title,
    description,
    subject,
    area,
    level,
    credits,
    prereqRaw,
    prereqs,
    hours,
    tags,
    rating: Math.round(rating * 10) / 10,
    difficulty: Math.round(difficulty * 10) / 10,
    workload: Math.round(workload * 10) / 10,
    wouldTakeAgain,
    vibe: "",
    topProfs: [],
    reviews: [],
    poster: PALETTE[hash(subject) % PALETTE.length]!,
    majors: majorIds,
  };
}

export const COURSES: Course[] = CATALOG.map(buildCourse);

const byCode = new Map(COURSES.map((c) => [c.code, c]));
export const getCourse = (code: string) =>
  byCode.get(code.toUpperCase()) ?? COURSES.find((c) => c.code.toLowerCase() === code.toLowerCase());

export type Rail = { title: string; blurb?: string; codes: string[] };

const uniq = (a: string[]) => [...new Set(a)];

function coursesFor(major: Major | undefined, kind: "core" | "support") {
  if (!major) return [];
  const prefixes = kind === "core" ? major.core : major.support;
  return COURSES.filter((c) => prefixes.includes(c.subject));
}

export function getFeaturedForMajor(majorId: string | null): Course {
  const major = MAJORS.find((m) => m.id === majorId);
  const pool = coursesFor(major, "core");
  const list = pool.length ? pool : COURSES;
  return (
    [...list].sort((a, b) => b.rating - a.rating || a.code.localeCompare(b.code))[0] ?? COURSES[0]!
  );
}

export type Badge = { label: string; emoji: string; tone: "bird" | "essay" | "exam" | "project" };

export function getBadges(c: Course): Badge[] {
  const out: Badge[] = [];
  if (c.tags.includes("Easy") || (c.level <= 200 && c.workload <= 2.6))
    out.push({ label: "Bird Course", emoji: "🦅", tone: "bird" });
  if (c.tags.includes("Essay-Heavy")) out.push({ label: "Essay Heavy", emoji: "📝", tone: "essay" });
  if (c.tags.includes("Project") || c.tags.includes("Lab-Heavy"))
    out.push({ label: "Group Project", emoji: "💻", tone: "project" });
  if (c.tags.includes("Heavy") || c.difficulty >= 4)
    out.push({ label: "Exam Heavy", emoji: "📊", tone: "exam" });
  return out.slice(0, 2);
}

export function isCourseworkHeavy(c: Course) {
  return c.tags.includes("Project") || c.tags.includes("Lab-Heavy") || c.tags.includes("Seminar") || c.tags.includes("Discussion");
}

export function searchCourses(query: string, limit = 30): Course[] {
  const s = query.trim().toLowerCase();
  if (!s) return [];
  const scored: Array<{ c: Course; score: number }> = [];
  for (const c of COURSES) {
    const code = c.code.toLowerCase();
    const title = c.title.toLowerCase();
    let score = 0;
    if (code === s) score = 100;
    else if (code.startsWith(s)) score = 80;
    else if (code.includes(s)) score = 60;
    else if (title.startsWith(s)) score = 50;
    else if (title.includes(s)) score = 40;
    else if (c.description.toLowerCase().includes(s)) score = 15;
    if (score) scored.push({ c, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || b.c.rating - a.c.rating || a.c.code.localeCompare(b.c.code))
    .slice(0, limit)
    .map((x) => x.c);
}

export function getRailsForMajor(majorId: string | null): Rail[] {
  const major = MAJORS.find((m) => m.id === majorId);
  const core = coursesFor(major, "core");
  const support = coursesFor(major, "support");
  const codes = (list: Course[], n = 14) => uniq(list.slice(0, n).map((c) => c.code));
  const byRating = (l: Course[]) => [...l].sort((a, b) => b.rating - a.rating || a.code.localeCompare(b.code));

  const scope = core.concat(support);
  const pool = scope.length >= 10 ? scope : COURSES;

  const first = core.filter((c) => c.level <= 200).sort((a, b) => a.code.localeCompare(b.code));
  const upper = byRating(core.filter((c) => c.level >= 300));
  const seminars = byRating(core.filter((c) => c.level >= 400));

  const trending = byRating(pool.filter((c) => c.level <= 300)).slice(0, 40);
  const birds = byRating(pool.filter((c) => c.tags.includes("Easy") && c.level <= 200));
  const coursework = byRating(pool.filter(isCourseworkHeavy));
  const firstYearTop = byRating(pool.filter((c) => c.level === 100));
  const prereqCounts = new Map<string, number>();
  for (const c of COURSES) for (const p of c.prereqs) prereqCounts.set(p, (prereqCounts.get(p) ?? 0) + 1);
  const gateways = pool
    .filter((c) => (prereqCounts.get(c.code) ?? 0) > 0)
    .sort((a, b) => (prereqCounts.get(b.code) ?? 0) - (prereqCounts.get(a.code) ?? 0));

  const rails: Rail[] = [
    { title: "🔥 Trending at UTM", blurb: "What students are browsing most right now", codes: codes(trending) },
    { title: "🎯 Start here", blurb: `First- and second-year ${major?.name ?? "UTM"} courses`, codes: codes(first) },
    { title: "🦅 Easiest distribution requirements", blurb: "Lighter contact hours, intro level — classic bird picks", codes: codes(birds) },
    { title: "⚡ No final exam / coursework heavy", blurb: "Projects, labs and seminars instead of one big exam", codes: codes(coursework) },
    { title: "⭐ Top rated first-year courses", blurb: "100-level courses students rate highest", codes: codes(firstYearTop) },
    { title: "📚 Popular program prerequisites", blurb: "Courses that unlock the most upper-year options", codes: codes(gateways) },
    { title: "🧩 Required support courses", blurb: "The other subjects your program needs", codes: codes(byRating(support)) },
    { title: "🚀 Upper-year picks", blurb: "Once you've cleared the prereqs", codes: codes(upper) },
    { title: "🎓 Seminars & capstones", blurb: "400-level, small classes", codes: codes(seminars) },
  ];

  return rails.filter((r) => r.codes.length > 0);
}

export const SUBJECTS = [...new Set(COURSES.map((c) => c.subject))].sort();


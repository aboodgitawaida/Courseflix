import { CATALOG } from "./utm-catalog";
import { MAJORS, type Major } from "./majors";

export type CourseTag =
  | "Bird"
  | "Easy"
  | "Heavy"
  | "Interesting"
  | "Math-Heavy"
  | "Project"
  | "Hidden Gem"
  | "Lab-Heavy"
  | "Essay-Heavy"
  | "Discussion"
  | "Seminar"
  | "Intro"
  | "Upper-year"
  | "Core CS"
  | "Exam-Heavy";

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
  tags: CourseTag[];
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

export const SUBJECT_ART: Record<string, { gradient: string; accent: string; motif: string }> = {
  CSC: { gradient: "from-cyan-950/90 via-cyan-950/40 to-black", accent: "#22d3ee", motif: "grid" },
  POL: { gradient: "from-amber-950/90 via-amber-950/40 to-black", accent: "#f59e0b", motif: "columns" },
  ANT: { gradient: "from-orange-950/90 via-orange-950/40 to-black", accent: "#fb923c", motif: "relic" },
  ENG: { gradient: "from-stone-900 via-stone-900/50 to-black", accent: "#d6bfa3", motif: "books" },
  BIO: { gradient: "from-emerald-950/90 via-emerald-950/40 to-black", accent: "#34d399", motif: "cells" },
  MAT: { gradient: "from-blue-950/90 via-blue-950/40 to-black", accent: "#60a5fa", motif: "geometry" },
  STA: { gradient: "from-blue-950/90 via-indigo-950/40 to-black", accent: "#818cf8", motif: "geometry" },
  SOC: { gradient: "from-purple-950/90 via-purple-950/40 to-black", accent: "#c084fc", motif: "neural" },
  PSY: { gradient: "from-purple-950/90 via-violet-950/40 to-black", accent: "#a78bfa", motif: "neural" },
  ECO: { gradient: "from-teal-950/90 via-teal-950/40 to-black", accent: "#2dd4bf", motif: "finance" },
  MGT: { gradient: "from-teal-950/90 via-emerald-950/40 to-black", accent: "#14b8a6", motif: "finance" },
  MGM: { gradient: "from-teal-950/90 via-emerald-950/40 to-black", accent: "#14b8a6", motif: "finance" },
};

const DEFAULT_ART = { gradient: "from-zinc-900 via-zinc-900/50 to-black", accent: "#e50914", motif: "grid" };

export const getArt = (subject: string) => SUBJECT_ART[subject] ?? DEFAULT_ART;

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const RATING_OVERRIDES: Record<string, number> = {
  CSC108H5: 4.5,
  CSC148H5: 4.0,
  CSC207H5: 3.9,
  CSC236H5: 3.4,
  CSC263H5: 3.3,
  CSC290H5: 3.0,
  CSC301H5: 4.1,
  CSC343H5: 3.8,
  MAT102H5: 3.2,
  MAT134H5: 3.0,
  MAT135H5: 3.1,
  MAT137Y5: 3.4,
  MAT223H5: 3.6,
  MAT232H5: 3.3,
  STA215H5: 3.5,
  STA256H5: 3.1,
  STA260H5: 3.0,
  ANT101H5: 4.4,
  ANT102H5: 4.2,
  ANT222H5: 4.6,
  PSY100H5: 4.3,
  PSY201H5: 3.2,
  BIO152H5: 3.7,
  BIO153H5: 3.6,
  CHM110H5: 3.3,
  CHM120H5: 3.2,
  PHY136H5: 3.1,
  ECO100Y5: 3.4,
  ECO101H5: 3.5,
  ECO200Y5: 2.9,
  MGT120H5: 3.6,
  MGM101H5: 4.0,
  SOC100H5: 4.1,
  POL112H5: 4.2,
  POL113H5: 4.0,
  PHL101H5: 4.3,
  RLG101H5: 4.4,
  ENG100H5: 4.0,
  WRI173H5: 4.5,
  CCT109H5: 4.2,
  DRE121H5: 4.6,
  FAH101H5: 4.4,
  CIN101H5: 4.7,
};

const BIRD_BLOCKLIST = new Set([
  "CSC263H5",
  "CSC236H5",
  "CSC207H5",
  "CSC148H5",
  "MAT102H5",
  "MAT134H5",
  "MAT135H5",
  "MAT137Y5",
  "STA256H5",
  "STA260H5",
  "PHY136H5",
  "CHM110H5",
  "ECO200Y5",
]);

const EXAM_HEAVY_FORCE = new Set(["CSC263H5", "CSC236H5", "STA256H5", "STA260H5", "MAT102H5", "ECO200Y5"]);

const HARD_SUBJECTS = ["MAT", "STA", "CSC", "PHY", "AST", "CHM"];

function sampleRating(code: string, level: number, subject: string) {
  const override = RATING_OVERRIDES[code];
  if (override) return override;
  const h = hash(code);
  let r = 3.2 + ((h >> 3) % 15) / 10;
  if (HARD_SUBJECTS.includes(subject)) r -= 0.45;
  if (level >= 300) r -= 0.15;
  if (level <= 200 && !HARD_SUBJECTS.includes(subject)) r += 0.25;
  return Math.round(Math.min(4.9, Math.max(2.8, r)) * 10) / 10;
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

  const tags: CourseTag[] = [];
  if (level <= 100) tags.push("Intro");
  if (level >= 400) tags.push("Seminar");
  else if (level >= 300) tags.push("Upper-year");
  if (dist.includes("S") && ["MAT", "STA", "CSC", "PHY", "AST", "ECO"].includes(subject)) tags.push("Math-Heavy");
  if (practical >= 24) tags.push("Lab-Heavy");
  if (dist.includes("H") || ["ENG", "HIS", "PHL", "RLG", "WGS", "WRI"].includes(subject)) tags.push("Essay-Heavy");
  if (/seminar|discussion/i.test(description)) tags.push("Discussion");
  if (/project|studio|practicum|field/i.test(description)) tags.push("Project");
  if (load >= 70) tags.push("Heavy");
  else if (load <= 40 && level <= 200 && !BIRD_BLOCKLIST.has(code)) tags.push("Easy");

  if (subject === "CSC" && level >= 200) {
    if (!tags.includes("Upper-year")) tags.push("Upper-year");
    tags.push("Core CS");
  }
  if (EXAM_HEAVY_FORCE.has(code)) tags.push("Exam-Heavy");

  const difficulty = Math.min(5, Math.max(1.5, level / 130 + (h % 7) / 8));
  const workload = Math.min(5, Math.max(1.5, load / 22 + (h % 5) / 8));
  const rating = sampleRating(code, level, subject);
  const wouldTakeAgain = Math.round(Math.min(96, Math.max(42, rating * 18 + ((h >> 5) % 9))));

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
    tags: [...new Set(tags)],
    rating,
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

const unlockedBy = new Map<string, string[]>();
for (const c of COURSES) {
  for (const p of c.prereqs) unlockedBy.set(p, [...(unlockedBy.get(p) ?? []), c.code]);
}
export const getNextSteps = (code: string) => (unlockedBy.get(code.toUpperCase()) ?? []).slice(0, 6);

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

export function getMatchScore(course: Course, majorId: string | null): number | null {
  const major = MAJORS.find((m) => m.id === majorId);
  if (!major) return null;
  const h = hash(course.code + major.id) % 6;
  if (major.core.includes(course.subject)) return Math.min(99, 90 + h);
  if (major.support.includes(course.subject)) return 74 + h;
  if (course.level <= 200) return 52 + h;
  return 38 + h;
}

export type Badge = { label: string; emoji: string; tone: "bird" | "essay" | "exam" | "project" };

export function isBird(c: Course) {
  if (BIRD_BLOCKLIST.has(c.code)) return false;
  if (c.tags.includes("Math-Heavy") || c.tags.includes("Heavy") || c.tags.includes("Exam-Heavy")) return false;
  if (c.level > 200) return false;
  return c.tags.includes("Easy") || c.workload <= 2.6;
}

export function getBadges(c: Course): Badge[] {
  const out: Badge[] = [];
  if (isBird(c)) out.push({ label: "Bird Course", emoji: "🦅", tone: "bird" });
  if (c.tags.includes("Exam-Heavy") || c.tags.includes("Heavy") || c.difficulty >= 4)
    out.push({ label: "Exam Heavy", emoji: "📊", tone: "exam" });
  if (c.tags.includes("Essay-Heavy")) out.push({ label: "Essay Heavy", emoji: "📝", tone: "essay" });
  if (c.tags.includes("Project") || c.tags.includes("Lab-Heavy"))
    out.push({ label: "Group Project", emoji: "💻", tone: "project" });
  return out.slice(0, 2);
}

export function isCourseworkHeavy(c: Course) {
  return c.tags.includes("Project") || c.tags.includes("Lab-Heavy") || c.tags.includes("Seminar") || c.tags.includes("Discussion");
}

export function examWeight(c: Course) {
  if (isCourseworkHeavy(c)) return 20;
  if (c.tags.includes("Exam-Heavy")) return 60;
  if (c.tags.includes("Math-Heavy")) return 50;
  if (c.tags.includes("Essay-Heavy")) return 25;
  return 40;
}

export type FilterId = "all" | "bird" | "science" | "social" | "humanities" | "l100" | "l200" | "noexam";

export const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "All" },
  { id: "bird", label: "🦅 Bird Courses" },
  { id: "science", label: "🧪 Science" },
  { id: "social", label: "⚖️ Social Science" },
  { id: "humanities", label: "🎨 Humanities" },
  { id: "l100", label: "100-Level" },
  { id: "l200", label: "200-Level" },
  { id: "noexam", label: "⚡ No Exam" },
];

export function matchesFilter(c: Course, f: FilterId) {
  switch (f) {
    case "bird":
      return isBird(c);
    case "science":
      return c.area.includes("Science") && !c.area.includes("Social");
    case "social":
      return c.area.includes("Social Science");
    case "humanities":
      return c.area.includes("Humanities");
    case "l100":
      return c.level === 100;
    case "l200":
      return c.level === 200;
    case "noexam":
      return isCourseworkHeavy(c);
    default:
      return true;
  }
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
    else if (c.area.toLowerCase().includes(s)) score = 20;
    else if (c.tags.some((t) => t.toLowerCase().includes(s))) score = 18;
    else if (c.description.toLowerCase().includes(s)) score = 15;
    if (score) scored.push({ c, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || b.c.rating - a.c.rating || a.c.code.localeCompare(b.c.code))
    .slice(0, limit)
    .map((x) => x.c);
}

export function getRailsForMajor(majorId: string | null, filter: FilterId = "all"): Rail[] {
  const major = MAJORS.find((m) => m.id === majorId);
  const keep = (l: Course[]) => l.filter((c) => matchesFilter(c, filter));
  const core = keep(coursesFor(major, "core"));
  const support = keep(coursesFor(major, "support"));
  const codes = (list: Course[], n = 14) => uniq(list.slice(0, n).map((c) => c.code));
  const byRating = (l: Course[]) => [...l].sort((a, b) => b.rating - a.rating || a.code.localeCompare(b.code));

  const scope = core.concat(support);
  const pool = scope.length >= 10 ? scope : keep(COURSES);

  const first = core.filter((c) => c.level <= 200).sort((a, b) => a.code.localeCompare(b.code));
  const upper = byRating(core.filter((c) => c.level >= 300));
  const seminars = byRating(core.filter((c) => c.level >= 400));

  const trending = byRating(pool.filter((c) => c.level <= 300)).slice(0, 40);
  const birds = byRating(pool.filter(isBird));
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

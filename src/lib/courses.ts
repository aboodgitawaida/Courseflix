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
  subject: string;
  area: string;
  level: number;
  credits: number;
  prereqRaw: string;
  prereqs: string[];
  hours: string;
  tags: CourseTag[];
  workload: number;
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
  POL: {
    gradient: "from-amber-950/90 via-amber-950/40 to-black",
    accent: "#f59e0b",
    motif: "columns",
  },
  ANT: {
    gradient: "from-orange-950/90 via-orange-950/40 to-black",
    accent: "#fb923c",
    motif: "relic",
  },
  ENG: { gradient: "from-stone-900 via-stone-900/50 to-black", accent: "#d6bfa3", motif: "books" },
  BIO: {
    gradient: "from-emerald-950/90 via-emerald-950/40 to-black",
    accent: "#34d399",
    motif: "cells",
  },
  MAT: {
    gradient: "from-blue-950/90 via-blue-950/40 to-black",
    accent: "#60a5fa",
    motif: "geometry",
  },
  STA: {
    gradient: "from-blue-950/90 via-indigo-950/40 to-black",
    accent: "#818cf8",
    motif: "geometry",
  },
  SOC: {
    gradient: "from-purple-950/90 via-purple-950/40 to-black",
    accent: "#c084fc",
    motif: "neural",
  },
  PSY: {
    gradient: "from-purple-950/90 via-violet-950/40 to-black",
    accent: "#a78bfa",
    motif: "neural",
  },
  ECO: {
    gradient: "from-teal-950/90 via-teal-950/40 to-black",
    accent: "#2dd4bf",
    motif: "finance",
  },
  MGT: {
    gradient: "from-teal-950/90 via-emerald-950/40 to-black",
    accent: "#14b8a6",
    motif: "finance",
  },
  MGM: {
    gradient: "from-teal-950/90 via-emerald-950/40 to-black",
    accent: "#14b8a6",
    motif: "finance",
  },
};

const DEFAULT_ART = {
  gradient: "from-zinc-900 via-zinc-900/50 to-black",
  accent: "#e50914",
  motif: "grid",
};

export const getArt = (subject: string) => SUBJECT_ART[subject] ?? DEFAULT_ART;

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

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

const coreByPrefix = new Map<string, string[]>();
const supportByPrefix = new Map<string, string[]>();
for (const m of MAJORS) {
  for (const p of m.core) coreByPrefix.set(p, [...(coreByPrefix.get(p) ?? []), m.id]);
  for (const p of m.support) supportByPrefix.set(p, [...(supportByPrefix.get(p) ?? []), m.id]);
}

function buildCourse(row: (typeof CATALOG)[number]): Course {
  const [code, title, dist, prereqRaw, hours, flags] = row;
  const subject = code.replace(/[0-9].*$/, "");
  const level = Number(code.replace(/^[A-Z]+/, "").slice(0, 1)) * 100;
  const credits = code.includes("Y5") ? 1 : 0.5;
  const prereqs = [...new Set(prereqRaw.match(/[A-Z]{2,4}\d{3}[HY]\d/g) ?? [])];
  const areas = [...dist].map((d) => DIST_NAME[d]).filter(Boolean);
  const area = areas.length ? areas.join(" / ") : subject;

  const lecture = Number(hours.match(/(\d+)L/)?.[1] ?? 24);
  const practical = Number(hours.match(/(\d+)P/)?.[1] ?? 0);
  const load = lecture + practical * 1.2 + (credits === 1 ? 24 : 0);

  const tags: CourseTag[] = [];
  if (level <= 100) tags.push("Intro");
  if (level >= 400) tags.push("Seminar");
  else if (level >= 300) tags.push("Upper-year");
  if (dist.includes("S") && ["MAT", "STA", "CSC", "PHY", "AST", "ECO"].includes(subject))
    tags.push("Math-Heavy");
  if (practical >= 24) tags.push("Lab-Heavy");
  if (dist.includes("H") || ["ENG", "HIS", "PHL", "RLG", "WGS", "WRI"].includes(subject))
    tags.push("Essay-Heavy");
  if (flags.includes("D")) tags.push("Discussion");
  if (flags.includes("P")) tags.push("Project");
  if (load >= 70) tags.push("Heavy");

  if (subject === "CSC" && level >= 200) {
    if (!tags.includes("Upper-year")) tags.push("Upper-year");
    tags.push("Core CS");
  }
  // Derived only from listed contact hours; drives the light-workload signal.
  const workload = Math.min(5, Math.max(1.5, load / 22));

  const majorIds = [
    ...new Set([...(coreByPrefix.get(subject) ?? []), ...(supportByPrefix.get(subject) ?? [])]),
  ];

  return {
    code,
    title,
    subject,
    area,
    level,
    credits,
    prereqRaw,
    prereqs,
    hours,
    tags: [...new Set(tags)],
    workload: Math.round(workload * 10) / 10,
    poster: PALETTE[hash(subject) % PALETTE.length]!,
    majors: majorIds,
  };
}

export const COURSES: Course[] = CATALOG.map(buildCourse);

const byCode = new Map(COURSES.map((c) => [c.code, c]));
export const getCourse = (code: string) =>
  byCode.get(code.toUpperCase()) ??
  COURSES.find((c) => c.code.toLowerCase() === code.toLowerCase());

const unlockedBy = new Map<string, string[]>();
for (const c of COURSES) {
  for (const p of c.prereqs) unlockedBy.set(p, [...(unlockedBy.get(p) ?? []), c.code]);
}
export const getNextSteps = (code: string) =>
  (unlockedBy.get(code.toUpperCase()) ?? []).slice(0, 6);

export type Rail = { title: string; blurb?: string; codes: string[] };

const uniq = (a: string[]) => [...new Set(a)];

function coursesFor(major: Major | undefined, kind: "core" | "support") {
  if (!major) return [];
  const prefixes = kind === "core" ? major.core : major.support;
  return COURSES.filter((c) => prefixes.includes(c.subject));
}

// How many courses list each course as a prerequisite: a proxy for how many
// doors a course opens, used to rank the no-program feed.
const unlockCount = new Map<string, number>();
for (const c of COURSES)
  for (const p of c.prereqs) unlockCount.set(p, (unlockCount.get(p) ?? 0) + 1);
const unlocks = (c: Course) => unlockCount.get(c.code) ?? 0;
const byUnlocks = (list: Course[]) =>
  [...list].sort((a, b) => unlocks(b) - unlocks(a) || a.code.localeCompare(b.code));

/** Interleaves subjects (round-robin, keeping each subject's order) for a varied row. */
function diverse(list: Course[]): Course[] {
  const bySubject = new Map<string, Course[]>();
  for (const c of list) bySubject.set(c.subject, [...(bySubject.get(c.subject) ?? []), c]);
  const queues = [...bySubject.values()];
  const out: Course[] = [];
  for (let i = 0; out.length < list.length; i++) {
    for (const q of queues) if (q[i]) out.push(q[i]!);
  }
  return out;
}

// Big, well-known UTM first-year courses across faculties. They lead the feed for
// visitors who haven't picked a program, so the first thing anyone sees is
// recognisable rather than alphabetical (which put Anthropology first).
const STARTER_CODES = [
  "PSY100Y5",
  "CSC108H5",
  "ECO101H5",
  "MGM101H5",
  "BIO152H5",
  "MAT135H5",
  "SOC100H5",
  "CCT109H5",
  "POL111H5",
  "CHM110H5",
  "ENG110H5",
  "MAT102H5",
  "ECO102H5",
  "ANT101H5",
  "LIN101H5",
  "GGR111H5",
  "STA107H5",
  "HIS101H5",
  "PHY136H5",
  "FAH101H5",
  "CIN101H5",
  "AST101H5",
  "ENV100Y5",
  "WRI173H5",
];
const STARTERS = STARTER_CODES.map((code) => byCode.get(code)).filter((c): c is Course => !!c);

const DEFAULT_FEATURED = STARTERS[0] ?? COURSES[0]!;

/**
 * The hero deck: the program's core courses (alphabetical, subjects interleaved so a
 * multi-subject program doesn't show five of one), or the starter courses without one.
 * Programs with only a handful of core courses are topped up from their support
 * subjects, then the starters, so the deck still has cards to swipe through.
 */
export function getFeaturedDeckForMajor(majorId: string | null, n = 5): Course[] {
  const major = MAJORS.find((m) => m.id === majorId);
  const ranked = (kind: "core" | "support") =>
    diverse([...coursesFor(major, kind)].sort((a, b) => a.code.localeCompare(b.code)));
  const deck = new Map<string, Course>();
  for (const c of [...ranked("core"), ...ranked("support"), ...STARTERS]) {
    if (deck.size >= n) break;
    deck.set(c.code, c);
  }
  return deck.size ? [...deck.values()] : [DEFAULT_FEATURED];
}

export function getFeaturedForMajor(majorId: string | null): Course {
  return getFeaturedDeckForMajor(majorId, 1)[0]!;
}

export function getProgramMatch(
  course: Course,
  majorId: string | null,
): "Core program subject" | "Program support subject" | "Outside selected program" | null {
  const major = MAJORS.find((m) => m.id === majorId);
  if (!major) return null;
  if (major.core.includes(course.subject)) return "Core program subject";
  if (major.support.includes(course.subject)) return "Program support subject";
  return "Outside selected program";
}

export type Badge = { label: string; emoji: string; tone: "bird" | "essay" | "exam" | "project" };

export function isBird(c: Course) {
  if (BIRD_BLOCKLIST.has(c.code)) return false;
  if (c.tags.includes("Math-Heavy") || c.tags.includes("Heavy") || c.tags.includes("Exam-Heavy"))
    return false;
  if (c.level > 200) return false;
  return c.tags.includes("Easy") || c.workload <= 2.6;
}

export function getBadges(c: Course): Badge[] {
  const out: Badge[] = [];
  if (isBird(c)) out.push({ label: "Light workload signal", emoji: "🦅", tone: "bird" });
  if (c.tags.includes("Essay-Heavy"))
    out.push({ label: "Essay signal", emoji: "📝", tone: "essay" });
  if (c.tags.includes("Project") || c.tags.includes("Lab-Heavy"))
    out.push({ label: "Project/lab signal", emoji: "💻", tone: "project" });
  return out.slice(0, 2);
}

export function isCourseworkHeavy(c: Course) {
  return (
    c.tags.includes("Project") ||
    c.tags.includes("Lab-Heavy") ||
    c.tags.includes("Seminar") ||
    c.tags.includes("Discussion")
  );
}

export type FilterId = "all" | "bird" | "science" | "social" | "humanities" | "l100" | "l200";

export const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "All" },
  { id: "bird", label: "🦅 Light workload signals" },
  { id: "science", label: "🧪 Science" },
  { id: "social", label: "⚖️ Social Science" },
  { id: "humanities", label: "🎨 Humanities" },
  { id: "l100", label: "100-Level" },
  { id: "l200", label: "200-Level" },
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
    default:
      return true;
  }
}

export function searchCourses(
  query: string,
  limit = 30,
  descriptions?: Record<string, string>,
): Course[] {
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
    else if (descriptions?.[c.code]?.toLowerCase().includes(s)) score = 15;
    if (score) scored.push({ c, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.c.code.localeCompare(b.c.code))
    .slice(0, limit)
    .map((x) => x.c);
}

export function getRailsForMajor(majorId: string | null, filter: FilterId = "all"): Rail[] {
  const major = MAJORS.find((m) => m.id === majorId);
  const keep = (l: Course[]) => l.filter((c) => matchesFilter(c, filter));
  const core = keep(coursesFor(major, "core"));
  const support = keep(coursesFor(major, "support"));
  const codes = (list: Course[], n = 14) => uniq(list.slice(0, n).map((c) => c.code));
  const byCode = (l: Course[]) => [...l].sort((a, b) => a.code.localeCompare(b.code));

  const scope = core.concat(support);
  const programScoped = scope.length >= 10;
  const pool = programScoped ? scope : keep(COURSES);
  // Without a program, alphabetical order put Anthropology first in every row.
  // Rank by how many courses each one unlocks and mix subjects instead.
  const order = (l: Course[]) => (programScoped ? byCode(l) : diverse(byUnlocks(l)));

  const first = major
    ? core.filter((c) => c.level <= 200).sort((a, b) => a.code.localeCompare(b.code))
    : diverse(byUnlocks(pool.filter((c) => c.level <= 100 && !STARTERS.includes(c))));
  const upper = byCode(core.filter((c) => c.level >= 300));
  const seminars = byCode(core.filter((c) => c.level >= 400));

  const trending = programScoped
    ? byCode(pool.filter((c) => c.level <= 300)).slice(0, 40)
    : keep(STARTERS);
  const birds = order(pool.filter(isBird));
  const coursework = order(pool.filter(isCourseworkHeavy));
  const gateways = programScoped
    ? byUnlocks(pool.filter((c) => unlocks(c) > 0))
    : diverse(byUnlocks(pool.filter((c) => unlocks(c) > 0)));

  const rails: Rail[] = [
    {
      title: programScoped ? "📚 Your program at a glance" : "🔥 UTM's big first-years",
      blurb: programScoped
        ? "First-, second- and third-year courses across your program's subjects"
        : "The courses almost everyone at UTM takes or considers",
      codes: codes(trending),
    },
    {
      title: "🎯 Start here",
      blurb: major
        ? `First- and second-year ${major.name} courses`
        : "More first-year courses that open doors across UTM",
      codes: codes(first),
    },
    {
      title: "🦅 Lighter workload signals",
      blurb:
        "Intro courses with lighter listed contact-hour signals — verify the workload yourself",
      codes: codes(birds),
    },
    {
      title: "🧪 Coursework signals",
      blurb:
        "Descriptions mention projects, labs, seminars, or discussion; assessment details are not verified",
      codes: codes(coursework),
    },
    {
      title: "📚 Popular program prerequisites",
      blurb: "Courses that unlock the most upper-year options",
      codes: codes(gateways),
    },
    {
      title: "🧩 Required support courses",
      blurb: "The other subjects your program needs",
      codes: codes(byCode(support)),
    },
    { title: "🚀 Upper-year picks", blurb: "Once you've cleared the prereqs", codes: codes(upper) },
    { title: "🎓 Seminars & capstones", blurb: "400-level, small classes", codes: codes(seminars) },
  ];

  return rails.filter((r) => r.codes.length > 0);
}

export const SUBJECTS = [...new Set(COURSES.map((c) => c.subject))].sort();

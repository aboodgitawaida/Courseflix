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

export function getRailsForMajor(majorId: string | null): Rail[] {
  const major = MAJORS.find((m) => m.id === majorId);
  const core = coursesFor(major, "core");
  const support = coursesFor(major, "support");
  const codes = (list: Course[], n = 14) => uniq(list.slice(0, n).map((c) => c.code));
  const byRating = (l: Course[]) => [...l].sort((a, b) => b.rating - a.rating || a.code.localeCompare(b.code));

  const first = core.filter((c) => c.level <= 200).sort((a, b) => a.code.localeCompare(b.code));
  const upper = byRating(core.filter((c) => c.level >= 300));
  const light = byRating(core.concat(support).filter((c) => c.tags.includes("Easy")));
  const seminars = byRating(core.filter((c) => c.level >= 400));

  const rails: Rail[] = [
    { title: "🎯 Start here", blurb: `First- and second-year ${major?.name ?? "UTM"} courses`, codes: codes(first) },
    { title: "🔥 Top rated in your program", blurb: "Sample ratings — real reviews coming soon", codes: codes(byRating(core)) },
    { title: "🧩 Required support courses", blurb: "The other subjects your program needs", codes: codes(byRating(support)) },
    { title: "🚀 Upper-year picks", blurb: "Once you've cleared the prereqs", codes: codes(upper) },
    { title: "🐦 Lighter load", blurb: "Fewer contact hours, intro level", codes: codes(light) },
    { title: "🎓 Seminars & capstones", blurb: "400-level, small classes", codes: codes(seminars) },
  ];

  return rails.filter((r) => r.codes.length > 0);
}

export const SUBJECTS = [...new Set(COURSES.map((c) => c.subject))].sort();

import type { Course } from "@/lib/courses";

export type ResearchStatus = "confirmed" | "not-verified" | "student-reported";

export type ResearchEvidence = {
  label: string;
  status: ResearchStatus;
  detail: string;
  href?: string;
};

export type CourseResearch = {
  code: string;
  term: string;
  verifiedAt: string;
  evidence: ResearchEvidence[];
};

const TERM = "Fall 2026";
const VERIFIED_AT = "2026-10-02";

const pilotCodes = [
  "CSC108H5",
  "CSC148H5",
  "MAT102H5",
  "MAT134H5",
  "MAT135H5",
  "STA107H5",
  "PSY100Y5",
  "ANT101H5",
  "ANT102H5",
  "BIO152H5",
  "CHM110H5",
  "PHY136H5",
  "ECO101H5",
  "ECO102H5",
  "MGT120H5",
  "MGM101H5",
  "SOC100H5",
  "POL112H5",
  "PHL103H5",
  "ENG100H5",
  "WRI173H5",
  "CCT109H5",
  "DRE121H5",
  "CIN101H5",
  "WGS101H5",
] as const;

const calendarHref = (code: string) =>
  `https://utm.calendar.utoronto.ca/course/${encodeURIComponent(code.toLowerCase())}`;

export const getCourseCalendarUrl = calendarHref;

const timetableHref = (code: string) =>
  `https://ttb.utoronto.ca/?courseCode=${encodeURIComponent(code)}`;

const redditHref = (code: string) =>
  `https://www.reddit.com/r/UTM/search/?q=${encodeURIComponent(code)}&restrict_sr=1`;

const rmpHref = (code: string) =>
  `https://www.ratemyprofessors.com/search/professors?q=${encodeURIComponent(`${code} University of Toronto Mississauga`)}`;

function buildResearch(code: string): CourseResearch {
  return {
    code,
    term: TERM,
    verifiedAt: VERIFIED_AT,
    evidence: [
      {
        label: "Official course record",
        status: "confirmed",
        detail: "Course title, description, prerequisites, credits, and contact hours are from the UTM Academic Calendar catalog snapshot.",
        href: calendarHref(code),
      },
      {
        label: `${TERM} offering`,
        status: "not-verified",
        detail: "Check the official Timetable Builder for the current term. A catalog entry does not prove that a course is offered every year.",
        href: timetableHref(code),
      },
      {
        label: "Instructor",
        status: "not-verified",
        detail: "Instructor assignments are section- and term-specific and are not inferred from department membership.",
        href: timetableHref(code),
      },
      {
        label: "Syllabus",
        status: "not-verified",
        detail: "No public current syllabus is being treated as authoritative until a term-matched document is found.",
        href: calendarHref(code),
      },
      {
        label: "Final exam",
        status: "not-verified",
        detail: "Exam status is not inferred from missing information. It requires an explicit current syllabus or official assessment source.",
        href: timetableHref(code),
      },
      {
        label: "Student reports",
        status: "student-reported",
        detail: "Public discussion and professor-review results are linked for manual context; they are not presented as official course facts.",
        href: redditHref(code),
      },
      {
        label: "Professor review search",
        status: "student-reported",
        detail: "Rate My Professors results are linked but not scraped or copied automatically.",
        href: rmpHref(code),
      },
    ],
  };
}

export const COURSE_RESEARCH: Record<string, CourseResearch> = Object.fromEntries(
  pilotCodes.map((code) => [code, buildResearch(code)]),
);

export function getCourseResearch(course: Course): CourseResearch | undefined {
  return COURSE_RESEARCH[course.code];
}

export function isResearchPilot(course: Course) {
  return Boolean(COURSE_RESEARCH[course.code]);
}

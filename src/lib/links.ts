export const SUPPORT_EMAIL = "Abood.awaida@mail.utoronto.ca";

export const CALENDAR_HOME = "https://utm.calendar.utoronto.ca/";
export const TIMETABLE_HOME = "https://student.utm.utoronto.ca/timetable/";

export function calendarLink(code: string) {
  return `https://utm.calendar.utoronto.ca/course/${encodeURIComponent(code.toUpperCase())}`;
}

export function calendarSearchLink(code: string) {
  return `https://utm.calendar.utoronto.ca/search-courses?course_search=${encodeURIComponent(code.toUpperCase())}`;
}

export function timetableLink(code: string) {
  const base = code.toUpperCase().replace(/[HY]\d$/, "");
  return `${TIMETABLE_HOME}?yearSession=${currentSession()}&courseCode=${encodeURIComponent(base)}`;
}

export function currentSession() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 7) return `${year}9`;
  if (month >= 4) return `${year}5`;
  return `${year - 1}9`;
}

export function redditLink(code: string) {
  return `https://www.reddit.com/r/UTM/search/?q=${encodeURIComponent(code)}&restrict_sr=1&sort=relevance`;
}

export function rmpSearchLink(name?: string) {
  const q = name?.trim();
  return q
    ? `https://www.ratemyprofessors.com/search/professors?q=${encodeURIComponent(q)}`
    : `https://www.ratemyprofessors.com/search/schools?q=University%20of%20Toronto%20Mississauga`;
}

export function syllabusSearchLink(code: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(`${code} UTM syllabus filetype:pdf`)}`;
}

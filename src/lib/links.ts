export const UTM_LINKS = {
  calendar: "https://utm.calendar.utoronto.ca/",
  timetable: "https://ttb.utoronto.ca/?division=UTM",
  reddit: "https://www.reddit.com/r/UTM/",
  degreeExplorer: "https://degreeexplorer.utoronto.ca/",
  acorn: "https://acorn.utoronto.ca/",
};

export const calendarUrl = (code: string) =>
  `https://utm.calendar.utoronto.ca/course/${code.toLowerCase()}`;

export const timetableUrl = (code: string) =>
  `https://ttb.utoronto.ca/?division=UTM&courseCode=${encodeURIComponent(code)}`;

export const redditSearchUrl = (code: string) =>
  `https://www.reddit.com/r/UTM/search/?q=${encodeURIComponent(code)}&restrict_sr=1`;

export const rmpSearchUrl = (name: string) =>
  `https://www.ratemyprofessors.com/search/professors?q=${encodeURIComponent(name)}`;

export const rmpUtmSearchUrl = (name: string) =>
  `https://www.ratemyprofessors.com/search/professors/4928?q=${encodeURIComponent(name)}`;

export const rmpTorontoSearchUrl = (name: string) =>
  `https://www.ratemyprofessors.com/search/professors/1484?q=${encodeURIComponent(name)}`;

export const syllabusSearchUrl = (code: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(`${code} UTM course outline syllabus filetype:pdf`)}`;

export const facultySearchUrl = (subject: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(`University of Toronto Mississauga ${subject} department faculty directory`)}`;

export const CREATOR_EMAIL = "Abood.awaida@mail.utoronto.ca";
// Where "Report review" emails go.
export const REPORTS_EMAIL = "aboodemail@gmail.com";

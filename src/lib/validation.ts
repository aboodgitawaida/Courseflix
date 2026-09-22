export function isValidCourseCode(code: string) {
  return /^[A-Z]{2,4}\d{3}[HY]\d$/.test(code);
}

export type RatingValidationInput = {
  course_code: string;
  rating: number;
  difficulty: number;
  workload: number;
  prof_name: string | null;
  comment: string | null;
};

export function validateRatingInput(input: RatingValidationInput) {
  if (!isValidCourseCode(input.course_code)) {
    return "That course code is not valid.";
  }
  if (
    ![input.rating, input.difficulty, input.workload].every(
      (value) => Number.isInteger(value) && value >= 1 && value <= 5,
    )
  ) {
    return "Ratings must be whole numbers from 1 to 5.";
  }
  if (input.prof_name && input.prof_name.length > 80) {
    return "Professor names must be 80 characters or fewer.";
  }
  if (input.comment && input.comment.length > 1000) {
    return "Comments must be 1,000 characters or fewer.";
  }
  return null;
}

export function parseShortlistCodes(raw: string[], isKnownCourse: (code: string) => boolean) {
  return parseShortlistCodesWithStats(raw, isKnownCourse).codes;
}

export function parseShortlistCodesWithStats(
  raw: string[],
  isKnownCourse: (code: string) => boolean,
) {
  const normalized = [...new Set(raw.map((code) => code.trim().toUpperCase()))];
  const codes = [...new Set(normalized.filter(isValidCourseCode).filter(isKnownCourse))].slice(
    0,
    30,
  );
  return { codes, skipped: normalized.length - codes.length };
}

export function parseShortlistSearch(search: Record<string, unknown>) {
  return typeof search["ids"] === "string" ? { ids: search["ids"].slice(0, 300) } : {};
}

import { describe, expect, it } from "vitest";
import { parseShortlistCodes, validateRatingInput } from "./validation";

const validRating = {
  course_code: "CSC108H5",
  rating: 4,
  difficulty: 3,
  workload: 4,
  prof_name: "Ada Lovelace",
  comment: "A useful introduction.",
};

describe("parseShortlistCodes", () => {
  it("normalizes, deduplicates, filters, and caps shared codes", () => {
    const raw = [" csc108h5 ", "CSC108H5", "invalid", "MAT102H5", "BIO999H5"];
    expect(parseShortlistCodes(raw, (code) => code !== "BIO999H5")).toEqual([
      "CSC108H5",
      "MAT102H5",
    ]);
  });

  it("keeps only the first 30 known valid codes", () => {
    const raw = Array.from({ length: 35 }, (_, index) => `ABC${String(index).padStart(3, "0")}H5`);
    expect(parseShortlistCodes(raw, () => true)).toHaveLength(30);
  });
});

describe("validateRatingInput", () => {
  it("accepts a valid rating", () => {
    expect(validateRatingInput(validRating)).toBeNull();
  });

  it("rejects invalid scales and oversized user text", () => {
    expect(validateRatingInput({ ...validRating, rating: 6 })).toContain("1 to 5");
    expect(validateRatingInput({ ...validRating, prof_name: "x".repeat(81) })).toContain("80");
    expect(validateRatingInput({ ...validRating, comment: "x".repeat(1001) })).toContain("1,000");
  });

  it("rejects malformed course codes", () => {
    expect(validateRatingInput({ ...validRating, course_code: "CSC108" })).toContain("course code");
  });
});

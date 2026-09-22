import { describe, expect, it } from "vitest";
import {
  parseShortlistCodes,
  parseShortlistCodesWithStats,
  parseShortlistSearch,
  validateRatingInput,
} from "./validation";
import { getCourse } from "./courses";
import { safeAuthRedirect } from "./auth-redirect";

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

  it("reports skipped duplicate, malformed, and unknown entries", () => {
    expect(
      parseShortlistCodesWithStats(
        ["CSC108H5", "CSC108H5", "invalid", "BIO999H5"],
        (code) => code !== "BIO999H5",
      ),
    ).toEqual({ codes: ["CSC108H5"], skipped: 2 });
  });
});

describe("course and shortlist route inputs", () => {
  it("accepts known courses and rejects unknown course routes", () => {
    expect(getCourse("CSC108H5")?.code).toBe("CSC108H5");
    expect(getCourse("NOT999H5")).toBeUndefined();
  });

  it("bounds shortlist query input and drops non-string values", () => {
    expect(parseShortlistSearch({ ids: "x".repeat(400) }).ids).toHaveLength(300);
    expect(parseShortlistSearch({ ids: 123 })).toEqual({});
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

describe("safeAuthRedirect", () => {
  it("allows internal paths", () => {
    expect(safeAuthRedirect("/settings")).toBe("/settings");
    expect(safeAuthRedirect("/course/CSC108H5")).toBe("/course/CSC108H5");
  });

  it("blocks missing and external redirect targets", () => {
    expect(safeAuthRedirect()).toBe("/");
    expect(safeAuthRedirect("https://example.com")).toBe("/");
    expect(safeAuthRedirect("//example.com")).toBe("/");
  });
});

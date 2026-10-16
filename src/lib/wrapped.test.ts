import { describe, expect, it } from "vitest";
import { buildWrapped, pickPersona } from "./wrapped";

describe("buildWrapped", () => {
  it("returns null when nothing valid is saved", () => {
    expect(buildWrapped([])).toBeNull();
    expect(buildWrapped(["NOPE999H5"])).toBeNull();
  });

  it("dedupes codes and ignores unknown ones", () => {
    const w = buildWrapped(["MAT102H5", "mat102h5", "NOPE999H5", "ANT101H5"]);
    expect(w?.courses.map((c) => c.code)).toEqual(["MAT102H5", "ANT101H5"]);
    expect(w?.credits).toBe(1);
  });

  it("finds Reddit's easy and hard picks and the hardest one", () => {
    // MAT102 and MAT137 are mostly called hard on r/UTM; ANT101 mostly easy.
    const w = buildWrapped(["MAT102H5", "MAT137H5", "ANT101H5"])!;
    expect(w.bosses.map((c) => c.code)).toEqual(["MAT102H5", "MAT137H5"]);
    expect(w.birds.map((c) => c.code)).toEqual(["ANT101H5"]);
    expect(w.hardest?.course.code).toBe("MAT137H5");
    expect(w.persona.id).toBe("boss");
  });

  it("counts student bird-course mentions as gold", () => {
    const w = buildWrapped(["MAT102H5", "CSC108H5"], new Map([["MAT102H5", 5]]))!;
    expect(w.birds.map((c) => c.code)).toEqual(["MAT102H5"]);
    expect(w.bosses).toEqual([]);
  });

  it("ranks subjects by how many courses were saved", () => {
    const w = buildWrapped(["CSC108H5", "CSC148H5", "ANT101H5"])!;
    expect(w.topSubject).toBe("CSC");
    expect(w.subjects).toEqual([
      { subject: "CSC", count: 2 },
      { subject: "ANT", count: 1 },
    ]);
  });
});

describe("pickPersona", () => {
  const base = {
    total: 5,
    birds: 0,
    bosses: 0,
    subjects: 1,
    topSubject: "CSC",
    topSubjectCount: 5,
  };

  it("picks one persona for each kind of lineup", () => {
    expect(pickPersona({ ...base, bosses: 2 }).id).toBe("boss");
    expect(pickPersona({ ...base, birds: 2 }).id).toBe("bird");
    expect(pickPersona({ ...base, birds: 1, bosses: 1 }).id).toBe("strategist");
    expect(pickPersona({ ...base, subjects: 4, topSubjectCount: 2 }).id).toBe("explorer");
    expect(pickPersona(base).id).toBe("specialist");
    expect(pickPersona({ ...base, total: 2, topSubjectCount: 1, subjects: 2 }).id).toBe("main");
  });
});

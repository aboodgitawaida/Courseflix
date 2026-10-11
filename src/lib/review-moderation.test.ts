import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();

vi.mock("@anthropic-ai/sdk", () => {
  class APIError extends Error {
    status?: number;
  }
  class Anthropic {
    static APIError = APIError;
    beta = { messages: { create } };
  }
  return { default: Anthropic };
});

const reply = (verdict: object) => ({
  stop_reason: "end_turn",
  content: [{ type: "text", text: JSON.stringify(verdict) }],
});

const review: { courseCode: string; profName: string | null; comment: string | null } = {
  courseCode: "CSC108H5",
  profName: "Smith",
  comment: "Hard but fair.",
};

describe("moderateReview", () => {
  beforeEach(() => {
    vi.resetModules();
    create.mockReset();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    process.env.ANTHROPIC_API_KEY = "test-key";
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    vi.restoreAllMocks();
  });

  async function moderate(input = review) {
    const { moderateReview } = await import("./review-moderation.server");
    return moderateReview(input);
  }

  it("skips the check for reviews with no text", async () => {
    expect(await moderate({ ...review, profName: null, comment: "  " })).toEqual({
      allowed: true,
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("publishes without checking when no API key is configured", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    expect(await moderate()).toEqual({ allowed: true });
    expect(create).not.toHaveBeenCalled();
  });

  it("publishes when the model says publish", async () => {
    create.mockResolvedValue(reply({ decision: "publish", category: "none", message: "" }));
    expect(await moderate()).toEqual({ allowed: true });
  });

  it("blocks with the model's message when the model says block", async () => {
    create.mockResolvedValue(
      reply({ decision: "block", category: "threat", message: "Please remove the threat." }),
    );
    expect(await moderate()).toEqual({
      allowed: false,
      category: "threat",
      message: "Please remove the threat.",
    });
  });

  it("fails open when the API call throws", async () => {
    create.mockRejectedValue(new Error("network down"));
    expect(await moderate()).toEqual({ allowed: true });
  });

  it("fails open on a refusal", async () => {
    create.mockResolvedValue({ stop_reason: "refusal", content: [] });
    expect(await moderate()).toEqual({ allowed: true });
  });

  it("sends the review inside review tags, not the system prompt", async () => {
    create.mockResolvedValue(reply({ decision: "publish", category: "none", message: "" }));
    await moderate();
    const params = create.mock.calls[0]![0];
    expect(params.messages[0].content).toContain("<review>");
    expect(params.messages[0].content).toContain("Hard but fair.");
    expect(params.system).not.toContain("Hard but fair.");
  });
});

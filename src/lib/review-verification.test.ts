import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { canPostReviews, sha256Hex } from "./review-verification.server";

function fakeAdmin({
  providers = ["email"],
  row = null,
  error = null,
}: {
  providers?: string[];
  row?: { user_id: string } | null;
  error?: { code: string } | null;
}) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: row, error });
  return {
    auth: {
      admin: {
        getUserById: vi.fn().mockResolvedValue({
          data: { user: { identities: providers.map((provider) => ({ provider })) } },
        }),
      },
    },
    from: vi.fn(() => ({ select: () => ({ eq: () => ({ maybeSingle }) }) })),
  } as unknown as SupabaseClient<Database>;
}

describe("canPostReviews", () => {
  it("allows accounts that signed in with Google", async () => {
    expect(await canPostReviews(fakeAdmin({ providers: ["email", "google"] }), "u1")).toBe(true);
  });

  it("allows email accounts that confirmed the link", async () => {
    expect(await canPostReviews(fakeAdmin({ row: { user_id: "u1" } }), "u1")).toBe(true);
  });

  it("blocks email accounts that have not confirmed", async () => {
    expect(await canPostReviews(fakeAdmin({}), "u1")).toBe(false);
  });

  it("keeps reviews open until the migration creates the table", async () => {
    expect(await canPostReviews(fakeAdmin({ error: { code: "PGRST205" } }), "u1")).toBe(true);
  });

  it("blocks on other database errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await canPostReviews(fakeAdmin({ error: { code: "57014" } }), "u1")).toBe(false);
  });
});

describe("sha256Hex", () => {
  it("hashes to 64 hex characters", async () => {
    expect(await sha256Hex("token")).toMatch(/^[0-9a-f]{64}$/);
  });
});

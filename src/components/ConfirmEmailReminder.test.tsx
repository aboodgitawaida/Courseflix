// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
const invalidate = vi.fn();
let user: { id: string; email?: string } | null = null;
let verification = { verified: false, loading: false };
let pathname = "/";

vi.mock("@tanstack/react-router", () => ({ useLocation: () => ({ pathname }) }));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: invalidate }),
}));
vi.mock("@/hooks/use-auth", () => ({ useAuth: () => ({ user }) }));
vi.mock("@/lib/ratings", () => ({ useReviewVerification: () => verification }));
vi.mock("@/lib/review-verification", () => ({ sendReviewVerification: () => send() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { ConfirmEmailReminder } from "./ConfirmEmailReminder";

function renderAndWait() {
  render(<ConfirmEmailReminder />);
  act(() => {
    vi.advanceTimersByTime(8_000);
  });
}

describe("ConfirmEmailReminder", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    send.mockReset();
    invalidate.mockReset();
    user = { id: "u1", email: "student@example.com" };
    verification = { verified: false, loading: false };
    pathname = "/";
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("waits a few seconds, then shows the address so typos get noticed", () => {
    render(<ConfirmEmailReminder />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(8_000);
    });
    expect(screen.getByRole("dialog", { name: /confirm your email/i })).toBeInTheDocument();
    expect(screen.getByText("student@example.com")).toBeInTheDocument();
  });

  it("stays away for confirmed users, signed-out visitors and the sign-in pages", () => {
    verification = { verified: true, loading: false };
    renderAndWait();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    cleanup();

    verification = { verified: false, loading: false };
    user = null;
    renderAndWait();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    cleanup();

    user = { id: "u1", email: "student@example.com" };
    pathname = "/verify-email";
    renderAndWait();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("remembers a dismissal for that account", () => {
    renderAndWait();
    fireEvent.click(screen.getByRole("button", { name: /dismiss email reminder/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    cleanup();

    renderAndWait();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    cleanup();

    user = { id: "someone-else", email: "other@example.com" };
    renderAndWait();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("sends the same confirmation link the review form uses", async () => {
    send.mockResolvedValue({ success: true });
    renderAndWait();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /send confirmation link/i }));
    });
    expect(send).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/check your inbox/i)).toBeInTheDocument();
  });

  it("hides itself if the account turns out to be confirmed already", async () => {
    send.mockResolvedValue({ alreadyVerified: true });
    renderAndWait();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /send confirmation link/i }));
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["review-verified"] });
  });
});

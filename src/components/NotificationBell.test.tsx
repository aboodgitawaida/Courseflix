// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const markRead = vi.fn().mockResolvedValue(undefined);
let rows: Array<Record<string, unknown>> = [];

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params: _params, ...props }: any) => (
    <a href={String(to)} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@/lib/social", () => ({
  useNotifications: () => ({
    data: { rows, people: new Map() },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useMarkNotificationsRead: () => ({ mutateAsync: markRead }),
  useClearNotifications: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("@/lib/a11y", () => ({ announce: vi.fn() }));
vi.mock("@/lib/profile", () => ({ avatarSrc: () => "/avatar.png" }));

import { NotificationBell } from "./NotificationBell";

const row = (id: string, kind: string, read: boolean, code: string | null = null) => ({
  id,
  user_id: "me",
  actor_id: null,
  kind,
  course_code: code,
  read,
  created_at: new Date().toISOString(),
});

function openBell() {
  render(<NotificationBell />);
  const trigger = screen.getByRole("button", { name: /notifications/i });
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false, pointerType: "mouse" });
  return trigger;
}

describe("NotificationBell", () => {
  beforeEach(() => {
    markRead.mockClear();
    rows = [row("a", "friend_request", false), row("b", "friend_accepted", true)];
  });
  afterEach(cleanup);

  it("keeps unread items marked while the panel is open, without marking them read", () => {
    openBell();
    expect(markRead).not.toHaveBeenCalled();
    const marked = document.querySelectorAll('[data-new="true"]');
    expect(marked).toHaveLength(1);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("marks everything read only when the panel closes", () => {
    openBell();
    expect(markRead).not.toHaveBeenCalled();
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    expect(markRead).toHaveBeenCalledTimes(1);
  });

  it("gives achievement rows a trophy icon and other rows none", () => {
    rows = [
      row("t", "achievement_unlocked", true, "first-shortlist"),
      row("f", "friend_accepted", true),
    ];
    openBell();
    const links = Array.from(document.querySelectorAll("a"));
    const achievementRow = links.find((a) => a.textContent?.includes("You unlocked"))!;
    expect(achievementRow.querySelector("svg.lucide-trophy")).not.toBeNull();
    const friendRow = links.find((a) => a.textContent?.includes("accepted"))!;
    expect(friendRow.querySelector("svg.lucide-trophy")).toBeNull();
  });
});

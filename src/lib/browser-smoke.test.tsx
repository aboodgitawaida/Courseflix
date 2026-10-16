// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return {
    ...actual,
    Link: ({ children, to, ...props }: any) => (
      <a href={String(to)} {...props}>
        {children}
      </a>
    ),
    useNavigate: () => mockNavigate,
    useSearch: () => ({ redirect: "/settings" }),
    useLocation: () => ({ pathname: "/auth" }),
  };
});

vi.mock("@/hooks/use-major", () => ({
  useMajor: vi.fn(),
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/ratings", () => ({
  BIRD_COURSE_THRESHOLD: 2,
  useBirdCourses: () => ({ data: new Map<string, number>() }),
}));

vi.mock("@/components/TopNav", () => ({
  TopNav: () => <nav>Top nav</nav>,
}));

vi.mock("@/components/Hero", () => ({
  Hero: ({ major }: { major: string }) => <h1>Hero for {major}</h1>,
}));

vi.mock("@/components/CourseRail", () => ({
  CourseRail: ({ rail }: { rail: { title: string } }) => <section>{rail.title}</section>,
}));

vi.mock("@/components/TierSections", () => ({
  TierSections: () => <section>Tier sections</section>,
}));

vi.mock("@/components/CreatorSection", () => ({
  CreatorSection: () => <section>Creator</section>,
}));

vi.mock("@/components/FeatureBento", () => ({
  FeatureBento: () => <section>Features</section>,
}));

vi.mock("@/components/FilterChips", () => ({
  FilterChips: () => <div>Filters</div>,
}));

vi.mock("@/components/CinematicIntro", () => ({
  CinematicIntro: () => <div>Intro</div>,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      exchangeCodeForSession: vi.fn(),
    },
  },
}));

vi.mock("@/lib/reset-password", () => ({
  resetPassword: vi.fn(),
}));

import { HomePage as Home } from "@/components/HomePage";
import { AuthPage } from "../routes/auth";
import { useAuth } from "@/hooks/use-auth";
import { useMajor } from "@/hooks/use-major";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("browser smoke tests", () => {
  it("renders the home page with a selected major", () => {
    vi.mocked(useMajor).mockReturnValue({
      major: "computer-science",
      setMajor: vi.fn(),
      hydrated: true,
    } as any);

    render(<Home />);

    expect(screen.getByText("Hero for Computer Science")).toBeInTheDocument();
    expect(screen.getByText("Top nav")).toBeInTheDocument();
  });

  it("renders the auth screen for unauthenticated users", () => {
    vi.mocked(useAuth).mockReturnValue({
      signedIn: false,
      loading: false,
    } as any);

    render(<AuthPage />);

    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
  });

  it("redirects authenticated users back to the safe destination", () => {
    vi.mocked(useAuth).mockReturnValue({
      signedIn: true,
      loading: false,
    } as any);

    render(<AuthPage />);

    expect(mockNavigate).toHaveBeenCalledWith({ to: "/settings", replace: true });
  });
});

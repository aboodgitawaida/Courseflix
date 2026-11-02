// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { signInWithPassword, signUp } = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
}));
let siteKey: string | undefined;
let mounts = 0;

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  createFileRoute: () => (options: object) => options,
  Outlet: () => null,
  Link: ({ children, to, ...props }: any) => (
    <a href={String(to)} {...props}>
      {children}
    </a>
  ),
  useLocation: () => ({ pathname: "/auth" }),
  useNavigate: () => vi.fn(),
  useSearch: () => ({}),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { signInWithPassword, signUp, exchangeCodeForSession: vi.fn() } },
}));
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ signedIn: false, loading: false, user: null }),
}));
vi.mock("@/lib/reset-password", () => ({ resetPassword: vi.fn() }));
vi.mock("@/components/PageBackdrop", () => ({ PageBackdrop: () => null }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("@/lib/turnstile", () => ({
  get TURNSTILE_SITE_KEY() {
    return siteKey;
  },
}));
vi.mock("@/components/Turnstile", () => ({
  Turnstile: function FakeTurnstile({ onToken }: { onToken: (token: string | null) => void }) {
    // One token per mount, like the real widget after it is remounted.
    const [token] = useState(() => `token-${++mounts}`);
    return (
      <button type="button" onClick={() => onToken(token)}>
        Pass check
      </button>
    );
  },
}));

import { AuthPage } from "@/routes/auth";

function fillSignIn() {
  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: "student@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "hunter22" } });
}

describe("sign-in bot check", () => {
  beforeEach(() => {
    signInWithPassword.mockReset().mockResolvedValue({ error: null });
    signUp.mockReset().mockResolvedValue({ data: { session: {} }, error: null });
    mounts = 0;
  });
  afterEach(cleanup);

  it("works exactly as before when no Turnstile key is set", async () => {
    siteKey = undefined;
    render(<AuthPage />);
    expect(screen.queryByText("Pass check")).not.toBeInTheDocument();
    fillSignIn();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    });
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "student@example.com",
      password: "hunter22",
      options: { captchaToken: undefined },
    });
  });

  it("waits for the check, sends its token, and asks for a fresh one after each try", async () => {
    siteKey = "site-key";
    render(<AuthPage />);
    fillSignIn();
    const submit = screen.getByRole("button", { name: "Sign in" });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByText("Pass check"));
    expect(submit).toBeEnabled();
    await act(async () => {
      fireEvent.click(submit);
    });
    expect(signInWithPassword).toHaveBeenCalledWith(
      expect.objectContaining({ options: { captchaToken: "token-1" } }),
    );

    // Tokens work once, so the check is shown again and the button waits for it.
    expect(screen.getByRole("button", { name: "Sign in" })).toBeDisabled();
    expect(mounts).toBe(2);
  });

  it("sends the token when creating an account too", async () => {
    siteKey = "site-key";
    render(<AuthPage />);
    fireEvent.click(screen.getByRole("button", { name: /create an account/i }));
    fillSignIn();
    fireEvent.click(screen.getByText("Pass check"));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    });
    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({ captchaToken: "token-1" }),
      }),
    );
  });
});

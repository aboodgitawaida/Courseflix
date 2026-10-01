import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { announce } from "@/lib/a11y";
import { getCourse } from "@/lib/courses";

type CourseUI = {
  previewCode: string | null;
  openPreview: (code: string) => void;
  closePreview: () => void;
  compare: string[];
  toggleCompare: (code: string) => void;
  clearCompare: () => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
};

const Ctx = createContext<CourseUI | null>(null);

export function CourseUIProvider({ children }: { children: ReactNode }) {
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const value = useMemo<CourseUI>(
    () => ({
      previewCode,
      openPreview: (code) => {
        setPreviewCode(code);
        window.dispatchEvent(
          new CustomEvent("study-eagle-summarize", {
            detail: { course: getCourse(code), context: "preview" },
          }),
        );
      },
      closePreview: () => {
        setPreviewCode(null);
        window.dispatchEvent(new CustomEvent("study-eagle-clear"));
      },
      compare,
      toggleCompare: (code) =>
        setCompare((prev) => {
          if (prev.includes(code)) {
            announce(`${code} removed from comparison.`);
            return prev.filter((c) => c !== code);
          }
          if (prev.length >= 3) {
            announce("Comparison is limited to three courses.");
            return prev;
          }
          announce(
            `${code} added to comparison. ${prev.length + 1} course${prev.length === 0 ? "" : "s"} selected.`,
          );
          return [...prev, code];
        }),
      clearCompare: () => {
        announce("Comparison cleared.");
        setCompare([]);
      },
      searchOpen,
      setSearchOpen,
    }),
    [previewCode, compare, searchOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCourseUI() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCourseUI must be used inside CourseUIProvider");
  return ctx;
}

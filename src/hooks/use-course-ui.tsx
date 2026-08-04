import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

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
      openPreview: (code) => setPreviewCode(code),
      closePreview: () => setPreviewCode(null),
      compare,
      toggleCompare: (code) =>
        setCompare((prev) =>
          prev.includes(code) ? prev.filter((c) => c !== code) : prev.length >= 3 ? prev : [...prev, code],
        ),
      clearCompare: () => setCompare([]),
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

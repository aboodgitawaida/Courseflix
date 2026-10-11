import { MessageCircle, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useRouterState } from "@tanstack/react-router";
import { getCourse, type Course } from "@/lib/courses";
import { loadDescriptions, peekDescriptions } from "@/lib/course-description";
import { useEagle } from "@/hooks/use-eagle";

type EagleMode = "awake" | "sleeping" | "celebrating";

const EAGLE_REPLIES = [
  "Try the course preview first, then shortlist anything that still feels like a good fit.",
  "A good study plan starts with your prerequisites. Follow the path on the full course page.",
  "Compare workload and difficulty together. A high rating is not always an easy semester.",
];

/** Where the perch sits on the right edge, as a fraction of the viewport height. */
const PERCH_KEY = "courseflix.eagle.perchY";
const DEFAULT_PERCH = 0.62;
const SLEEP_AFTER_MS = 20_000;
const CELEBRATE_MS = 1_100; // matches the 8-frame wing-flap in styles.css
/** Frame size of the eagle sheets (art pixels) and how much they are scaled up. */
const FRAME = { w: 56, h: 68 };
const SCALE = { desktop: 2, compact: 1.5 };

export function StudyEagle() {
  const { enabled } = useEagle();
  const [perch, setPerch] = useState<number | null>(null);
  const [compact, setCompact] = useState(false);
  // On phones the eagle stays tucked away as a small button until tapped.
  const [revealed, setRevealed] = useState(false);
  const [mode, setMode] = useState<EagleMode>("awake");
  const [chatOpen, setChatOpen] = useState(false);
  const [reply, setReply] = useState(EAGLE_REPLIES[0]);
  const [petCount, setPetCount] = useState(0);
  const [petKey, setPetKey] = useState(0);
  // Bumped on every celebration so back-to-back ones restart the wing-flap.
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activityVersion, setActivityVersion] = useState(0);
  const [summaryCourseCode, setSummaryCourseCode] = useState<string | null>(null);
  const [summaryContext, setSummaryContext] = useState<"preview" | "page" | null>(null);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const drag = useRef<{ offset: number; startY: number; moved: boolean } | null>(null);
  const didDrag = useRef(false);
  const messageTimer = useRef<number | null>(null);
  const celebrateTimer = useRef<number | null>(null);
  const modeRef = useRef<EagleMode>("awake");
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const course = getCurrentCourse(pathname);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (!course && summaryCourseCode && summaryContext === "page") {
      setSummaryCourseCode(null);
      setSummaryContext(null);
      setSummaryText(null);
      setReply(EAGLE_REPLIES[0]);
    }
  }, [course, summaryContext, summaryCourseCode]);

  useEffect(() => {
    const saved = Number(window.localStorage.getItem(PERCH_KEY));
    setPerch(saved > 0 && saved < 1 ? saved : DEFAULT_PERCH);
    const onResize = () => setCompact(isCompact());
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Nods off after a while with nothing happening; any activity resets the clock.
  useEffect(() => {
    if (mode !== "awake" || chatOpen || isDragging) return;
    const timer = window.setTimeout(() => {
      setMode("sleeping");
      if (!isCompact()) showStatus("Time for a study break.");
    }, SLEEP_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [activityVersion, mode, chatOpen, isDragging]);

  useEffect(() => {
    const onSummary = (event: Event) => {
      const { course, context } =
        (event as CustomEvent<{ course?: Course; context?: "preview" | "page" }>).detail ?? {};
      if (!course) return;
      setSummaryCourseCode(course.code);
      setSummaryContext(context ?? "preview");
      const cached = peekDescriptions();
      setSummaryText(makeCourseSummary(course, cached?.[course.code] ?? ""));
      setReply("");
      // On phones an auto-opened panel covers the course itself; the summary
      // waits until the eagle is tapped.
      if (!isCompact()) setChatOpen(true);
      if (!cached) {
        void loadDescriptions()
          .then((loaded) => setSummaryText(makeCourseSummary(course, loaded[course.code] ?? "")))
          .catch(() => {});
      }
    };
    const onClearSummary = () => {
      setSummaryCourseCode(null);
      setSummaryContext(null);
      setSummaryText(null);
      setReply(EAGLE_REPLIES[0]);
    };
    const onCelebration = () => {
      setActivityVersion((version) => version + 1);
      showStatus("Nice pick!");
      setCelebrateKey((key) => key + 1);
      setMode("celebrating");
      if (celebrateTimer.current !== null) window.clearTimeout(celebrateTimer.current);
      celebrateTimer.current = window.setTimeout(() => {
        setMode("awake");
        celebrateTimer.current = null;
      }, CELEBRATE_MS);
    };
    window.addEventListener("study-eagle-summarize", onSummary);
    window.addEventListener("study-eagle-clear", onClearSummary);
    window.addEventListener("study-eagle-celebrate", onCelebration);
    return () => {
      window.removeEventListener("study-eagle-summarize", onSummary);
      window.removeEventListener("study-eagle-clear", onClearSummary);
      window.removeEventListener("study-eagle-celebrate", onCelebration);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimer.current !== null) window.clearTimeout(messageTimer.current);
      if (celebrateTimer.current !== null) window.clearTimeout(celebrateTimer.current);
    };
  }, []);

  function eagleSize() {
    const scale = isCompact() ? SCALE.compact : SCALE.desktop;
    return { w: FRAME.w * scale, h: FRAME.h * scale };
  }

  /** Keep the whole perch on screen, below the header and above the phone tab bar. */
  function clampTop(top: number) {
    const min = 72;
    const max = window.innerHeight - eagleSize().h - 16 - tabBarClearance();
    return clamp(top, min, Math.max(min, max));
  }

  // The branch only slides up and down its edge; it can't be pulled into the page.
  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (perch === null) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const top = clampTop(perch * window.innerHeight);
    drag.current = { offset: event.clientY - top, startY: event.clientY, moved: false };
    didDrag.current = false;
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.abs(event.clientY - d.startY) < 4) return;
    if (!d.moved) {
      d.moved = true;
      didDrag.current = true;
      setIsDragging(true);
    }
    setPerch(clampTop(event.clientY - d.offset) / window.innerHeight);
  }

  function onPointerUp() {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    setIsDragging(false);
    setActivityVersion((version) => version + 1);
    setPerch((current) => {
      if (current !== null) window.localStorage.setItem(PERCH_KEY, current.toFixed(4));
      return current;
    });
    // The click that ends a drag is not a pet.
    window.setTimeout(() => {
      didDrag.current = false;
    }, 0);
  }

  function petEagle() {
    if (didDrag.current) return;
    setActivityVersion((version) => version + 1);
    if (modeRef.current === "sleeping") {
      setMode("awake");
      showStatus("Back already?");
      return;
    }
    setPetKey((key) => key + 1);
    setPetCount((count) => count + 1);
    showStatus(petCount % 2 === 0 ? "Krrr! That tickles." : "You got me.");
    setSummaryCourseCode(null);
    setSummaryText(null);
    setReply(
      petCount % 2 === 0
        ? "Krrr! That tickles. You have got this."
        : EAGLE_REPLIES[petCount % EAGLE_REPLIES.length],
    );
  }

  function closeChat() {
    setChatOpen(false);
    if (isCompact()) setRevealed(false);
  }

  function showStatus(message: string) {
    if (messageTimer.current !== null) window.clearTimeout(messageTimer.current);
    setStatusMessage(message);
    messageTimer.current = window.setTimeout(() => {
      setStatusMessage(null);
      messageTimer.current = null;
    }, 2_800);
  }

  if (!enabled || perch === null) return null;

  if (compact && !revealed) {
    return (
      <button
        type="button"
        className="study-eagle-tuck"
        onClick={() => {
          setRevealed(true);
          setChatOpen(true);
          setMode("awake");
          setActivityVersion((version) => version + 1);
        }}
        aria-label="Open Study Eagle"
        title="Study Eagle"
      >
        <span className="study-eagle-tuck-face" aria-hidden="true" />
      </button>
    );
  }

  const size = eagleSize();
  const top = clampTop(perch * window.innerHeight);
  // Open the chat away from the nearest screen edge.
  const panelBelow = top < window.innerHeight / 2;

  return (
    <div
      className={`study-eagle fixed z-[45] ${isDragging ? "study-eagle-dragging" : ""}`}
      // Flush to the edge: the branch grows out of the side of the screen.
      style={{ right: 0, top, width: size.w }}
    >
      {chatOpen && (
        <div
          className={`study-eagle-panel absolute right-0 w-[min(300px,calc(100vw-2rem))] rounded-2xl border border-amber-300/25 bg-[#17120d]/95 p-4 text-white shadow-2xl shadow-black/50 backdrop-blur-xl ${
            panelBelow ? "top-[calc(100%+8px)]" : "bottom-[calc(100%+8px)]"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-amber-200">
                <Sparkles className="h-4 w-4" /> Study Eagle
              </div>
              <p className="mt-1 text-[11px] text-amber-100/60">Your tiny campus co-pilot</p>
            </div>
            <button
              type="button"
              onClick={closeChat}
              aria-label={compact ? "Tuck Study Eagle away" : "Close Study Eagle chat"}
              className="rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm leading-relaxed text-white/80">
            {summaryCourseCode && summaryText ? `${summaryCourseCode}: ${summaryText}` : reply}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setReply(EAGLE_REPLIES[0])}
              className="study-eagle-chip"
            >
              Study tip
            </button>
            <button
              type="button"
              onClick={() =>
                setReply(
                  course
                    ? `For ${course.code}, check the prerequisite path before enrolling.`
                    : EAGLE_REPLIES[1],
                )
              }
              className="study-eagle-chip"
            >
              Help me choose
            </button>
            <button
              type="button"
              onClick={() => setReply(EAGLE_REPLIES[2])}
              className="study-eagle-chip"
            >
              Plan a semester
            </button>
          </div>
        </div>
      )}

      {statusMessage && !chatOpen && (
        <div className="study-eagle-status" role="status">
          {statusMessage}
        </div>
      )}
      <div className={`relative study-eagle-${mode}`}>
        {petKey > 0 && (
          <div key={petKey} className="study-eagle-hearts" aria-hidden="true">
            <PixelHeart />
            <PixelHeart />
            <PixelHeart />
          </div>
        )}
        {mode === "celebrating" && (
          <div className="study-eagle-confetti" aria-hidden="true">
            ✦ · ✧ ✦ · ✧
          </div>
        )}
        <button
          type="button"
          aria-label={`Study Eagle. ${mode === "sleeping" ? "Sleeping. " : ""}Tap to pet, drag the branch up or down.`}
          title="Tap to pet · drag the branch up or down"
          onClick={petEagle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="study-eagle-button"
        >
          <span
            key={mode === "celebrating" ? `celebrate-${celebrateKey}` : mode}
            className={`study-eagle-sprite study-eagle-sprite-${mode}`}
          />
        </button>
        <div className="study-eagle-controls">
          <button
            type="button"
            onClick={() => setChatOpen((open) => !open)}
            aria-label="Chat with Study Eagle"
            title="Chat with Study Eagle"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

const HEART_ROWS = [".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."];

/** A 7x6 pixel heart, drawn with crisp squares to match the sprite. */
function PixelHeart() {
  return (
    <svg viewBox="0 0 7 6" shapeRendering="crispEdges">
      {HEART_ROWS.flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === "X" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null,
        ),
      )}
    </svg>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** Phones and small tablets: tucked-away eagle (matches the lg breakpoint). */
function isCompact() {
  return window.innerWidth < 1024;
}

/** Extra clearance for the mobile tab bar (shown below the lg breakpoint). */
function tabBarClearance() {
  return isCompact() ? 84 : 0;
}

function makeCourseSummary(course: Course, rawDescription: string) {
  const description = rawDescription
    .replace(/\s+/g, " ")
    .replace(/\s*(?:\.\.\.|…)\s*$/, "")
    .replace(/^\([^)]*\)\s*/i, "")
    .trim();
  const lead = description.split(/(?<=[.!?])\s+/)[0] ?? description;
  const cleanedLead = lead
    .replace(
      /^this course (?:will )?(?:introduces?|explores?|examines?|surveys?)\s+(?:students to\s+)?/i,
      "",
    )
    .replace(/^(?:an?|the)\s+introduction to\s+/i, "")
    .replace(/^topics include\s+/i, "")
    .replace(/^this is\s+/i, "")
    .replace(/[.!?]+$/, "")
    .trim();
  const introFocus = course.title
    .replace(/^(?:an?|the)\s+/i, "")
    .replace(/^introduction to\s+/i, "")
    .replace(/^topics in\s+/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.!?]+$/, "");
  const summary =
    /^anthropology is the global and holistic study of human biology and behaviour/i.test(lead)
      ? `Students will explore ${introFocus.toLowerCase()}, including human biology, behaviour, and the study of human societies`
      : cleanedLead;
  if (!summary) return "Course details are available on the course page.";

  // Use a complete thought only. A shorter title-based sentence is more useful
  // than cutting a catalog sentence off mid-idea.
  const maxLength = 150;
  const firstFocus = cleanedLead
    .split(/[,;:]/)[0]
    .replace(/^(?:the elements of|the study of)\s+/i, "")
    .trim();
  const focusedSummary = `Students will explore ${lowercaseFirst(firstFocus)}`;
  const completeSummary =
    summary.length <= maxLength
      ? summary
      : focusedSummary.length <= maxLength
        ? focusedSummary
        : `Students will explore ${introFocus.toLowerCase()}`;
  return `${lowercaseFirst(completeSummary).replace(/[.!?]+$/, "")}.`;
}

function lowercaseFirst(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function getCurrentCourse(pathname: string): Course | undefined {
  const match = pathname.match(/\/course\/([^/]+)/);
  return match ? getCourse(decodeURIComponent(match[1])) : undefined;
}

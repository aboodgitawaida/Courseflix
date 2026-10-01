import { MessageCircle, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useRouterState } from "@tanstack/react-router";
import { getCourse, type Course } from "@/lib/courses";

type Position = { x: number; y: number };
type Direction = "down" | "up" | "left" | "right";
type EagleAnimation = "idle" | "sleeping";

const EAGLE_REPLIES = [
  "Try the course preview first, then shortlist anything that still feels like a good fit.",
  "A good study plan starts with your prerequisites. Follow the path on the full course page.",
  "Compare workload and difficulty together. A high rating is not always an easy semester.",
];

export function StudyEagle() {
  const [position, setPosition] = useState<Position | null>(null);
  const [frame, setFrame] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [reply, setReply] = useState(EAGLE_REPLIES[0]);
  const [petCount, setPetCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [summaryCourseCode, setSummaryCourseCode] = useState<string | null>(null);
  const [summaryContext, setSummaryContext] = useState<"preview" | "page" | null>(null);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [direction, setDirection] = useState<Direction>("down");
  const [animation, setAnimation] = useState<EagleAnimation>("idle");
  const dragOffset = useRef<Position>({ x: 0, y: 0 });
  const lastPointer = useRef<Position>({ x: 0, y: 0 });
  const didDrag = useRef(false);
  const returnFrame = useRef<number | null>(null);
  const isReturningRef = useRef(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const course = getCurrentCourse(pathname);

  useEffect(() => {
    if (!course && summaryCourseCode && summaryContext === "page") {
      setSummaryCourseCode(null);
      setSummaryContext(null);
      setSummaryText(null);
      setReply(EAGLE_REPLIES[0]);
    }
  }, [course, summaryContext, summaryCourseCode]);

  useEffect(() => {
    setPosition(getNormalPerchPosition());
  }, []);

  useEffect(() => {
    const frameDuration = animation === "sleeping" ? 900 : 220;
    const timer = window.setInterval(
      () => setFrame((current) => (current + 1) % (animation === "sleeping" ? 4 : 3)),
      frameDuration,
    );
    return () => window.clearInterval(timer);
  }, [animation]);

  useEffect(() => {
    if (animation === "sleeping") return;
    const timer = window.setTimeout(() => {
      if (isReturningRef.current) return;
      startFlight(getSleepPerchPosition(), () => setAnimation("sleeping"));
    }, 2_000);
    return () => window.clearTimeout(timer);
  }, [animation, chatOpen, isDragging]);

  useEffect(() => {
    const onSummary = (event: Event) => {
      const { course, context } =
        (event as CustomEvent<{ course?: Course; context?: "preview" | "page" }>).detail ?? {};
      if (!course) return;
      setSummaryCourseCode(course.code);
      setSummaryContext(context ?? "preview");
      setSummaryText(makeCourseSummary(course));
      setReply("");
      setChatOpen(true);
    };
    const onCelebration = () => {
      setCelebrating(true);
      setDirection("up");
      window.setTimeout(() => {
        setCelebrating(false);
        setDirection("down");
      }, 1800);
    };
    window.addEventListener("study-eagle-summarize", onSummary);
    const onClearSummary = () => {
      setSummaryCourseCode(null);
      setSummaryContext(null);
      setSummaryText(null);
      setReply(EAGLE_REPLIES[0]);
    };
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
      if (returnFrame.current !== null) cancelAnimationFrame(returnFrame.current);
    };
  }, []);

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!position) return;
    const wasSleeping = animation === "sleeping";
    setAnimation("idle");
    event.currentTarget.setPointerCapture(event.pointerId);
    if (returnFrame.current !== null) cancelAnimationFrame(returnFrame.current);
    isReturningRef.current = false;
    setIsReturning(false);
    if (wasSleeping) startFlight(getNormalPerchPosition());
    dragOffset.current = { x: event.clientX - position.x, y: event.clientY - position.y };
    lastPointer.current = { x: event.clientX, y: event.clientY };
    didDrag.current = false;
    setIsDragging(true);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!isDragging) return;
    didDrag.current = true;
    const deltaX = event.clientX - lastPointer.current.x;
    const deltaY = event.clientY - lastPointer.current.y;
    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      setDirection(Math.abs(deltaX) > Math.abs(deltaY) ? (deltaX > 0 ? "right" : "left") : deltaY > 0 ? "down" : "up");
    }
    lastPointer.current = { x: event.clientX, y: event.clientY };
    setPosition({
      x: clamp(event.clientX - dragOffset.current.x, 8, window.innerWidth - 104),
      y: clamp(event.clientY - dragOffset.current.y, 72, window.innerHeight - 112),
    });
  }

  function onPointerUp() {
    setIsDragging(false);
    if (didDrag.current) {
      startFlight(getNormalPerchPosition());
      window.setTimeout(() => {
        didDrag.current = false;
      }, 0);
    }
  }

  function petEagle() {
    if (isDragging || didDrag.current) return;
    setPetCount((count) => count + 1);
    setSummaryCourseCode(null);
    setSummaryText(null);
    setReply(petCount % 2 === 0 ? "Krrr! That tickles. You have got this." : EAGLE_REPLIES[petCount % EAGLE_REPLIES.length]);
  }

  function startFlight(target: Position, onArrive?: () => void) {
    if (!position) return;
    if (returnFrame.current !== null) cancelAnimationFrame(returnFrame.current);
    isReturningRef.current = true;
    setIsReturning(true);
    const start = position;
    if (Math.abs(target.x - start.x) < 1 && Math.abs(target.y - start.y) < 1) {
      setIsReturning(false);
      isReturningRef.current = false;
      setDirection("down");
      onArrive?.();
      return;
    }
    const startedAt = performance.now();
    const verticalDuration = Math.max(220, Math.abs(target.y - start.y) * 2.2);
    const horizontalDuration = Math.max(220, Math.abs(target.x - start.x) * 2.2);
    const totalDuration = verticalDuration + horizontalDuration;

    const step = (now: number) => {
      const elapsed = Math.min(now - startedAt, totalDuration);
      if (elapsed < verticalDuration) {
        setDirection(elapsed < verticalDuration / 2 ? (target.y > start.y ? "down" : "up") : "down");
        setPosition({ x: start.x, y: lerp(start.y, target.y, elapsed / verticalDuration) });
      } else {
        setDirection("right");
        setPosition({ x: lerp(start.x, target.x, (elapsed - verticalDuration) / horizontalDuration), y: target.y });
      }
      if (elapsed < totalDuration) {
        returnFrame.current = requestAnimationFrame(step);
      } else {
        returnFrame.current = null;
        setIsReturning(false);
        isReturningRef.current = false;
        setDirection("down");
        setPosition(target);
        onArrive?.();
      }
    };
    returnFrame.current = requestAnimationFrame(step);
  }

  if (!position) return null;

  return (
    <div
      className={`study-eagle fixed z-[60] ${isDragging ? "study-eagle-dragging" : ""}`}
      style={{ left: position.x, top: position.y }}
    >
      {chatOpen && (
        <div className="study-eagle-panel absolute bottom-[92px] right-0 w-[min(300px,calc(100vw-2rem))] rounded-2xl border border-amber-300/25 bg-[#17120d]/95 p-4 text-white shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-amber-200">
                <Sparkles className="h-4 w-4" /> Study Eagle
              </div>
              <p className="mt-1 text-[11px] text-amber-100/60">Your tiny campus co-pilot</p>
            </div>
            <button onClick={() => setChatOpen(false)} aria-label="Close Study Eagle chat" className="rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm leading-relaxed text-white/80">
            {summaryCourseCode && summaryText ? `${summaryCourseCode}: ${summaryText}` : reply}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => setReply(EAGLE_REPLIES[0])} className="study-eagle-chip">Study tip</button>
            <button onClick={() => setReply(course ? `For ${course.code}, check the prerequisite path before enrolling.` : EAGLE_REPLIES[1])} className="study-eagle-chip">Help me choose</button>
            <button onClick={() => setReply(EAGLE_REPLIES[2])} className="study-eagle-chip">Plan a semester</button>
          </div>
        </div>
      )}

      <div className={`relative ${celebrating ? "study-eagle-celebrating" : ""} study-eagle-${animation}`}>
        <div className={`study-eagle-spark ${petCount ? "study-eagle-spark-visible" : ""}`} aria-hidden="true">✦</div>
        {celebrating && <div className="study-eagle-confetti" aria-hidden="true">✦ · ✧ ✦ · ✧</div>}
        <button
          type="button"
          aria-label={`Study Eagle. ${animation === "sleeping" ? "Sleeping. " : ""}Click to pet, drag to fly.`}
          title="Click to pet · drag to fly"
          onClick={petEagle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="study-eagle-button"
        >
          <span
            className={`study-eagle-sprite ${animation === "sleeping" ? "study-eagle-sprite-sleeping" : ""}`}
            style={{
              backgroundPosition:
                animation === "sleeping"
                  ? `${frame * 33.333}% 0%`
                  : `${frame * 50}% ${direction === "down" ? "0%" : direction === "up" ? "100%" : direction === "left" ? "33.333%" : "66.666%"}`,
            }}
          />
        </button>
        <div className="study-eagle-shadow" aria-hidden="true" />
        <div className="study-eagle-controls">
          <button type="button" onClick={() => setChatOpen((open) => !open)} aria-label="Chat with Study Eagle" title="Chat with Study Eagle"><MessageCircle className="h-3.5 w-3.5" /></button>
        </div>
      </div>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(start: number, end: number, progress: number) {
  const eased = 1 - (1 - Math.max(0, Math.min(1, progress))) ** 3;
  return start + (end - start) * eased;
}

function getNormalPerchPosition(): Position {
  return { x: window.innerWidth - 132, y: window.innerHeight - 150 };
}

function getSleepPerchPosition(): Position {
  return { x: window.innerWidth - 132, y: window.innerHeight - 84 };
}

function makeCourseSummary(course: Course) {
  const description = course.description
    .replace(/\s+/g, " ")
    .replace(/\s*(?:\.\.\.|…)\s*$/, "")
    .replace(/^\([^)]*\)\s*/i, "")
    .trim();
  const lead = description.split(/(?<=[.!?])\s+/)[0] ?? description;
  const cleanedLead = lead
    .replace(/^this course (?:will )?(?:introduces?|explores?|examines?|surveys?)\s+(?:students to\s+)?/i, "")
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
  const summary = /^anthropology is the global and holistic study of human biology and behaviour/i.test(lead)
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
  const completeSummary = summary.length <= maxLength
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

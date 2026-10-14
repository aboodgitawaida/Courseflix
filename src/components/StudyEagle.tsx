import {
  Bookmark,
  Feather,
  FileText,
  GitBranch,
  Lightbulb,
  MessageCircle,
  Search,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { COURSES, getCourse, type Course } from "@/lib/courses";
import { loadDescriptions, peekDescriptions } from "@/lib/course-description";
import { useEagle } from "@/hooks/use-eagle";
import { useCourseUI } from "@/hooks/use-course-ui";
import { useTypewriter } from "@/hooks/use-typewriter";
import { announce } from "@/lib/a11y";
import { courseSummary, lighterOptions, prereqSentence } from "@/lib/eagle-chat";
import { useAllCourseStats } from "@/lib/ratings";
import { EAGLE_LINES } from "@/lib/eagle-lines";
import { EAGLE_AVOID_SELECTOR, choosePanelSpot, type PanelSpot } from "@/lib/eagle-layout";
import { pickEagleLine, takeLateNightLine } from "@/lib/study-eagle";

const SPRITE_MODES = [
  "awake",
  "fallingAsleep",
  "sleeping",
  "wakingUp",
  "celebrating",
  "petting",
  "reading",
] as const;
type EagleMode = (typeof SPRITE_MODES)[number];

const EAGLE_REPLIES = EAGLE_LINES.tips;

/** Where the perch sits on the right edge, as a fraction of the viewport height. */
const PERCH_KEY = "courseflix.eagle.perchY";
const DEFAULT_PERCH = 0.62;
const SLEEP_AFTER_MS = 20_000;
const CELEBRATE_MS = 1_100; // matches the 8-frame wing-flap in styles.css
const PET_MS = 900; // matches the 8-frame head-bob in styles.css
const FALL_ASLEEP_MS = 2_000; // matches the 8-frame yawn in styles.css
const WAKE_UP_MS = 1_200; // matches the 8-frame stretch in styles.css
/** On phones a celebration pops the tucked-away eagle out for this long. */
const POP_OUT_MS = 3_000;
const POP_OUT_EXIT_MS = 250; // the slide back out in styles.css
/** Frame size of the eagle sheets (art pixels) and how much they are scaled up. */
const FRAME = { w: 56, h: 68 };
const SCALE = { desktop: 2, compact: 1.5 };
/** Every sheet the eagle can switch to. Loaded up front so the first pet or
 * celebration doesn't flash an empty frame while its sheet downloads. */
const EAGLE_SHEETS = [
  "/eagle-awake.png",
  "/eagle-sleep.png",
  "/eagle-celebrate.png",
  "/eagle-pet.png",
  "/eagle-fallasleep.png",
  "/eagle-wakeup.png",
  "/eagle-reading.png",
];
// Holding the decoded images keeps them in memory for the life of the page.
let preloadedSheets: HTMLImageElement[] | null = null;

function preloadEagleSheets() {
  if (preloadedSheets) return;
  preloadedSheets = EAGLE_SHEETS.map((src) => {
    const img = new Image();
    img.src = src;
    img.decode().catch(() => {});
    return img;
  });
}

export function StudyEagle() {
  const { enabled } = useEagle();
  const [perch, setPerch] = useState<number | null>(null);
  const [compact, setCompact] = useState(false);
  // On phones the eagle stays tucked away as a small button until tapped.
  const [revealed, setRevealed] = useState(false);
  // A celebration on a phone briefly pops the eagle out, then slides it back.
  const [popOut, setPopOut] = useState<"in" | "out" | null>(null);
  const [mode, setMode] = useState<EagleMode>("awake");
  const [chatOpen, setChatOpen] = useState(false);
  const [reply, setReply] = useState<string>(EAGLE_REPLIES[0]);
  // Courses a reply links to (Lighter options), opened as previews.
  const [replyLinks, setReplyLinks] = useState<Course[]>([]);
  // Bumped for every summary (and Quick take) so it streams from the start.
  const [summaryRun, setSummaryRun] = useState(0);
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
  const petTimer = useRef<number | null>(null);
  const popTimer = useRef<number | null>(null);
  const revealedRef = useRef(false);
  const modeRef = useRef<EagleMode>("awake");
  // Desktop panel position (null until measured) and whether an auto-opened
  // summary had nowhere to go and folded into a teaser next to the eagle.
  const [panelSpot, setPanelSpot] = useState<Pick<PanelSpot, "left" | "top"> | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const autoOpened = useRef(false);
  const eagleRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const chatButtonRef = useRef<HTMLButtonElement>(null);
  const focusPanel = useRef(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const course = getCurrentCourse(pathname);
  const { openPreview, setSearchOpen } = useCourseUI();
  const { data: allStats, isError: statsFailed } = useAllCourseStats(
    enabled && (chatOpen || !!summaryCourseCode),
  );
  // The course the chat is about: the open preview's, else the course page's.
  const chatCourse = (summaryCourseCode && getCourse(summaryCourseCode)) || course;
  const summary =
    summaryCourseCode && summaryText
      ? courseSummary(summaryCourseCode, summaryText, allStats?.get(summaryCourseCode))
      : null;
  const typed = useTypewriter(summary ?? "", summaryRun);
  // While a summary streams in a visible panel, he reads it from a little book.
  const reading = !!summary && !typed.done && chatOpen && !collapsed;

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    revealedRef.current = revealed;
  }, [revealed]);

  // The sleep and wake transitions play once, then settle into the next state.
  useEffect(() => {
    if (mode !== "fallingAsleep" && mode !== "wakingUp") return;
    const timer = window.setTimeout(
      () => setMode(mode === "fallingAsleep" ? "sleeping" : "awake"),
      mode === "fallingAsleep" ? FALL_ASLEEP_MS : WAKE_UP_MS,
    );
    return () => window.clearTimeout(timer);
  }, [mode]);

  useEffect(() => {
    if (enabled) preloadEagleSheets();
  }, [enabled]);

  // Reading is the resting pose while a summary streams: a wake-up, pet or
  // celebration plays first and he goes back to the book after.
  useEffect(() => {
    if (reading && mode === "awake") setMode("reading");
    else if (!reading && mode === "reading") setMode("awake");
  }, [reading, mode]);

  // After midnight, a gentle nudge once per session. On phones the eagle is
  // tucked away, so it waits for the first tap instead (see petEagle).
  useEffect(() => {
    if (!enabled || isCompact()) return;
    const timer = window.setTimeout(() => {
      const line = takeLateNightLine();
      if (line) showStatus(line);
    }, 4_000);
    return () => window.clearTimeout(timer);
  }, [enabled]);

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
      setMode("fallingAsleep");
      const line = pickEagleLine("fallAsleep");
      if (line && !isCompact()) showStatus(line);
    }, SLEEP_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [activityVersion, mode, chatOpen, isDragging]);

  useEffect(() => {
    const onSummary = (event: Event) => {
      const { course, context } =
        (event as CustomEvent<{ course?: Course; context?: "preview" | "page" }>).detail ?? {};
      if (!course) return;
      // A new course is activity: wake up before reading it out.
      setActivityVersion((version) => version + 1);
      if (isDozing(modeRef.current)) setMode("wakingUp");
      setSummaryCourseCode(course.code);
      setSummaryContext(context ?? "preview");
      const cached = peekDescriptions();
      setSummaryText(makeCourseSummary(course, cached?.[course.code] ?? ""));
      setSummaryRun((run) => run + 1);
      setReply("");
      setReplyLinks([]);
      // On phones an auto-opened panel covers the course itself; the summary
      // waits until the eagle is tapped.
      if (!isCompact()) {
        setChatOpen((open) => {
          if (!open) autoOpened.current = true;
          return true;
        });
        setCollapsed(false);
      }
      if (!cached) {
        void loadDescriptions()
          .then((loaded) => setSummaryText(makeCourseSummary(course, loaded[course.code] ?? "")))
          .catch(() => {});
      }
    };
    const onClearSummary = () => {
      // A summary that opened by itself goes away with its course.
      if (autoOpened.current) {
        autoOpened.current = false;
        setChatOpen(false);
      }
      setCollapsed(false);
      setSummaryCourseCode(null);
      setSummaryContext(null);
      setSummaryText(null);
      setReply(EAGLE_REPLIES[0]);
    };
    const onCelebration = (event: Event) => {
      const { message } = (event as CustomEvent<{ message?: string }>).detail ?? {};
      setActivityVersion((version) => version + 1);
      if (message) showStatus(message);
      if (isCompact() && !revealedRef.current) {
        setPopOut("in");
        if (popTimer.current !== null) window.clearTimeout(popTimer.current);
        popTimer.current = window.setTimeout(() => {
          setPopOut("out");
          popTimer.current = window.setTimeout(() => {
            setPopOut(null);
            popTimer.current = null;
          }, POP_OUT_EXIT_MS);
        }, POP_OUT_MS);
      }
      setCelebrateKey((key) => key + 1);
      if (petTimer.current !== null) window.clearTimeout(petTimer.current);
      petTimer.current = null;
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
      if (petTimer.current !== null) window.clearTimeout(petTimer.current);
      if (popTimer.current !== null) window.clearTimeout(popTimer.current);
    };
  }, []);

  // Desktop: keep the panel off the prerequisite tree (anything marked
  // data-eagle-avoid). Re-checked on scroll, resize and while a preview
  // animates in. An auto-opened summary with nowhere to go folds into a teaser;
  // a panel the user opened goes wherever it covers the least.
  const panelVisible = chatOpen && !compact && !collapsed;
  useLayoutEffect(() => {
    if (!panelVisible) {
      setPanelSpot(null);
      return;
    }
    let frame = 0;
    const place = () => {
      frame = 0;
      const panel = panelRef.current;
      const eagle = eagleRef.current;
      if (!panel || !eagle) return;
      const e = eagle.getBoundingClientRect();
      const avoid = [...document.querySelectorAll(EAGLE_AVOID_SELECTOR)]
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0 && r.height > 0);
      const { spot, fallback } = choosePanelSpot(
        { width: window.innerWidth, height: window.innerHeight },
        { left: e.left, top: e.top, width: e.width, height: e.height },
        { width: panel.offsetWidth, height: panel.offsetHeight },
        avoid,
      );
      if (!spot && autoOpened.current) {
        setCollapsed(true);
        return;
      }
      const next = spot ?? fallback;
      setPanelSpot((current) =>
        current && current.left === next.left && current.top === next.top
          ? current
          : { left: next.left, top: next.top },
      );
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(place);
    };
    place();
    // A course preview zooms in after the panel opens; look again once it lands.
    const settle = [150, 400].map((ms) => window.setTimeout(schedule, ms));
    window.addEventListener("scroll", schedule, { capture: true, passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      settle.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", schedule);
    };
  }, [panelVisible, perch, summaryText, reply]);

  // Opening the chat on purpose moves focus into it (unless a dialog owns focus).
  useEffect(() => {
    if (!chatOpen || !focusPanel.current) return;
    if (!compact && !panelSpot) return; // wait until it's placed
    focusPanel.current = false;
    if (document.querySelector('[role="dialog"][data-state="open"]')) return;
    panelRef.current?.querySelector<HTMLElement>("[data-eagle-panel-title]")?.focus();
  }, [chatOpen, compact, panelSpot]);

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
    // Tapping a popped-out eagle on a phone keeps it out.
    if (popOut !== null) {
      if (popTimer.current !== null) window.clearTimeout(popTimer.current);
      popTimer.current = null;
      setPopOut(null);
      setRevealed(true);
    }
    if (isDozing(modeRef.current)) {
      setMode("wakingUp");
      const line = takeLateNightLine() ?? pickEagleLine("wokenUp");
      if (line) showStatus(line);
      return;
    }
    setPetKey((key) => key + 1);
    // Happy head-bob, unless it is mid-celebration (that wins).
    if (modeRef.current !== "celebrating") {
      setMode("petting");
      if (petTimer.current !== null) window.clearTimeout(petTimer.current);
      petTimer.current = window.setTimeout(() => {
        setMode("awake");
        petTimer.current = null;
      }, PET_MS);
    }
    setPetCount((count) => count + 1);
    const line = takeLateNightLine() ?? pickEagleLine("pet") ?? EAGLE_LINES.pet[0];
    showStatus(line);
    setSummaryCourseCode(null);
    setSummaryText(null);
    setReplyLinks([]);
    setReply(petCount % 2 === 0 ? line : EAGLE_REPLIES[petCount % EAGLE_REPLIES.length]);
  }

  function openChat() {
    autoOpened.current = false;
    focusPanel.current = true;
    setCollapsed(false);
    setChatOpen(true);
    setActivityVersion((version) => version + 1);
  }

  function closeChat() {
    const hadFocus = panelRef.current?.contains(document.activeElement) ?? false;
    autoOpened.current = false;
    setChatOpen(false);
    setCollapsed(false);
    if (isCompact()) setRevealed(false);
    else if (hadFocus) chatButtonRef.current?.focus();
  }

  function onPanelKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    // First Esc finishes a streaming summary; the next one closes the chat.
    if (summary && !typed.done) typed.skip();
    else closeChat();
  }

  /** Show a plain answer in the panel in place of the summary. */
  function answer(text: string, links: Course[] = []) {
    setActivityVersion((version) => version + 1);
    setSummaryText(null);
    setReply(text);
    setReplyLinks(links);
  }

  function quickTake(c: Course) {
    setActivityVersion((version) => version + 1);
    setReplyLinks([]);
    const cached = peekDescriptions();
    setSummaryCourseCode(c.code);
    setSummaryText(makeCourseSummary(c, cached?.[c.code] ?? ""));
    setSummaryRun((run) => run + 1);
  }

  // Highlights the tree, then gets out of its way: the answer is the tree itself.
  function showPrereqPath(c: Course) {
    const line = prereqSentence(c);
    const tree = document.querySelector<HTMLElement>(EAGLE_AVOID_SELECTOR);
    if (!tree) {
      answer(line);
      return;
    }
    announce(line);
    setReply(line);
    setSummaryText(null);
    setReplyLinks([]);
    if (isCompact()) closeChat();
    else setCollapsed(true);
    tree.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
    tree.classList.remove("eagle-highlight");
    void tree.offsetWidth; // restart the pulse on a repeat click
    tree.classList.add("eagle-highlight");
    window.setTimeout(() => tree.classList.remove("eagle-highlight"), 1_800);
  }

  function showLighterOptions(c: Course) {
    if (!allStats) {
      answer(
        statsFailed
          ? "I can't reach the reviews right now. Try again in a bit."
          : "Still fetching the reviews. Try again in a second.",
      );
      return;
    }
    const options = lighterOptions(c, COURSES, allStats);
    answer(
      options.length
        ? `Students found these ${c.subject} courses lighter on workload:`
        : `Not enough ${c.subject} reviews yet to find something lighter than ${c.code}.`,
      options,
    );
  }

  const chips: {
    icon: LucideIcon;
    label: string;
    tip: string;
    onClick?: () => void;
    to?: string;
  }[] = chatCourse
    ? [
        {
          icon: FileText,
          label: "Quick take",
          tip: `Replay the summary of ${chatCourse.code}`,
          onClick: () => quickTake(chatCourse),
        },
        {
          icon: GitBranch,
          label: "Prereq path",
          tip: `Show what you need before ${chatCourse.code}`,
          onClick: () => showPrereqPath(chatCourse),
        },
        {
          icon: Feather,
          label: "Lighter options",
          tip: `Similar ${chatCourse.subject} courses students found lighter`,
          onClick: () => showLighterOptions(chatCourse),
        },
      ]
    : [
        {
          icon: Lightbulb,
          label: "Study tip",
          tip: "A quick tip for picking courses",
          onClick: () => answer(pickEagleLine("tips") ?? EAGLE_REPLIES[0]),
        },
        { icon: Bookmark, label: "My shortlist", tip: "Courses you've saved", to: "/list" },
        {
          icon: Search,
          label: "Find a course",
          tip: "Search every UTM course",
          onClick: () => {
            closeChat();
            setSearchOpen(true);
          },
        },
      ];

  function showStatus(message: string) {
    if (messageTimer.current !== null) window.clearTimeout(messageTimer.current);
    setStatusMessage(message);
    messageTimer.current = window.setTimeout(() => {
      setStatusMessage(null);
      messageTimer.current = null;
    }, 2_800);
  }

  if (!enabled || perch === null) return null;

  if (compact && !revealed && popOut === null) {
    return (
      <button
        type="button"
        className="study-eagle-tuck"
        onClick={() => {
          setRevealed(true);
          openChat();
          if (isDozing(modeRef.current)) setMode("wakingUp");
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

  return (
    <>
      {chatOpen && !(collapsed && !compact) && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby="study-eagle-panel-title"
          onKeyDown={onPanelKeyDown}
          className={`study-eagle-panel rounded-2xl border border-amber-300/25 bg-[#17120d]/95 p-4 text-white shadow-2xl shadow-black/50 backdrop-blur-xl ${
            compact ? "study-eagle-sheet" : "study-eagle-docked w-[min(300px,calc(100vw-2rem))]"
          }`}
          // Docked panels stay hidden until measured, so they never flash over the tree.
          style={
            compact
              ? undefined
              : panelSpot
                ? { left: panelSpot.left, top: panelSpot.top }
                : { left: 0, top: 0, visibility: "hidden" }
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div
                id="study-eagle-panel-title"
                data-eagle-panel-title
                tabIndex={-1}
                className="flex items-center gap-2 text-sm font-bold text-amber-200 outline-none"
              >
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
          <div
            aria-live="polite"
            aria-busy={summary ? !typed.done : undefined}
            className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm leading-relaxed text-white/80"
          >
            {summary ? (
              // The full text sits underneath, invisible, so the box is its final
              // size from the first word and the panel never jumps while streaming.
              // Screen readers get the whole summary once, when it's done.
              <button
                type="button"
                onClick={typed.skip}
                disabled={typed.done}
                className="study-eagle-stream grid w-full text-left"
                aria-label={typed.done ? undefined : "Show the whole summary"}
              >
                <span className="invisible col-start-1 row-start-1" aria-hidden="true">
                  {summary}
                </span>
                <span className="col-start-1 row-start-1" aria-hidden="true">
                  {/* Each word pops in as it's "said"; earlier words stay mounted. */}
                  {typed.words.map((word, i) => (
                    <span key={i} className="study-eagle-word">
                      {i > 0 ? " " : ""}
                      {word}
                    </span>
                  ))}
                  {!typed.done && <span className="study-eagle-caret" />}
                </span>
                <span className="sr-only">{typed.done ? summary : ""}</span>
              </button>
            ) : (
              <>
                {reply}
                {replyLinks.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {replyLinks.map((c) => (
                      <li key={c.code}>
                        <button
                          type="button"
                          onClick={() => openPreview(c.code)}
                          className="text-left font-semibold text-amber-200 underline-offset-2 hover:underline"
                        >
                          {c.code}
                          <span className="font-normal text-white/60"> · {c.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map(({ icon: Icon, label, tip, onClick, to }) =>
              to ? (
                <Link
                  key={label}
                  to={to}
                  onClick={closeChat}
                  title={tip}
                  className="study-eagle-chip"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {label}
                </Link>
              ) : (
                <button
                  key={label}
                  type="button"
                  onClick={onClick}
                  title={tip}
                  className="study-eagle-chip"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {label}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      <div
        ref={eagleRef}
        className={`study-eagle fixed ${isDragging ? "study-eagle-dragging" : ""} ${
          popOut ? `study-eagle-pop-${popOut}` : ""
        }`}
        // Flush to the edge: the branch grows out of the side of the screen.
        style={{ right: 0, top, width: size.w }}
      >
        {collapsed && chatOpen && !compact && summaryCourseCode ? (
          <button type="button" className="study-eagle-teaser" onClick={openChat}>
            {summaryText ? "Quick take on" : "Back to chat about"} {summaryCourseCode}
          </button>
        ) : (
          statusMessage &&
          !(chatOpen && !collapsed) && (
            <div className="study-eagle-status" role="status">
              {statusMessage}
            </div>
          )
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
            aria-label={`Study Eagle. ${isDozing(mode) ? "Sleeping. " : ""}Tap to pet, drag the branch up or down.`}
            title="Tap to pet · drag the branch up or down"
            onClick={petEagle}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="study-eagle-button"
          >
            {/* One layer per sheet, always mounted, so switching states never swaps the
              image on an element (some browsers draw a blank frame while they do).
              Only the active layer shows and animates; becoming active starts its
              animation from frame 1. A repeat pet or celebration remounts that layer. */}
            {SPRITE_MODES.map((sprite) => (
              <span
                key={
                  sprite === "celebrating"
                    ? `celebrate-${celebrateKey}`
                    : sprite === "petting"
                      ? `pet-${petKey}`
                      : sprite
                }
                className={`study-eagle-sprite study-eagle-sprite-${sprite} ${
                  sprite === mode ? "is-active" : ""
                }`}
              />
            ))}
          </button>
          <div className="study-eagle-controls">
            <button
              ref={chatButtonRef}
              type="button"
              onClick={() => (chatOpen && !collapsed ? closeChat() : openChat())}
              aria-expanded={chatOpen && !collapsed}
              aria-label="Chat with Study Eagle"
              title="Chat with Study Eagle"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
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

/** Asleep or nodding off: anything that should wake it plays the wake-up. */
function isDozing(mode: EagleMode) {
  return mode === "sleeping" || mode === "fallingAsleep";
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
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

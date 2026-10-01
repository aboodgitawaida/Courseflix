import { MessageCircle, Pause, Play, RotateCcw, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useRouterState } from "@tanstack/react-router";
import { getCourse, type Course } from "@/lib/courses";

type Position = { x: number; y: number };

const EAGLE_REPLIES = [
  "Try the course preview first, then shortlist anything that still feels like a good fit.",
  "A good study plan starts with your prerequisites. Follow the path on the full course page.",
  "Compare workload and difficulty together. A high rating is not always an easy semester.",
];

export function StudyEagle() {
  const [position, setPosition] = useState<Position | null>(null);
  const [frame, setFrame] = useState(0);
  const [paused, setPaused] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [reply, setReply] = useState(EAGLE_REPLIES[0]);
  const [petCount, setPetCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });
  const didDrag = useRef(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const course = getCurrentCourse(pathname);

  useEffect(() => {
    setPosition({ x: window.innerWidth - 132, y: window.innerHeight - 150 });
  }, []);

  useEffect(() => {
    if (paused || isDragging) return;
    const timer = window.setInterval(() => setFrame((current) => (current + 1) % 3), 220);
    return () => window.clearInterval(timer);
  }, [isDragging, paused]);

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!position) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOffset.current = { x: event.clientX - position.x, y: event.clientY - position.y };
    didDrag.current = false;
    setIsDragging(true);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!isDragging) return;
    didDrag.current = true;
    setPosition({
      x: clamp(event.clientX - dragOffset.current.x, 8, window.innerWidth - 104),
      y: clamp(event.clientY - dragOffset.current.y, 72, window.innerHeight - 112),
    });
  }

  function onPointerUp() {
    setIsDragging(false);
  }

  function petEagle() {
    if (isDragging || didDrag.current) return;
    setPetCount((count) => count + 1);
    setReply(petCount % 2 === 0 ? "Krrr! That tickles. You have got this." : EAGLE_REPLIES[petCount % EAGLE_REPLIES.length]);
  }

  function resetPosition() {
    setPosition({ x: window.innerWidth - 132, y: window.innerHeight - 150 });
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
            {course ? `${course.code}: ${reply}` : reply}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => setReply(EAGLE_REPLIES[0])} className="study-eagle-chip">Study tip</button>
            <button onClick={() => setReply(course ? `For ${course.code}, check the prerequisite path before enrolling.` : EAGLE_REPLIES[1])} className="study-eagle-chip">Help me choose</button>
            <button onClick={() => setReply(EAGLE_REPLIES[2])} className="study-eagle-chip">Plan a semester</button>
          </div>
        </div>
      )}

      <div className="relative">
        <div className={`study-eagle-spark ${petCount ? "study-eagle-spark-visible" : ""}`} aria-hidden="true">✦</div>
        <button
          type="button"
          aria-label="Study Eagle. Click to pet, drag to fly."
          title="Click to pet · drag to fly"
          onClick={petEagle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="study-eagle-button"
        >
          <span className="study-eagle-sprite" style={{ backgroundPosition: `${frame * 50}% 0%` }} />
        </button>
        <div className="study-eagle-shadow" aria-hidden="true" />
        <div className="study-eagle-controls">
          <button type="button" onClick={() => setChatOpen((open) => !open)} aria-label="Chat with Study Eagle" title="Chat with Study Eagle"><MessageCircle className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? "Play eagle animation" : "Pause eagle animation"} title={paused ? "Play" : "Pause"}>{paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}</button>
          <button type="button" onClick={resetPosition} aria-label="Reset eagle position" title="Reset position"><RotateCcw className="h-3.5 w-3.5" /></button>
        </div>
      </div>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getCurrentCourse(pathname: string): Course | undefined {
  const match = pathname.match(/\/course\/([^/]+)/);
  return match ? getCourse(decodeURIComponent(match[1])) : undefined;
}

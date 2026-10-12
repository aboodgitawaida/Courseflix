import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import type { Course } from "@/lib/courses";
import { useAuth } from "@/hooks/use-auth";
import { prefersReducedMotion } from "@/hooks/use-reveal";
import { useShortlist, useToggleShortlist } from "@/lib/ratings";
import { useDescriptions } from "@/lib/course-description";
import { FEATURED_DESCRIPTIONS } from "@/lib/featured-descriptions";
import { OFFLINE_SUBJECT_IMAGE, getCourseImage } from "@/lib/subject-images";

const AUTO_MS = 6000;
const LEAVE_MS = 650;
const VISIBLE_DEPTH = 3;
// Past this share of the card width (or this flick speed in px/ms) a release throws the card.
const THROW_RATIO = 0.3;
const THROW_SPEED = 0.6;
const DRAG_SLOP = 6;
// Max hover tilt (deg) and how quickly tilt/drag ease toward the pointer (ms).
const TILT_Y = 8;
const TILT_X = 6;
const EASE_MS = 120;

type Motion = { rx: number; ry: number; px: number; py: number; dx: number };
const REST: Motion = { rx: 0, ry: 0, px: 0, py: 0, dx: 0 };

const heroImage = (subject: string) => getCourseImage(subject).replace("w=400", "w=900");

type Leaving = { course: Course; dir: 1 | -1; dx: number; id: number };

function DeckArt({ course, eager }: { course: Course; eager: boolean }) {
  const [src, setSrc] = useState(() => heroImage(course.subject));
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      draggable={false}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setSrc(OFFLINE_SUBJECT_IMAGE)}
      className="hero-course-image absolute inset-0 h-full w-full object-cover opacity-70"
    />
  );
}

export function HeroDeck({
  courses,
  index,
  onIndexChange,
}: {
  courses: Course[];
  index: number;
  onIndexChange: (index: number) => void;
}) {
  const n = courses.length;
  const current = courses[index % n]!;
  const navigate = useNavigate();
  const { signedIn } = useAuth();
  const { data: saved = [] } = useShortlist();
  const toggle = useToggleShortlist();
  const inList = saved.includes(current.code);

  const [leaving, setLeaving] = useState<Leaving | null>(null);
  const [interacted, setInteracted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  // Only the first card's description is bundled; the rest load once the deck moves.
  const descriptions = useDescriptions(index !== 0 || interacted);

  // Pointer handling lives on this container, which never moves. Listening on the
  // tilting card itself made its own rect feed back into the tilt (twitching) and
  // fired pointerleave whenever a tilted edge slid out from under the cursor.
  const deckRef = useRef<HTMLDivElement>(null);
  const motion = useRef({ cur: { ...REST }, target: { ...REST }, frame: 0, last: 0 });
  const drag = useRef<{
    id: number;
    x: number;
    t: number;
    dx: number;
    v: number;
    active: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const leaveId = useRef(0);

  useEffect(() => setReduced(prefersReducedMotion()), []);

  function go(step: 1 | -1, dx = 0) {
    if (n < 2) return;
    if (!reduced && step === 1) {
      leaveId.current += 1;
      setLeaving({ course: current, dir: dx < 0 ? -1 : 1, dx, id: leaveId.current });
    }
    onIndexChange((index + step + n) % n);
  }

  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => setLeaving(null), LEAVE_MS);
    return () => window.clearTimeout(t);
  }, [leaving]);

  // Auto-advance until the visitor takes over; pauses on hover, focus or a hidden tab.
  useEffect(() => {
    if (reduced || interacted || paused || n < 2) return;
    const t = window.setInterval(() => {
      if (!document.hidden) go(1, -1);
    }, AUTO_MS);
    return () => window.clearInterval(t);
  });

  function manual(step: 1 | -1) {
    setInteracted(true);
    go(step, step === 1 ? -1 : 0);
  }

  function write(m: Motion) {
    const el = deckRef.current;
    if (!el) return;
    el.style.setProperty("--rx", m.rx.toFixed(3));
    el.style.setProperty("--ry", m.ry.toFixed(3));
    el.style.setProperty("--px", m.px.toFixed(4));
    el.style.setProperty("--py", m.py.toFixed(4));
    el.style.setProperty("--dx", m.dx.toFixed(2));
  }

  // One rAF loop eases the motion toward its target and stops once settled, so
  // nothing toggles CSS transitions mid-gesture.
  function animate() {
    const m = motion.current;
    if (m.frame) return;
    m.last = 0;
    const tick = (t: number) => {
      const dt = m.last ? t - m.last : 16;
      m.last = t;
      const k = 1 - Math.exp(-dt / EASE_MS);
      let moving = false;
      for (const key of Object.keys(m.cur) as (keyof Motion)[]) {
        // A drag follows the pointer exactly; everything else eases.
        if (key === "dx" && drag.current?.active) m.cur.dx = m.target.dx;
        else m.cur[key] += (m.target[key] - m.cur[key]) * k;
        if (Math.abs(m.target[key] - m.cur[key]) > 0.001) moving = true;
      }
      if (!moving && !drag.current?.active) {
        m.cur = { ...m.target };
        write(m.cur);
        m.frame = 0;
        return;
      }
      write(m.cur);
      m.frame = requestAnimationFrame(tick);
    };
    m.frame = requestAnimationFrame(tick);
  }

  useEffect(() => () => cancelAnimationFrame(motion.current.frame), []);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (reduced || n < 2 || e.button !== 0) return;
    // Presses on the card's links and buttons are always clicks, never drags.
    if ((e.target as Element).closest("a, button")) return;
    drag.current = { id: e.pointerId, x: e.clientX, t: e.timeStamp, dx: 0, v: 0, active: false };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = deckRef.current;
    if (!el || reduced) return;
    const m = motion.current;
    const d = drag.current;
    if (d && d.id === e.pointerId) {
      const dx = e.clientX - d.x;
      if (!d.active) {
        if (Math.abs(dx) < DRAG_SLOP) return;
        // Capture only once it's a real drag, so plain clicks still reach the links.
        d.active = true;
        el.setPointerCapture(e.pointerId);
        el.dataset.dragging = "";
        setInteracted(true);
      }
      const dt = Math.max(e.timeStamp - d.t, 1);
      d.v = (dx - d.dx) / dt;
      d.dx = dx;
      d.t = e.timeStamp;
      m.target.dx = dx;
      animate();
    }
    if (e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const px = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1) - 0.5;
    const py = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1) - 0.5;
    el.dataset.hover = "";
    el.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
    m.target.ry = px * 2 * TILT_Y;
    m.target.rx = -py * 2 * TILT_X;
    m.target.px = px;
    m.target.py = py;
    animate();
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const el = deckRef.current;
    if (!d.active || !el) return;
    // Swallow the click this release may fire, but only that one: a drag that ends
    // without a click (touch, release off the deck) mustn't eat the next real click.
    suppressClick.current = true;
    window.setTimeout(() => (suppressClick.current = false), 0);
    delete el.dataset.dragging;
    const m = motion.current;
    const width = el.getBoundingClientRect().width;
    if (Math.abs(d.dx) > width * THROW_RATIO || Math.abs(d.v) > THROW_SPEED) {
      go(1, d.dx || d.v);
      // The thrown card animates out on its own; the next card starts centred.
      m.cur.dx = 0;
      write(m.cur);
    }
    m.target.dx = 0;
    animate();
  }

  function onPointerLeave() {
    const el = deckRef.current;
    if (!el || drag.current?.active) return;
    delete el.dataset.hover;
    motion.current.target = { ...REST };
    animate();
  }

  async function onToggleList() {
    if (!signedIn) {
      navigate({ to: "/auth", search: { redirect: `/course/${current.code}` } });
      return;
    }
    try {
      await toggle.mutateAsync({ code: current.code, saved: inList });
      toast.success(
        inList
          ? `${current.code} removed from your shortlist`
          : `${current.code} added to your shortlist`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update shortlist");
    }
  }

  const depth = Math.min(n, VISIBLE_DEPTH);
  const stack = Array.from({ length: depth }, (_, d) => courses[(index + d) % n]!);

  function face(course: Course, top: boolean) {
    const description = FEATURED_DESCRIPTIONS[course.code] ?? descriptions?.[course.code];
    return (
      <div
        className={`deck-face course-card-art relative aspect-[4/5] overflow-hidden rounded-[28px] bg-surface ${top ? "glow-ring shadow-2xl shadow-black/60" : ""}`}
      >
        <DeckArt course={course} eager={top} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
        <div className="deck-glare" aria-hidden="true" />
        <div className="deck-pop absolute left-4 top-4 flex items-center gap-2 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground">
          Top pick
        </div>
        <div className="deck-pop absolute inset-x-0 bottom-0 p-6">
          <div className="font-mega text-4xl font-black leading-none tracking-tighter text-white md:text-5xl">
            {course.code}
          </div>
          <div className="mt-2 text-lg font-semibold leading-snug text-white">{course.title}</div>
          {/* min-h reserves both lines so the card doesn't jump when the description loads. */}
          <p className="mt-2 line-clamp-2 min-h-[2lh] text-sm leading-relaxed text-white/80">
            {description}
          </p>
          <div className="mt-5 flex items-center gap-2">
            <Link
              to="/course/$code"
              params={{ code: course.code }}
              tabIndex={top ? undefined : -1}
              draggable={false}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 active:scale-[0.98]"
            >
              Course info <ArrowUpRight className="h-4 w-4" />
            </Link>
            {top ? (
              <button
                onClick={() => void onToggleList()}
                disabled={toggle.isPending}
                aria-pressed={inList}
                aria-label={
                  inList ? `Remove ${course.code} from my list` : `Add ${course.code} to my list`
                }
                className="grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur transition hover:border-white active:scale-[0.95] disabled:opacity-60"
              >
                {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </button>
            ) : (
              <span
                aria-hidden="true"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-black/45 text-white"
              >
                <Plus className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Top picks for your program"
      className="relative mx-auto w-full max-w-[420px] lg:mr-0"
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          manual(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          manual(-1);
        }
      }}
    >
      <p className="sr-only" aria-live={interacted ? "polite" : "off"} aria-atomic="true">
        {`Card ${(index % n) + 1} of ${n}: ${current.code}, ${current.title}`}
      </p>

      <div
        ref={deckRef}
        data-grab={!reduced && n > 1 ? "" : undefined}
        className="hero-deck relative aspect-[4/5] select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={onPointerLeave}
        onClickCapture={(e) => {
          if (!suppressClick.current) return;
          suppressClick.current = false;
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {stack
          .map((course, d) => {
            const top = d === 0;
            return (
              <div
                key={course.code}
                data-depth={d}
                aria-hidden={top ? undefined : true}
                inert={top ? undefined : true}
                className={`deck-card absolute inset-0 ${top ? "deck-top" : ""}`}
              >
                <div className="deck-tilt h-full w-full">{face(course, top)}</div>
              </div>
            );
          })
          .reverse()}
        {leaving && (
          <div
            key={`leave-${leaving.id}`}
            aria-hidden="true"
            inert
            className="deck-card deck-leaving absolute inset-0"
            style={
              {
                "--dx": leaving.dx,
                "--dir": leaving.dir,
              } as React.CSSProperties
            }
          >
            <div className="deck-tilt h-full w-full">{face(leaving.course, false)}</div>
          </div>
        )}
      </div>

      {n > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-1.5">
            {courses.map((c, i) => (
              <button
                key={c.code}
                type="button"
                aria-label={`Show ${c.code}`}
                aria-current={i === index % n ? "true" : undefined}
                onClick={() => {
                  setInteracted(true);
                  if (i !== index % n) onIndexChange(i);
                }}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === index % n ? "w-7 bg-brand" : "w-1.5 bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="mr-1 font-mega text-xs font-bold tabular-nums text-muted-foreground">
              {String((index % n) + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
            <button
              type="button"
              aria-label="Previous course"
              onClick={() => manual(-1)}
              className="glass grid h-9 w-9 place-items-center rounded-full transition hover:border-brand/50 active:scale-[0.95]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next course"
              onClick={() => manual(1)}
              className="glass grid h-9 w-9 place-items-center rounded-full transition hover:border-brand/50 active:scale-[0.95]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

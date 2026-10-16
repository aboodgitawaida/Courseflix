import { useMemo } from "react";
import { Feather, Skull, Sparkles } from "lucide-react";
import { useBirdCourses } from "@/lib/ratings";
import { getTiers, groupByYear } from "@/lib/tiers";
import { CourseRail } from "@/components/CourseRail";
import { useReveal } from "@/hooks/use-reveal";

const SPARKLE_SPOTS = [6, 20, 34, 52, 68, 82, 93];
const EMBER_SPOTS = [4, 15, 27, 41, 58, 71, 86, 95];

/** Bird courses (gold) or the danger zone (red), as rows like the rest of the page. */
export function TierView({ kind }: { kind: "bird" | "danger" }) {
  const { data: birdMentions } = useBirdCourses();
  const tiers = useMemo(() => getTiers(birdMentions), [birdMentions]);
  const courses = kind === "bird" ? tiers.birds : tiers.danger;
  const rows = useMemo(() => groupByYear(courses), [courses]);
  const bird = kind === "bird";
  const headRef = useReveal<HTMLDivElement>();

  return (
    <section
      className={`tier ${bird ? "tier-bird" : "tier-danger"}`}
      aria-label={bird ? "Bird courses" : "Danger zone"}
    >
      <div className="tier-bg" aria-hidden="true">
        {(bird ? SPARKLE_SPOTS : EMBER_SPOTS).map((x, i) => (
          <span
            key={x}
            className={bird ? "tier-mote" : "tier-ember"}
            style={{ left: `${x}%`, animationDelay: `${i * (bird ? 0.7 : 0.45)}s` }}
          />
        ))}
      </div>
      {!bird && (
        <div className="hazard-tape" aria-hidden="true">
          <span>{"DANGER ✕ ".repeat(24)}</span>
        </div>
      )}
      <div ref={headRef} className={`reveal relative px-6 md:px-10 ${bird ? "" : "pt-6"}`}>
        <p className="tier-eyebrow">
          {bird ? (
            <>
              <Sparkles className="h-4 w-4" aria-hidden="true" /> Easy marks, per Reddit and
              students
            </>
          ) : (
            <>
              <Skull className="h-4 w-4" aria-hidden="true" /> Enter at your own risk
            </>
          )}
        </p>
        {bird ? (
          <h3 className="tier-title tier-title-bird">
            <Feather className="tier-title-icon" aria-hidden="true" />
            Bird courses
          </h3>
        ) : (
          <h3 className="tier-title tier-title-danger" data-text="Danger zone">
            Danger zone
          </h3>
        )}
        <p className="tier-count">
          {courses.length} course{courses.length === 1 ? "" : "s"}
          {bird ? "" : " students warn about"}
        </p>
      </div>
      {rows.length ? (
        <div className="relative mt-4 space-y-8 pb-6 md:space-y-10">
          {rows.map((row, i) => (
            <CourseRail
              key={row.key}
              index={i}
              gold={bird}
              danger={!bird}
              progressive
              rail={{
                title: row.title,
                blurb: `${row.courses.length} ${bird ? "bird" : "danger zone"} course${row.courses.length === 1 ? "" : "s"}`,
                codes: row.courses.map((c) => c.code),
              }}
            />
          ))}
        </div>
      ) : (
        <p className="relative px-6 py-8 text-sm text-neutral-400 md:px-10">
          No course has enough opinions yet.
        </p>
      )}
    </section>
  );
}

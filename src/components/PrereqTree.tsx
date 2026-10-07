import { ArrowRight } from "lucide-react";
import { getCourse, getNextSteps } from "@/lib/courses";
import { useCourseUI } from "@/hooks/use-course-ui";

function Pill({
  code,
  status,
  onClick,
}: {
  code: string;
  status: "Prerequisite" | "This course" | "Next Step";
  onClick?: () => void;
}) {
  const tone =
    status === "This course"
      ? "glow-ring border-brand/60 bg-brand/15 text-foreground shadow-lg shadow-brand/20"
      : status === "Prerequisite"
        ? "border-white/15 bg-white/[0.04] text-muted-foreground backdrop-blur"
        : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 backdrop-blur";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`rounded-2xl border px-4 py-3 text-left transition duration-300 ${tone} ${onClick ? "hover:-translate-y-0.5 hover:border-brand/60" : "cursor-default"}`}
    >
      <div className="font-mega text-sm font-bold tracking-tight">{code}</div>
      <div className="text-[10px] uppercase tracking-wider opacity-70">{status}</div>
    </button>
  );
}

export function PrereqTree({ code }: { code: string }) {
  const course = getCourse(code);
  const { openPreview } = useCourseUI();
  if (!course) return null;

  const prereqs = course.prereqs.filter((p) => getCourse(p)).slice(0, 4);
  const next = getNextSteps(course.code).slice(0, 4);

  if (prereqs.length === 0 && next.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No course prerequisites listed — {course.code} is an entry point.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {prereqs.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2">
            {prereqs.map((p) => (
              <Pill key={p} code={p} status="Prerequisite" onClick={() => openPreview(p)} />
            ))}
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-brand" />
        </>
      )}
      <Pill code={course.code} status="This course" />
      {next.length > 0 && (
        <>
          <ArrowRight className="h-4 w-4 shrink-0 text-brand" />
          <div className="flex flex-wrap gap-2">
            {next.map((n) => (
              <Pill key={n} code={n} status="Next Step" onClick={() => openPreview(n)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

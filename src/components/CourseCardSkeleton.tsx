export function CourseCardSkeleton({ size = "md" }: { size?: "md" | "lg" }) {
  const w = size === "lg" ? "w-[300px] md:w-[340px]" : "w-[240px] md:w-[280px]";

  return (
    <div
      aria-hidden="true"
      className={`skeleton-sweep relative shrink-0 ${w} overflow-hidden rounded-[20px] border border-white/[0.08] bg-surface`}
    >
      <div className="relative aspect-video bg-surface-2">
        <div className="absolute left-2 top-2 h-5 w-14 rounded-lg bg-white/[0.06]" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="h-6 w-24 rounded-md bg-white/[0.08]" />
          <div className="mt-2 h-3 w-36 rounded bg-white/[0.05]" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="h-4 w-10 rounded bg-brand/20" />
        <div className="h-4 w-10 rounded-lg bg-white/[0.05]" />
      </div>
      <div className="flex gap-1 px-3 pb-3">
        <div className="h-4 w-16 rounded-lg bg-white/[0.05]" />
        <div className="h-4 w-20 rounded-lg bg-white/[0.05]" />
      </div>
    </div>
  );
}

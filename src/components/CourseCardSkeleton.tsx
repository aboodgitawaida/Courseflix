export function CourseCardSkeleton({ size = "md" }: { size?: "md" | "lg" }) {
  const w = size === "lg" ? "w-[300px] md:w-[340px]" : "w-[240px] md:w-[280px]";
  
  return (
    <div className={`relative shrink-0 ${w} rounded-2xl border border-white/[0.08] bg-surface overflow-hidden`}>
      <div className="relative aspect-video bg-surface-2">
        <div className="absolute inset-0 animate-shimmer" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute top-2 left-2 h-5 w-12 rounded-lg bg-white/[0.04] backdrop-blur-md animate-shimmer" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="h-6 w-20 rounded bg-white/[0.04] animate-shimmer" />
          <div className="mt-1 h-3 w-32 rounded bg-white/[0.04] animate-shimmer" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="h-4 w-12 rounded bg-white/[0.04] animate-shimmer" />
        <div className="h-3 w-8 rounded bg-white/[0.04] animate-shimmer" />
      </div>
      <div className="flex flex-wrap gap-1 px-3 pb-3">
        <div className="h-4 w-16 rounded-lg border border-white/[0.08] bg-white/[0.04] backdrop-blur-md animate-shimmer" />
        <div className="h-4 w-20 rounded-lg border border-white/[0.08] bg-white/[0.04] backdrop-blur-md animate-shimmer" />
      </div>
    </div>
  );
}

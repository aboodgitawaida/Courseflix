export function CourseCardSkeleton({ size = "md" }: { size?: "md" | "lg" }) {
  const w = size === "lg" ? "w-[300px] md:w-[340px]" : "w-[240px] md:w-[280px]";
  
  return (
    <div className={`relative shrink-0 ${w} rounded-xl border border-white/10 bg-surface overflow-hidden`}>
      <div className="relative aspect-video bg-surface-2 animate-pulse">
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute top-2 left-2 h-5 w-12 rounded bg-white/10 backdrop-blur-md" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="h-6 w-20 rounded bg-white/10 animate-pulse" />
          <div className="mt-1 h-3 w-32 rounded bg-white/10 animate-pulse" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="h-4 w-12 rounded bg-white/10 animate-pulse" />
        <div className="h-3 w-8 rounded bg-white/10 animate-pulse" />
      </div>
      <div className="flex flex-wrap gap-1 px-3 pb-3">
        <div className="h-4 w-16 rounded border border-white/15 bg-white/10 backdrop-blur-md animate-pulse" />
        <div className="h-4 w-20 rounded border border-white/15 bg-white/10 backdrop-blur-md animate-pulse" />
      </div>
    </div>
  );
}

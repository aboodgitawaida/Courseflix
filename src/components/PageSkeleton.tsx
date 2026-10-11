/** Shown by the router while a route is pending. Mirrors the hero + stat tile layout. */
export function PageSkeleton() {
  return (
    <div className="min-h-screen px-6 pt-28 md:px-10" role="status" aria-label="Loading">
      <div className="skeleton-sweep h-6 w-48 rounded-full bg-white/[0.05]" />
      <div className="skeleton-sweep mt-6 h-[clamp(3rem,9vw,7rem)] w-3/4 max-w-3xl rounded-3xl bg-white/[0.06]" />
      <div className="skeleton-sweep mt-4 h-10 w-1/2 max-w-xl rounded-2xl bg-white/[0.04]" />
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-sweep glass h-32 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

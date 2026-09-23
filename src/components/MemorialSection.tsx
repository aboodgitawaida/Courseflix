export function MemorialSection() {
  return (
    <section aria-labelledby="memorial-title" className="px-6 pb-20 md:px-10">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-surface px-7 py-8 md:px-10 md:py-10">
        <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 md:flex-row md:gap-10">
          <div className="shrink-0 rounded-2xl border border-white/[0.12] bg-surface-2 p-2 shadow-card">
            <img
              src="/memorial-grandfather-focused.jpg"
              alt="Engineer Mohammad Ali Awaida seated in a blue jacket at a family gathering"
              className="h-72 w-52 rounded-xl object-cover object-center grayscale-[0.8] contrast-[0.95] md:h-80 md:w-60"
            />
          </div>
          <div className="relative text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
              In Loving Memory
            </p>
            <div className="mx-auto my-5 h-px w-16 bg-brand/60 md:mx-0" />
            <h2
              id="memorial-title"
              className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl"
            >
              Engineer Mohammad Ali Awaida
            </h2>
            <p className="mt-3 text-xl text-neutral-300 md:text-2xl" lang="ar" dir="rtl">
              المهندس محمد علي عُويضه السكافي
            </p>
            <p className="mt-7 text-lg font-semibold text-neutral-200">
              Abu Sami <span className="px-2 text-brand">·</span> أبو سامي
            </p>
            <p className="mt-3 text-sm text-neutral-500">September 20, 2026</p>
          </div>
        </div>
      </div>
    </section>
  );
}

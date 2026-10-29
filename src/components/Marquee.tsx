const TOP = ["Bird courses", "Real ratings", "Prereq trees", "Shortlists", "Compare", "Zero cost"];
const BOTTOM = ["CSC", "PSY", "ECO", "BIO", "MAT", "POL", "CCT", "ANT", "MGM", "ENG", "STA", "SOC"];

function Row({
  items,
  reverse,
  className,
}: {
  items: string[];
  reverse?: boolean;
  className: string;
}) {
  const content = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span key={item} className="flex items-center gap-6 px-6">
          {item}
          <span className="text-[0.6em] opacity-70">✦</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className={reverse ? "marquee-track-reverse" : "marquee-track"}>
        {content(false)}
        {content(true)}
      </div>
    </div>
  );
}

export function Marquee() {
  return (
    <section
      aria-label="What CourseFlix gives you"
      className="relative overflow-hidden py-10 md:py-14"
    >
      <div className="relative -mx-[5%] w-[110%]">
        <Row
          items={BOTTOM}
          reverse
          className="glass absolute inset-x-0 top-1/2 -translate-y-1/2 rotate-[2deg] py-3 font-mega text-xl font-bold uppercase text-foreground/40 md:text-3xl"
        />
        <Row
          items={TOP}
          className="relative -rotate-[2deg] bg-brand py-3 font-mega text-xl font-extrabold uppercase text-primary-foreground shadow-2xl shadow-brand/40 md:py-4 md:text-3xl"
        />
      </div>
    </section>
  );
}

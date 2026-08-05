import { NotebookPen, Video } from "lucide-react";

export function ComingSoon() {
  const items = [
    {
      icon: NotebookPen,
      title: "Student-Submitted Lecture Notes",
      body: "Upload and browse notes for every UTM course, sorted by term and professor.",
    },
    {
      icon: Video,
      title: "Recorded Lecture Hub",
      body: "A shared library of publicly available recorded lectures and review sessions.",
    },
  ];

  return (
    <section className="px-6 md:px-10 pb-16">
      <div className="rounded-3xl border border-brand/25 bg-brand/5 p-6 md:p-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand">
          Coming soon
        </span>
        <h2 className="font-display mt-3 text-3xl font-black md:text-4xl">The Student Hub</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Courseflix is expanding past course discovery. These two are in the works next.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {items.map((i) => (
            <div key={i.title} className="rounded-2xl border border-border/50 bg-surface p-5">
              <i.icon className="h-5 w-5 text-brand" />
              <h3 className="font-display mt-3 text-xl font-bold">{i.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{i.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

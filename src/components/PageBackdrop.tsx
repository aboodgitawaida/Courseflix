import { Spotlight } from "@/components/Spotlight";

/** Shared ambient background for inner pages: cursor glow, grain and drifting colour. */
export function PageBackdrop() {
  return (
    <>
      <Spotlight />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="mesh-blob -left-40 -top-40 h-[480px] w-[480px] bg-brand/15" />
        <div className="mesh-blob -right-40 top-1/3 h-[420px] w-[420px] bg-brand-2/10 [animation-delay:-8s]" />
      </div>
    </>
  );
}

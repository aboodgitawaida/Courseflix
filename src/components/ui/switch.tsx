import { cn } from "@/lib/utils";

/** Visual on/off track. Pair it with a control that carries role="switch" and aria-checked. */
export function SwitchTrack({ on, className }: { on: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-200",
        on ? "border-brand bg-brand" : "border-border bg-surface-2",
        className,
      )}
    >
      <span
        className={cn(
          "absolute left-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200",
          on ? "translate-x-4" : "translate-x-0",
        )}
      />
    </span>
  );
}

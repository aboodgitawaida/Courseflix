import { BadgeCheck } from "lucide-react";

export function VerifiedBadge({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <BadgeCheck
      role="img"
      aria-label="Verified creator"
      className={`inline-block shrink-0 align-[-0.15em] text-brand ${className}`}
    />
  );
}

import { useState } from "react";
import { FALLBACK_MAJOR_IMAGE, MAJOR_IMAGES } from "@/lib/major-images";
import type { MajorId } from "@/lib/majors";

type MajorCardProps = {
  majorId: MajorId;
  name: string;
  className?: string;
};

export function MajorCard({ majorId, name, className = "" }: MajorCardProps) {
  const [imageSrc, setImageSrc] = useState(MAJOR_IMAGES[majorId]);

  return (
    <article className={`overflow-hidden rounded-2xl border border-border/60 bg-surface ${className}`}>
      <img
        src={imageSrc}
        alt={`${name} program`}
        loading="lazy"
        decoding="async"
        width={400}
        height={225}
        className="h-full w-full object-cover"
        onError={() => {
          if (imageSrc !== FALLBACK_MAJOR_IMAGE) setImageSrc(FALLBACK_MAJOR_IMAGE);
        }}
      />
      <h3 className="p-4 font-display text-lg font-semibold">{name}</h3>
    </article>
  );
}

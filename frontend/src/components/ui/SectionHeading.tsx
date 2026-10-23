import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface SectionHeadingProps {
  title: ReactNode;
  intro?: string;
  className?: string;
  titleClassName?: string;
}

export function SectionHeading({ title, intro, className, titleClassName }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <h2
        className={cn(
          "text-[clamp(1.9rem,4.2vw,3.4rem)] leading-[1.15] text-bone",
          titleClassName,
        )}
      >
        {title}
      </h2>
      {intro ? (
        <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-bone/65 md:text-lg">
          {intro}
        </p>
      ) : null}
    </div>
  );
}

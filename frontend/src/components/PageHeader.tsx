import type { ReactNode } from "react";
import { cn } from "../lib/cn";

interface PageHeaderProps {
  title: string;
  intro?: string;
  meta?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ title, intro, meta, children, className }: PageHeaderProps) {
  return (
    <section
      aria-labelledby="page-title"
      className={cn(
        "relative overflow-hidden border-b border-bone/10 pb-12 pt-12 md:pb-16 md:pt-16",
        className,
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="dot-field absolute inset-y-0 end-0 w-2/5 text-bone/[0.07] [mask-image:linear-gradient(to_left,black,transparent)]" />
        <div className="absolute -top-32 end-[8%] h-64 w-64 rounded-full bg-forest-700/40 blur-[90px]" />
      </div>

      <div className="shell relative">
        {meta ? <div className="mb-4">{meta}</div> : null}
        <h1
          id="page-title"
          className="max-w-[18ch] text-[clamp(2.3rem,5.4vw,4.2rem)] leading-[1.12] text-bone"
        >
          {title}
        </h1>
        {intro ? (
          <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-bone/65 md:text-lg">
            {intro}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}

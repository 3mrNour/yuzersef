import { ArrowUpRight } from "@phosphor-icons/react";
import { cn } from "../../lib/cn";

export function CtaArrow({ className }: { className?: string }) {
  return (
    <ArrowUpRight
      aria-hidden="true"
      weight="bold"
      className={cn("h-4 w-4 shrink-0 rtl:-scale-x-100", className)}
    />
  );
}

export const buttonBase =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold leading-none transition-[background-color,border-color,color,transform] duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-60";

export function buttonClass(
  variant: "primary" | "secondary" = "primary",
  tone: "dark" | "light" = "dark",
): string {
  if (variant === "primary") {
    return `${buttonBase} bg-sand text-forest-950 hover:bg-sand-strong`;
  }

  if (tone === "light") {
    return `${buttonBase} border border-forest-950/25 text-forest-950 hover:bg-forest-950/10`;
  }

  return `${buttonBase} border border-bone/25 text-bone hover:border-bone/40 hover:bg-bone/10`;
}

export const cardRadius = "rounded-[var(--radius-card)]";

export const inputBase =
  "field aria-[invalid=true]:border-[#e79a80]";

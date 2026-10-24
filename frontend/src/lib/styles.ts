export const buttonBase =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold leading-none shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition-[background-color,border-color,color,transform,box-shadow] duration-200 hover:-translate-y-px hover:brightness-125 hover:shadow-[0_10px_32px_rgba(6,95,91,0.34)] active:translate-y-px disabled:pointer-events-none disabled:opacity-60";

export function buttonClass(
  variant: "primary" | "secondary" = "primary",
  tone: "dark" | "light" = "dark",
): string {
  if (variant === "primary") {
    return `${buttonBase} border border-sand-strong/70 bg-sand text-forest-950 hover:bg-sand-strong`;
  }

  if (tone === "light") {
    return `${buttonBase} border border-forest-950/25 text-forest-950 hover:bg-forest-950/10`;
  }

  return `${buttonBase} border border-bone/45 bg-forest-900/60 text-bone hover:border-sand hover:bg-sand/20 hover:text-bone`;
}

export const cardRadius = "rounded-[var(--radius-card)]";

export const inputBase =
  "field aria-[invalid=true]:border-[#e79a80]";

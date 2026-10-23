import { cn } from "../lib/cn";
import { useLanguage } from "../providers/LanguageProvider";
import { DemoTag } from "./ui/DemoTag";

interface StudioSlotProps {
  className?: string;
  note?: string;
}

/**
 * Placeholder for the real MockupStudio.
 * Replace the inner figure with <MockupStudio /> when it is ready.
 * The slot keeps the loading frame, label, and demo marker consistent.
 */
export function StudioSlot({ className, note }: StudioSlotProps) {
  const { t } = useLanguage();

  return (
    <figure
      data-studio-slot
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-card)] border border-bone/15 bg-forest-900",
        className,
      )}
    >
      <div className="relative">
        <img
          src="/portfolio/clothing-tee-halftone.svg"
          alt={t.hero.slides[0].alt}
          width={800}
          height={1000}
          loading="lazy"
          className="aspect-[4/5] w-full object-cover"
        />

        <div className="absolute inset-x-[21%] top-[27%] flex aspect-square items-center justify-center rounded-[18px] border-2 border-dashed border-sand/75 bg-forest-950/40 p-4 text-center backdrop-blur-[2px]">
          <span className="max-w-[16ch] text-xs leading-relaxed text-bone/90 sm:text-sm">
            {note ?? t.studio.placeholderNote}
          </span>
        </div>
      </div>

      <figcaption className="flex min-h-[52px] items-center justify-between gap-3 border-t border-bone/10 px-4 py-3">
        <span className="text-sm text-bone/75">{t.studio.frameLabel}</span>
        <DemoTag className="text-bone/70" />
      </figcaption>
    </figure>
  );
}

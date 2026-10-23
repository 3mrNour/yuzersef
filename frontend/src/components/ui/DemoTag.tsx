import { cn } from "../../lib/cn";
import { useLanguage } from "../../providers/LanguageProvider";

export function DemoTag({ className }: { className?: string }) {
  const { t } = useLanguage();

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-current px-2 py-0.5 font-latin text-[9px] font-semibold uppercase tracking-[0.16em] opacity-60",
        className,
      )}
    >
      {t.common.demo}
    </span>
  );
}

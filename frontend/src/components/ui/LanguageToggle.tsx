import { cn } from "../../lib/cn";
import { useLanguage } from "../../providers/LanguageProvider";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { lang, t, toggleLang } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={t.common.languageToggle}
      className={cn(
        "inline-flex h-11 min-w-[66px] items-center justify-center gap-1.5 rounded-full border border-bone/20 px-3 text-sm transition-colors hover:border-bone/40 hover:bg-bone/5",
        className,
      )}
    >
      <span
        className={cn(
          "font-display text-[0.95rem] leading-none",
          lang === "ar" ? "text-sand-strong" : "text-bone/45",
        )}
      >
        ع
      </span>
      <span aria-hidden="true" className="text-[0.65rem] text-bone/25">
        /
      </span>
      <span
        className={cn(
          "font-latin text-[0.68rem] font-semibold leading-none tracking-[0.08em]",
          lang === "en" ? "text-sand-strong" : "text-bone/45",
        )}
      >
        EN
      </span>
    </button>
  );
}

import { cn } from "../../lib/cn";
import { useLanguage } from "../../providers/LanguageProvider";

interface LogoProps {
  className?: string;
  markClassName?: string;
}

export function Logo({ className, markClassName }: LogoProps) {
  const { t } = useLanguage();

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <img
        src="/brand/logo.png"
        alt=""
        width={40}
        height={40}
        className={cn("h-9 w-9 shrink-0 object-contain", markClassName)}
      />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.3rem] font-semibold leading-none text-bone">
          {t.brand.name}
        </span>
        <span className="mt-1 font-latin text-[8px] font-medium uppercase tracking-[0.3em] text-bone/50">
          {t.brand.latin}
        </span>
      </span>
    </span>
  );
}

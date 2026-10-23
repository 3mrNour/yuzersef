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
        alt={t.brand.name}
        width={56}
        height={56}
        className={cn("h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14", markClassName)}
      />
    </span>
  );
}

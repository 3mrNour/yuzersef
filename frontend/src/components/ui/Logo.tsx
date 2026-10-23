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
        width={80}
        height={80}
        className={cn(
          "h-16 w-16 shrink-0 object-contain sm:h-18 sm:w-18 lg:h-20 lg:w-20",
          markClassName,
        )}
      />
    </span>
  );
}

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
        width={126}
        height={126}
        className={cn(
          "h-32 w-32 shrink-0 object-contain sm:h-32 sm:w-32 lg:h-32 lg:w-32",
          markClassName,
        )}
      />
    </span>
  );
}

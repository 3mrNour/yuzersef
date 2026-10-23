import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { buttonClass } from "../../lib/styles";
import { cn } from "../../lib/cn";

interface ButtonLinkProps {
  to?: string;
  href?: string;
  variant?: "primary" | "secondary";
  tone?: "dark" | "light";
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export function ButtonLink({
  to,
  href,
  variant = "primary",
  tone = "dark",
  className,
  children,
  onClick,
}: ButtonLinkProps) {
  const classes = cn(buttonClass(variant, tone), className);

  if (href) {
    const external = /^https?:/i.test(href);
    return (
      <a
        href={href}
        className={classes}
        onClick={onClick}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={to ?? "/"} className={classes} onClick={onClick}>
      {children}
    </Link>
  );
}

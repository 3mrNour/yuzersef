import { List, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/cn";
import { buttonClass } from "../lib/styles";
import { useLanguage } from "../providers/LanguageProvider";
import { useAuth } from "../providers/AuthProvider";
import { CtaArrow } from "./ui/CtaArrow";
import { LanguageToggle } from "./ui/LanguageToggle";
import { Logo } from "./ui/Logo";

export function Header() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-bone/10 bg-forest-950/85 backdrop-blur-md">
      <div className="shell flex h-[72px] items-center justify-between gap-4">
        <Link
          to="/"
          aria-label={t.common.home}
          className="shrink-0 rounded-full focus-visible:outline-offset-4"
        >
          <Logo />
        </Link>

        <nav aria-label={t.footer.linksTitle} className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {t.nav.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className="text-sm font-medium text-bone/70 transition-colors hover:text-bone"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to={user ? "/account" : "/auth"} className="hidden text-sm text-bone/70 hover:text-bone sm:block">
            {user ? user.name : "Sign in"}
          </Link>
          <div className="hidden sm:block">
            <LanguageToggle />
          </div>
          <div className="hidden lg:block">
            <Link to="/request" className={cn(buttonClass("primary"), "px-5 text-[0.82rem]")}>
              {t.common.requestCta}
              <CtaArrow />
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? t.common.closeMenu : t.common.openMenu}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-bone/20 text-bone transition-colors hover:bg-bone/5 lg:hidden"
          >
            {open ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-full border-b border-bone/10 bg-forest-950 lg:hidden"
        >
          <nav aria-label={t.footer.linksTitle} className="shell py-4">
            <ul className="divide-y divide-bone/10">
              {t.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="flex min-h-[52px] items-center text-base font-medium text-bone/85"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-3 pb-2">
              <Link to="/request" className={cn(buttonClass("primary"), "flex-1")}>
                {t.common.requestCta}
                <CtaArrow />
              </Link>
              <div className="sm:hidden">
                <LanguageToggle />
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

import {
  FacebookLogo,
  InstagramLogo,
  MapPin,
  Phone,
  TiktokLogo,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { contact } from "../content";
import { cn } from "../lib/cn";
import { buttonClass } from "../lib/styles";
import { useLanguage } from "../providers/LanguageProvider";
import { Logo } from "./ui/Logo";

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  const socials = [
    { label: contact.instagramHandle, href: contact.instagramHref, Icon: InstagramLogo },
    ...(contact.facebookHref ? [{ label: "يوزرسيف", href: contact.facebookHref, Icon: FacebookLogo }] : []),
    ...(contact.tiktokHref ? [{ label: "يوزرسيف", href: contact.tiktokHref, Icon: TiktokLogo }] : []),
  ];

  return (
    <footer className="border-t border-bone/10 bg-forest-950">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.35fr_0.55fr_0.9fr_0.75fr]">
          <div>
            <Link to="/" aria-label={t.common.home} className="inline-block">
              <Logo />
            </Link>
            <p className="mt-5 max-w-[34ch] text-sm leading-relaxed text-bone/60">
              {t.footer.blurb}
            </p>
            <a
              href={contact.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonClass("secondary"), "mt-6 px-5")}
            >
              <WhatsappLogo size={18} weight="fill" aria-hidden="true" />
              {t.common.whatsappCta}
            </a>
          </div>

          <div>
            <h2 className="text-xs font-semibold tracking-[0.14em] text-bone/45">
              {t.footer.linksTitle}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {t.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="inline-flex min-h-[44px] items-center text-sm text-bone/70 transition-colors hover:text-sand"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/request"
                  className="inline-flex min-h-[44px] items-center text-sm text-bone/70 transition-colors hover:text-sand"
                >
                  {t.common.requestCta}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold tracking-[0.14em] text-bone/45">
              {t.footer.contactTitle}
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-bone/70">
              <li>
                <a
                  href="tel:+201116891025"
                  className="inline-flex min-h-[44px] items-center gap-2 transition-colors hover:text-sand"
                >
                  <Phone size={16} aria-hidden="true" />
                  <span dir="ltr">{contact.whatsappDisplay}</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} aria-hidden="true" />
                {t.contact.location}
              </li>
              <li>
                <Link
                  to="/track"
                  className="inline-flex min-h-[44px] items-center text-bone/70 transition-colors hover:text-sand"
                >
                  {t.track.title}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold tracking-[0.14em] text-bone/45">
              {t.footer.followTitle}
            </h2>
            <ul className="mt-4 space-y-3">
              {socials.map(({ label, href, Icon }, index) => (
                <li key={`${href}-${index}`}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-2 text-sm text-bone/70 transition-colors hover:text-sand"
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span dir={index === 0 ? "ltr" : undefined}>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 overflow-hidden border-t border-bone/10 pt-8">
          <p
            aria-hidden="true"
            className="select-none whitespace-nowrap font-display text-[clamp(3.4rem,14vw,11rem)] leading-[0.85] text-bone/[0.045]"
          >
            {t.brand.name}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-bone/10 pt-6 text-xs text-bone/45 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {t.brand.name}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link to="/privacy" className="inline-flex min-h-[44px] items-center transition-colors hover:text-sand">
              {t.footer.privacy}
            </Link>
            <Link to="/terms" className="inline-flex min-h-[44px] items-center transition-colors hover:text-sand">
              {t.footer.terms}
            </Link>
            <span>{t.footer.competition}</span>
            <span>{t.footer.demoNote}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}


import { ArrowUpRight, InstagramLogo, MapPin, WhatsappLogo } from "@phosphor-icons/react";
import { contact } from "../content";
import { useLanguage } from "../providers/LanguageProvider";
import { ContactForm } from "../components/ContactForm";
import { ButtonLink } from "../components/ui/ButtonLink";
import { CtaArrow } from "../components/ui/CtaArrow";
import { Reveal } from "../components/ui/Reveal";
import { SectionHeading } from "../components/ui/SectionHeading";

export function Contact() {
  const { t } = useLanguage();

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative overflow-hidden border-t border-bone/10 py-20 md:py-28"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="dot-field absolute inset-y-0 start-0 w-1/3 text-bone/[0.06] [mask-image:linear-gradient(to_right,black,transparent)]" />
      </div>

      <div className="shell relative grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
        <Reveal>
          <SectionHeading
            title={<span id="contact-title">{t.contact.title}</span>}
            intro={t.contact.body}
          />

          <div className="mt-8 space-y-3">
            <a
              href={contact.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-[20px] border border-bone/15 bg-forest-900/70 p-5 transition-colors hover:border-sand/50"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sand text-forest-950">
                <WhatsappLogo aria-hidden="true" size={22} weight="fill" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-bone/55">{t.common.whatsappCta}</span>
                <span dir="ltr" className="mt-0.5 block font-latin text-lg text-bone">
                  {contact.whatsappDisplay}
                </span>
              </span>
              <ArrowUpRight
                aria-hidden="true"
                size={18}
                className="shrink-0 text-sand transition-transform duration-300 group-hover:-translate-y-0.5 rtl:-scale-x-100"
              />
            </a>

            <div className="border-y border-bone/10">
              <div className="flex items-center gap-4 py-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-bone/15 text-sand">
                  <MapPin aria-hidden="true" size={20} />
                </span>
                <div>
                  <p className="text-xs text-bone/50">{t.contact.locationLabel}</p>
                  <p className="mt-0.5 text-sm text-bone/85">{t.contact.location}</p>
                </div>
              </div>

              <a
                href={contact.instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 border-t border-bone/10 py-4 transition-colors hover:text-sand"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-bone/15 text-sand">
                  <InstagramLogo aria-hidden="true" size={20} />
                </span>
                <div>
                  <p className="text-xs text-bone/50">Instagram</p>
                  <p dir="ltr" className="mt-0.5 font-latin text-sm text-bone/85">
                    {contact.instagramHandle}
                  </p>
                </div>
              </a>
            </div>

            <ButtonLink to="/request" variant="secondary" className="w-full sm:w-auto">
              {t.common.requestCta}
              <CtaArrow />
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-[var(--radius-card)] border border-bone/15 bg-forest-900/75 p-6 shadow-[0_40px_100px_-60px_rgba(0,0,0,0.9)] md:p-8">
            <h3 className="text-2xl text-bone">{t.contact.formTitle}</h3>
            <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-bone/55">
              {t.contact.formIntro}
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

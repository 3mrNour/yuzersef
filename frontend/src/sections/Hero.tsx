import { useLanguage } from "../providers/LanguageProvider";
import { RotatingText } from "../components/reactbits/RotatingText";
import { ButtonLink } from "../components/ui/ButtonLink";
import { CtaArrow } from "../components/ui/CtaArrow";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative overflow-hidden border-b border-bone/10"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-44 end-[-8%] h-[520px] w-[520px] rounded-full bg-forest-700/45 blur-[110px]" />
        <div className="absolute bottom-[-12%] start-[-10%] h-[420px] w-[420px] rounded-full bg-sand/10 blur-[110px]" />
        <div className="dot-field absolute inset-y-0 end-0 w-[46%] text-bone/10 [mask-image:linear-gradient(to_left,black,transparent)]" />
      </div>

      <div className="shell relative grid gap-12 py-14 md:py-16 lg:min-h-[calc(100dvh-72px)] lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14 lg:py-20">
        <div className="max-w-[650px]">
          <p className="eyebrow-rule text-sm font-medium text-bone/65">{t.hero.eyebrow}</p>

          <h1
            id="hero-title"
            className="mt-5 text-[clamp(2.5rem,5.4vw,4.6rem)] font-semibold leading-[1.14] tracking-[-0.01em] text-bone"
          >
            <span className="block">{t.hero.titleLead}</span>
            <span className="mt-1 block text-sand">
              <RotatingText
                texts={t.hero.rotating}
                className="pb-[0.14em] -mb-[0.14em]"
              />
            </span>
          </h1>

          <p className="mt-6 max-w-[48ch] text-base leading-relaxed text-bone/70 md:text-lg">
            {t.hero.subtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink to="/request" className="w-full sm:w-auto">
              {t.common.requestCta}
              <CtaArrow />
            </ButtonLink>
            <ButtonLink to="/#work" variant="secondary" className="w-full sm:w-auto">
              {t.common.workCta}
            </ButtonLink>
          </div>
        </div>

        <div className="w-full">
          <img
            src="/brand/hero.png"
            alt={t.hero.imageAlt}
            width={1080}
            height={1080}
            fetchPriority="high"
            className="float-a mx-auto w-full max-w-[520px] drop-shadow-[0_50px_80px_rgba(0,0,0,0.6)] lg:max-w-none"
          />
        </div>
      </div>
    </section>
  );
}

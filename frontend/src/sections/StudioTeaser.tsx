import { useLanguage } from "../providers/LanguageProvider";
import { StudioSlot } from "../components/StudioSlot";
import { ButtonLink } from "../components/ui/ButtonLink";
import { CtaArrow } from "../components/ui/CtaArrow";
import { Reveal } from "../components/ui/Reveal";

export function StudioTeaser() {
  const { t } = useLanguage();

  return (
    <section
      aria-labelledby="studio-title"
      className="border-y border-bone/10 bg-forest-900/45 py-20 md:py-28"
    >
      <div className="shell grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        <Reveal>
          <h2
            id="studio-title"
            className="text-[clamp(1.9rem,4.2vw,3.4rem)] leading-[1.15] text-bone"
          >
            {t.studio.title}
          </h2>
          <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-bone/65 md:text-lg">
            {t.studio.body}
          </p>
          <ButtonLink to="/studio" variant="secondary" className="mt-8 w-full sm:w-auto">
            {t.studio.cta}
            <CtaArrow />
          </ButtonLink>
        </Reveal>

        <Reveal delay={0.12} className="mx-auto w-full max-w-[560px] lg:max-w-none">
          <StudioSlot />
        </Reveal>
      </div>
    </section>
  );
}

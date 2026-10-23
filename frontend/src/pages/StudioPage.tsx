import { useLanguage } from "../providers/LanguageProvider";
import { PageHeader } from "../components/PageHeader";
import { StudioSlot } from "../components/StudioSlot";
import { ButtonLink } from "../components/ui/ButtonLink";
import { CtaArrow } from "../components/ui/CtaArrow";

export function StudioPage() {
  const { t } = useLanguage();

  return (
    <>
      <PageHeader title={t.studioPage.title} intro={t.studioPage.intro} />

      <div className="shell py-12 md:py-16">
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <StudioSlot note={t.studioPage.placeholderNote} />

          <div className="lg:sticky lg:top-24">
            <h2 className="text-2xl leading-snug text-bone md:text-3xl">{t.studio.title}</h2>
            <p className="mt-4 text-base leading-relaxed text-bone/65">{t.studio.body}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/request" className="w-full sm:w-auto">
                {t.studioPage.cta}
                <CtaArrow />
              </ButtonLink>
              <ButtonLink to="/#work" variant="secondary" className="w-full sm:w-auto">
                {t.studioPage.worksCta}
              </ButtonLink>
            </div>

            <p className="mt-8 border-t border-bone/10 pt-5 text-xs leading-relaxed text-bone/45">
              {t.studio.placeholderNote}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

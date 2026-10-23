import { useLanguage } from "../providers/LanguageProvider";
import { ButtonLink } from "../components/ui/ButtonLink";
import { CtaArrow } from "../components/ui/CtaArrow";

export function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <section className="shell flex min-h-[62vh] flex-col justify-center py-20">
      <p
        aria-hidden="true"
        className="font-latin text-[clamp(4rem,14vw,9rem)] leading-none text-bone/10"
      >
        404
      </p>
      <h1 className="mt-4 max-w-[20ch] text-[clamp(2rem,4.6vw,3.4rem)] leading-tight text-bone">
        {t.notFound.title}
      </h1>
      <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-bone/60">
        {t.notFound.body}
      </p>
      <ButtonLink to="/" className="mt-8 w-full sm:w-auto">
        {t.notFound.cta}
        <CtaArrow />
      </ButtonLink>
    </section>
  );
}

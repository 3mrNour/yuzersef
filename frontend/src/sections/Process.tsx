import { Info } from "@phosphor-icons/react";
import { useLanguage } from "../providers/LanguageProvider";
import { ProcessFlow } from "../components/ProcessFlow";
import { Reveal } from "../components/ui/Reveal";
import { SectionHeading } from "../components/ui/SectionHeading";

export function Process() {
  const { t } = useLanguage();

  return (
    <section id="process" className="relative py-20 md:py-28">
      <div className="shell">
        <Reveal>
          <SectionHeading title={t.process.title} intro={t.process.intro} />
        </Reveal>

        <Reveal delay={0.08} className="mt-12">
          <ProcessFlow />
        </Reveal>

        <p className="mt-8 flex items-start gap-3 rounded-2xl border border-sand/15 bg-sand/[0.06] px-4 py-3.5 text-xs leading-relaxed text-bone/60 sm:mt-10 sm:px-5">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sand/15 text-sand">
            <Info aria-hidden="true" size={15} />
          </span>
          <span className="pt-0.5">{t.process.note}</span>
        </p>
      </div>
    </section>
  );
}

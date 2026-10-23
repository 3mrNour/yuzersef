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

        <p className="mt-8 flex items-start gap-2 border-t border-bone/10 pt-5 text-xs leading-relaxed text-bone/50">
          <Info aria-hidden="true" size={15} className="mt-0.5 shrink-0" />
          <span>{t.process.note}</span>
        </p>
      </div>
    </section>
  );
}

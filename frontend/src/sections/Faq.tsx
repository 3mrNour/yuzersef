import { useLanguage } from "../providers/LanguageProvider";
import { FaqAccordion } from "../components/FaqAccordion";
import { Reveal } from "../components/ui/Reveal";
import { SectionHeading } from "../components/ui/SectionHeading";

export function Faq() {
  const { t } = useLanguage();

  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="shell grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
        <Reveal>
          <SectionHeading
            title={t.faq.title}
            titleClassName="text-[clamp(1.7rem,3.2vw,2.6rem)]"
          />
        </Reveal>
        <Reveal delay={0.08}>
          <FaqAccordion />
        </Reveal>
      </div>
    </section>
  );
}

import { useLanguage } from "../providers/LanguageProvider";
import { Reveal } from "../components/ui/Reveal";
import { SectionHeading } from "../components/ui/SectionHeading";

export function About() {
  const { t } = useLanguage();

  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="relative overflow-hidden border-y border-bone/10 py-20 md:py-28"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -end-8 top-10 select-none font-display text-[18rem] leading-none text-bone/[0.035] md:text-[26rem]"
      >
        ي
      </span>

      <div className="shell relative grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <Reveal>
          <SectionHeading
            title={<span id="about-title">{t.about.title}</span>}
            className="max-w-[30ch]"
          />

          <div className="mt-6 max-w-[58ch] space-y-4 text-base leading-relaxed text-bone/65">
            {t.about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <p className="mt-8 flex items-center gap-3 font-display text-lg text-sand">
            <span aria-hidden="true" className="h-px w-8 bg-sand/60" />
            {t.brand.tagline}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <ol>
            {t.about.principles.map((principle, index) => (
              <li
                key={principle.title}
                className="group border-t border-bone/15 py-6 last:border-b"
              >
                <div className="flex items-start gap-4">
                  <span className="mt-1 font-latin text-[11px] tracking-[0.16em] text-sand/60 transition-colors group-hover:text-sand">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-xl text-bone">{principle.title}</h3>
                    <p className="mt-1.5 max-w-[42ch] text-sm leading-relaxed text-bone/55">
                      {principle.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

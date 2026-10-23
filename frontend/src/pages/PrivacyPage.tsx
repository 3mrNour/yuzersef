import { Info } from "@phosphor-icons/react";
import { useLanguage } from "../providers/LanguageProvider";
import { PageHeader } from "../components/PageHeader";

export function PrivacyPage() {
  const { t } = useLanguage();
  const content = t.legal.privacy;

  return (
    <>
      <PageHeader
        title={content.title}
        meta={<p className="text-xs text-bone/45">{content.updated}</p>}
      />

      <div className="shell py-12 md:py-16">
        <div className="max-w-[68ch] space-y-5 text-base leading-relaxed text-bone/70">
          {content.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-10 flex max-w-[68ch] items-start gap-3 rounded-[var(--radius-field)] border border-bone/15 bg-forest-900/50 p-5 text-sm leading-relaxed text-bone/60">
          <Info aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-sand" />
          <p>{content.note}</p>
        </div>
      </div>
    </>
  );
}

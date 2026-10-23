import { PageHeader } from "../components/PageHeader";
import { StudioSlot } from "../components/StudioSlot";
import { useLanguage } from "../providers/LanguageProvider";

export function StudioPage() {
  const { t } = useLanguage();

  return (
    <>
      <PageHeader title={t.studioPage.title} intro={t.studioPage.intro} />

      <div className="shell py-8 md:py-12">
        <StudioSlot variant="full" />
      </div>
    </>
  );
}

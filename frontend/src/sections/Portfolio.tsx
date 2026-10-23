import { useLanguage } from "../providers/LanguageProvider";
import { PortfolioGallery } from "../components/PortfolioGallery";

export function Portfolio() {
  const { t } = useLanguage();

  return (
    <section id="work" aria-label={t.portfolio.title} className="relative py-20 md:py-28">
      <div className="shell">
        <PortfolioGallery />
      </div>
    </section>
  );
}

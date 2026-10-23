import { useNavigate } from "react-router-dom";
import { useLanguage } from "../providers/LanguageProvider";
import { Reveal } from "../components/ui/Reveal";
import { SectionHeading } from "../components/ui/SectionHeading";
import CircularGallery, {
  type GalleryItem,
} from "../components/reactbits/CircularGallery";

export function Services() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const items: GalleryItem[] = t.services.items.map((item) => ({
    image: item.image,
    text: item.title,
    description: item.description,
    alt: item.alt,
  }));

  return (
    <section id="services" className="relative py-20 md:py-28">
      <div className="shell">
        <Reveal>
          <SectionHeading title={t.services.title} intro={t.services.intro} />
        </Reveal>

        <Reveal className="mt-10">
          <div className="h-[420px] sm:h-[520px] md:h-[600px]">
            <CircularGallery
              items={items}
              bend={3}
              itemAspect={0.78}
              textColor="#f3eee3"
              scrollSpeed={1.2}
              font="bold 30px 'Thmanyah', ui-sans-serif, sans-serif"
              openOnClick={false}
              onItemClick={(item) => {
                const found = t.services.items.find((s) => s.image === item.image);
                if (found) navigate(`/request?service=${found.slug}`);
              }}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import type { CategorySlug } from "../content";
import { cn } from "../lib/cn";
import { useLanguage } from "../providers/LanguageProvider";
import { DemoTag } from "../components/ui/DemoTag";
import { Reveal } from "../components/ui/Reveal";
import { SectionHeading } from "../components/ui/SectionHeading";
import { fetchPortfolio, type PortfolioItem } from "../lib/api";

const ratios = [
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[5/6]",
  "aspect-[4/5]",
  "aspect-[5/6]",
  "aspect-square",
];

export function PortfolioGallery() {
  const { t, lang } = useLanguage();
  const [filter, setFilter] = useState<CategorySlug | "all">("all");
  const [managedItems, setManagedItems] = useState<PortfolioItem[] | null>(null);

  useEffect(() => {
    let active = true;
    void fetchPortfolio().then((result) => {
      if (active) setManagedItems(result.items);
    }).catch(() => {
      if (active) setManagedItems([]);
    });
    return () => {
      active = false;
    };
  }, []);

  const labels = useMemo(() => {
    return Object.fromEntries(t.portfolio.categories.map((item) => [item.slug, item.label]));
  }, [t.portfolio.categories]);

  const items = useMemo(() => {
    const source = managedItems
      ? managedItems.map((item) => ({
          id: item.id,
          category: item.category,
          image: item.image,
          title: lang === "ar" ? item.titleAr : item.titleEn,
          alt: lang === "ar" ? item.altAr : item.altEn,
        }))
      : t.portfolio.items;
    if (filter === "all") return source;
    return source.filter((item) => item.category === filter);
  }, [filter, lang, managedItems, t]);

  const filters: { slug: CategorySlug | "all"; label: string }[] = [
    { slug: "all", label: t.portfolio.all },
    ...t.portfolio.categories,
  ];

  return (
    <div>
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <Reveal>
          <SectionHeading title={t.portfolio.title} intro={t.portfolio.intro} />
        </Reveal>

        <div
          role="group"
          aria-label={t.portfolio.title}
          className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0"
        >
          {filters.map((item) => {
            const active = filter === item.slug;
            return (
              <button
                key={item.slug}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(item.slug)}
                className={cn(
                  "min-h-[44px] shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
                  active
                    ? "border-sand bg-sand text-forest-950"
                    : "border-bone/20 text-bone/65 hover:border-sand/60 hover:text-bone",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((item, index) => (
          <Link
            key={item.id}
            to={`/request?service=${item.category}`}
            aria-label={`${t.portfolio.requestLikeThis}: ${item.title}`}
            className="group mb-4 block break-inside-avoid overflow-hidden rounded-[22px] border border-bone/10 bg-forest-900 transition-colors hover:border-sand/50"
          >
            <figure>
              <div className="overflow-hidden">
                <img
                  src={item.image}
                  alt={item.alt}
                  width={800}
                  height={1000}
                  loading="lazy"
                  className={cn(
                    "w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]",
                    ratios[index % ratios.length],
                  )}
                />
              </div>
              <figcaption className="flex items-center justify-between gap-3 border-t border-bone/10 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-bone/90">{item.title}</p>
                  <p className="mt-0.5 text-[11px] text-bone/45">{labels[item.category]}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <DemoTag className="text-bone/60" />
                  <ArrowUpRight
                    aria-hidden="true"
                    size={16}
                    className="text-sand transition-transform duration-300 group-hover:-translate-y-0.5 rtl:-scale-x-100"
                  />
                </div>
              </figcaption>
            </figure>
          </Link>
        ))}
      </div>
    </div>
  );
}

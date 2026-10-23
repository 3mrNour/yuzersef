import { Link } from "react-router-dom";
import type { ServiceItem } from "../content";
import { cn } from "../lib/cn";
import { useLanguage } from "../providers/LanguageProvider";
import { SpotlightCard } from "../components/reactbits/SpotlightCard";
import { CtaArrow } from "../components/ui/CtaArrow";
import { DemoTag } from "../components/ui/DemoTag";
import { Reveal } from "../components/ui/Reveal";
import { SectionHeading } from "../components/ui/SectionHeading";

const tones = {
  paper: {
    card: "bg-bone text-forest-950",
    kicker: "text-forest-950/55",
    body: "text-forest-950/70",
    link: "text-forest-950",
    rule: "border-forest-950/15",
    glow: "rgba(4, 89, 79, 0.14)",
    demo: "text-forest-950/60",
  },
  ink: {
    card: "border border-bone/10 bg-forest-900 text-bone",
    kicker: "text-sand/80",
    body: "text-bone/60",
    link: "text-sand",
    rule: "border-bone/10",
    glow: "rgba(234, 192, 140, 0.16)",
    demo: "text-bone/60",
  },
  brand: {
    card: "border border-bone/10 bg-forest-800 text-bone",
    kicker: "text-sand/80",
    body: "text-bone/60",
    link: "text-sand",
    rule: "border-bone/10",
    glow: "rgba(234, 192, 140, 0.16)",
    demo: "text-bone/60",
  },
  sand: {
    card: "bg-sand text-forest-950",
    kicker: "text-forest-950/55",
    body: "text-forest-950/70",
    link: "text-forest-950",
    rule: "border-forest-950/15",
    glow: "rgba(4, 89, 79, 0.12)",
    demo: "text-forest-950/60",
  },
} as const;

interface ServiceCardProps {
  item: ServiceItem;
  large?: boolean;
  className?: string;
}

function ServiceCard({ item, large = false, className }: ServiceCardProps) {
  const { t } = useLanguage();
  const tone = tones[item.tone];

  return (
    <SpotlightCard
      glow={tone.glow}
      className={cn("rounded-[var(--radius-card)]", tone.card, className)}
    >
      <div
        className={cn(
          "flex h-full flex-col",
          large && "sm:grid sm:grid-cols-[1.02fr_0.98fr]",
        )}
      >
        <figure
          className={cn(
            "relative overflow-hidden",
            large
              ? "order-1 min-h-[240px] sm:order-2 sm:min-h-[320px]"
              : "aspect-[16/10]",
          )}
        >
          <img
            src={item.image}
            alt={item.alt}
            width={800}
            height={1000}
            loading="lazy"
            className={cn(
              "h-full w-full object-cover object-center transition-transform duration-700 group-hover/spot:scale-[1.04]",
              large && "absolute inset-0",
            )}
          />
        </figure>

        <div
          className={cn(
            "flex flex-1 flex-col",
            large ? "order-2 p-6 sm:order-1 md:p-8" : "p-5",
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn("text-xs font-medium", tone.kicker)}>{item.kicker}</p>
            <DemoTag className={tone.demo} />
          </div>

          <h3
            className={cn(
              "mt-3 font-display font-semibold leading-tight",
              large ? "text-2xl md:text-[2rem]" : "text-xl",
            )}
          >
            {item.title}
          </h3>

          <p
            className={cn(
              "mt-2 max-w-[38ch] leading-relaxed",
              large ? "text-sm md:text-base" : "text-sm",
              tone.body,
            )}
          >
            {item.description}
          </p>

          <Link
            to={`/request?service=${item.slug}`}
            className={cn(
              "mt-auto inline-flex min-h-[44px] w-fit items-center gap-1.5 pt-5 text-sm font-semibold transition-opacity hover:opacity-75",
              tone.link,
            )}
          >
            {t.common.serviceCta}
            <CtaArrow />
          </Link>
        </div>
      </div>
    </SpotlightCard>
  );
}

export function Services() {
  const { t } = useLanguage();
  const [first, second, third, fourth] = t.services.items;

  return (
    <section id="services" className="relative py-20 md:py-28">
      <div className="shell">
        <Reveal>
          <SectionHeading title={t.services.title} intro={t.services.intro} />
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Reveal className="md:col-span-2">
            <ServiceCard item={first} large className="h-full" />
          </Reveal>
          <Reveal delay={0.05}>
            <ServiceCard item={second} className="h-full" />
          </Reveal>
          <Reveal delay={0.1}>
            <ServiceCard item={third} className="h-full" />
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-2">
            <ServiceCard item={fourth} large className="h-full" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

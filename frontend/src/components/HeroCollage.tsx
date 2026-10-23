import { DemoTag } from "./ui/DemoTag";
import { useLanguage } from "../providers/LanguageProvider";

function CropMarks({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={className}>
      <span className="absolute start-3 top-3 h-3.5 w-3.5 border-s border-t border-current" />
      <span className="absolute end-3 top-3 h-3.5 w-3.5 border-e border-t border-current" />
      <span className="absolute bottom-3 start-3 h-3.5 w-3.5 border-b border-s border-current" />
      <span className="absolute bottom-3 end-3 h-3.5 w-3.5 border-b border-e border-current" />
    </span>
  );
}

export function HeroCollage() {
  const { t } = useLanguage();
  const [tee, mug] = t.hero.slides;

  return (
    <div className="relative mx-auto h-[420px] w-full max-w-[520px] sm:h-[500px] lg:h-[560px] lg:max-w-none">
      <div
        aria-hidden="true"
        className="absolute -top-4 end-2 h-36 w-36 rounded-full border border-sand/20 sm:h-44 sm:w-44"
      >
        <span className="absolute inset-4 rounded-full border border-sand/15" />
        <span className="absolute inset-10 rounded-full border border-sand/10" />
      </div>

      <div className="float-b absolute top-0 end-0 w-[32%] rotate-[6deg] overflow-hidden rounded-[20px] border border-bone/15 bg-forest-900 shadow-[0_28px_60px_-30px_rgba(0,0,0,0.85)]">
        <img
          src={mug.image}
          alt={mug.alt}
          width={800}
          height={1000}
          fetchPriority="high"
          className="aspect-[4/5] w-full object-cover"
        />
        <div className="flex items-center justify-between gap-2 border-t border-bone/10 bg-forest-950/80 px-3 py-2">
          <span className="text-[11px] text-bone/70">{mug.label}</span>
          <DemoTag className="text-bone/70" />
        </div>
      </div>

      <div className="float-a absolute top-[8%] start-[6%] w-[63%] -rotate-[3deg] rounded-[22px] border border-forest-950/15 bg-bone p-5 text-forest-950 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)] sm:p-6">
        <div className="relative flex min-h-[250px] flex-col justify-between sm:min-h-[300px]">
          <div className="flex items-start justify-between gap-4 font-latin text-[9px] font-semibold uppercase tracking-[0.2em] text-forest-950/45">
            <span>{t.hero.proofLabel}</span>
            <span dir="ltr">ASWAN</span>
          </div>

          <div
            aria-hidden="true"
            className="dot-field absolute -top-2 end-0 h-20 w-20 text-forest-950/20"
          />

          <p className="font-display text-[clamp(2.5rem,7vw,4.6rem)] leading-[0.95] tracking-[-0.02em]">
            مختلف
          </p>

          <div className="flex items-end justify-between gap-3 border-t border-forest-950/15 pt-3">
            <span className="font-display text-base leading-none text-forest-950/80 sm:text-lg">
              {t.hero.proofTagline}
            </span>
            <DemoTag className="text-forest-950/60" />
          </div>

          <CropMarks className="pointer-events-none absolute inset-0 text-forest-950/25" />
        </div>
      </div>

      <div className="float-c absolute bottom-0 end-[4%] w-[40%] rotate-[4deg] overflow-hidden rounded-[20px] border border-bone/15 bg-forest-900 shadow-[0_28px_60px_-30px_rgba(0,0,0,0.85)]">
        <img
          src={tee.image}
          alt={tee.alt}
          width={800}
          height={1000}
          fetchPriority="high"
          className="aspect-[4/5] w-full object-cover"
        />
        <div className="flex items-center justify-between gap-2 border-t border-bone/10 bg-forest-950/80 px-3 py-2">
          <span className="text-[11px] text-bone/70">{tee.label}</span>
          <DemoTag className="text-bone/70" />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-[3%] start-[6%] flex items-center gap-1.5 rounded-full border border-bone/15 bg-forest-950/70 px-3 py-2 backdrop-blur-sm"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-forest-600" />
        <span className="h-2.5 w-2.5 rounded-full bg-sand" />
        <span className="h-2.5 w-2.5 rounded-full bg-clay" />
      </div>
    </div>
  );
}


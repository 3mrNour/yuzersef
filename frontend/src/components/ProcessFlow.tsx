import {
  ChatCircleDots,
  Eye,
  MagnifyingGlass,
  Ruler,
  TShirt,
  UploadSimple,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import type { ProcessStep } from "../content";
import { useLanguage } from "../providers/LanguageProvider";

const icons: Record<ProcessStep["icon"], Icon> = {
  tshirt: TShirt,
  ruler: Ruler,
  upload: UploadSimple,
  eye: Eye,
  chat: ChatCircleDots,
  search: MagnifyingGlass,
};

export function ProcessFlow() {
  const { t } = useLanguage();

  return (
    <div>
      <div aria-hidden="true" className="relative mb-10 hidden md:block">
        <div className="absolute inset-x-0 top-[7px] h-px bg-bone/15" />
        <div className="process-sweep absolute inset-x-0 top-[7px] h-px" />
        <div className="relative flex items-start justify-between">
          {t.process.loopLabels.map((label, index) => (
            <div key={label} className="flex flex-col items-center gap-3">
              <span
                className="step-node h-2 w-2 rounded-full bg-sand"
                style={{ animationDelay: `${index * 1.4}s` }}
              />
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-bone/50">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:gap-5">
        {t.process.steps.map((step, index) => {
          const StepIcon = icons[step.icon];
          const number = String(index + 1).padStart(2, "0");

          return (
            <li
              key={step.title}
              className="group relative min-h-[190px] overflow-hidden rounded-[24px] border border-bone/10 bg-forest-900/55 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition-[border-color,background-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-sand/45 hover:bg-forest-900 hover:shadow-[0_18px_45px_rgba(0,0,0,0.2)]"
            >
              <div
                aria-hidden="true"
                className="absolute -end-8 -top-10 h-28 w-28 rounded-full bg-sand/[0.06] blur-2xl transition-colors duration-300 group-hover:bg-sand/[0.14]"
              />
              <div className="relative flex items-center justify-between">
                <span className="font-latin text-3xl font-semibold leading-none text-sand/35 transition-colors duration-300 group-hover:text-sand/75">
                  {number}
                </span>
                <span className="grid h-11 w-11 place-items-center rounded-2xl border border-sand/20 bg-sand/10 text-sand transition-[background-color,transform] duration-300 group-hover:rotate-3 group-hover:bg-sand/20">
                  <StepIcon aria-hidden="true" size={22} weight="duotone" />
                </span>
              </div>
              <div className="relative mt-7">
                <h3 className="text-lg font-semibold leading-snug text-bone">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-bone/55">{step.body}</p>
              </div>
              {index < t.process.steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute -end-3 top-1/2 z-10 hidden h-px w-6 bg-gradient-to-r from-sand/50 to-transparent xl:block rtl:bg-gradient-to-l"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

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

      <ol className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {t.process.steps.map((step, index) => {
          const StepIcon = icons[step.icon];
          const number = String(index + 1).padStart(2, "0");

          return (
            <li
              key={step.title}
              className="group relative border-t border-bone/15 py-5 sm:pe-4 xl:pe-5"
            >
              <div className="flex items-center justify-between">
                <span className="font-latin text-[11px] font-medium tracking-[0.16em] text-sand/70 transition-colors group-hover:text-sand">
                  {number}
                </span>
                <StepIcon
                  aria-hidden="true"
                  size={20}
                  className="text-sand/75 transition-transform duration-300 group-hover:-translate-y-0.5"
                />
              </div>
              <h3 className="mt-4 text-lg leading-snug text-bone">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-bone/55">{step.body}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

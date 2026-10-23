import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { cn } from "../lib/cn";
import { useLanguage } from "../providers/LanguageProvider";

export function FaqAccordion() {
  const { t } = useLanguage();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="border-t border-bone/15">
      {t.faq.items.map((item, index) => {
        const expanded = open === index;
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;

        return (
          <div key={item.question} className="border-b border-bone/15">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : index)}
                className="flex min-h-[64px] w-full items-center justify-between gap-6 py-5 text-start"
              >
                <span className="flex items-baseline gap-3">
                  <span className="font-latin text-[11px] tracking-[0.14em] text-sand/60">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base font-medium text-bone/90">{item.question}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full border border-bone/20 text-sand transition-transform duration-300",
                    expanded && "rotate-45 border-sand/50",
                  )}
                >
                  <Plus size={14} weight="bold" />
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-[62ch] pb-5 ps-[2.15rem] text-sm leading-relaxed text-bone/60">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

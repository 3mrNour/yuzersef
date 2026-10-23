import { Check } from "@phosphor-icons/react";
import type { SiteCopy } from "../content";
import type { RequestStatus } from "../lib/api";
import { cn } from "../lib/cn";

interface TrackStatusProps {
  status: RequestStatus;
  order: RequestStatus[];
  statuses: SiteCopy["track"]["statuses"];
}

export function TrackStatus({ status, order, statuses }: TrackStatusProps) {
  const active = order.indexOf(status);

  return (
    <ol className="mt-8 grid gap-6 sm:grid-cols-4 sm:gap-4">
      {order.map((key, index) => {
        const reached = index <= active;
        const current = index === active;

        return (
          <li
            key={key}
            className={cn(
              "relative border-s-2 ps-4 sm:border-s-0 sm:border-t-2 sm:ps-0 sm:pt-4",
              reached ? "border-sand/70" : "border-bone/15",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute -start-[9px] top-1 grid h-4 w-4 place-items-center rounded-full border-2 sm:start-0 sm:-top-[9px]",
                reached
                  ? "border-sand bg-sand text-forest-950"
                  : "border-bone/25 bg-forest-950",
              )}
            >
              {index < active ? <Check size={8} weight="bold" /> : null}
            </span>
            <p className={cn("text-sm", current ? "font-medium text-bone" : "text-bone/45")}>
              {statuses[key].label}
            </p>
            {current ? (
              <p className="mt-1 max-w-[24ch] text-xs leading-relaxed text-bone/55">
                {statuses[key].body}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

import {
  CircleNotch,
  MagnifyingGlass,
  WarningCircle,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { TrackStatus } from "../components/TrackStatus";
import { contact, serviceLabels } from "../content";
import { ApiError, fetchRequest, type RequestStatus, type TrackedRequest } from "../lib/api";
import { cn } from "../lib/cn";
import { buttonClass } from "../lib/styles";
import { useLanguage } from "../providers/LanguageProvider";

type LookupState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "found"; data: TrackedRequest }
  | { kind: "notfound" }
  | { kind: "error" };

const STATUS_ORDER: RequestStatus[] = ["received", "review", "confirmed", "closed"];
const DEMO_CODE = "YZ-DEMO-0001";

export function TrackPage() {
  const { t, lang } = useLanguage();
  const [params, setParams] = useSearchParams();
  const initialCode = (params.get("code") ?? "").trim().toUpperCase();
  const [code, setCode] = useState(initialCode);
  const [state, setState] = useState<LookupState>(
    initialCode ? { kind: "loading" } : { kind: "idle" },
  );

  const lookup = useCallback(
    async (raw: string) => {
      const next = raw.trim().toUpperCase();
      if (!next) return;
      setCode(next);
      setState({ kind: "loading" });
      setParams({ code: next }, { replace: true });

      try {
        const data = await fetchRequest(next);
        setState({ kind: "found", data });
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setState({ kind: "notfound" });
        } else {
          setState({ kind: "error" });
        }
      }
    },
    [setParams],
  );

  useEffect(() => {
    if (initialCode) void lookup(initialCode);
  }, [initialCode, lookup]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void lookup(code);
  }

  function updateCode(value: string) {
    setCode(value);
    if (state.kind !== "idle" && state.kind !== "loading") setState({ kind: "idle" });
  }

  const formatter = new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <>
      <PageHeader title={t.track.title} intro={t.track.intro} />

      <div className="shell py-12 md:py-16">
        <div className="mx-auto max-w-[760px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[var(--radius-card)] border border-bone/15 bg-forest-900/55 p-6 md:p-8"
          >
            <label htmlFor="track-code" className="mb-2 block text-sm font-medium text-bone/85">
              {t.track.codeLabel}
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="track-code"
                name="code"
                type="text"
                required
                dir="ltr"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                className="field font-latin tracking-[0.08em] sm:flex-1"
                placeholder={t.track.codePlaceholder}
                value={code}
                onChange={(event) => updateCode(event.target.value)}
                disabled={state.kind === "loading"}
              />
              <button
                type="submit"
                disabled={state.kind === "loading"}
                className={cn(buttonClass("primary"), "w-full sm:w-auto")}
              >
                {state.kind === "loading" ? (
                  <CircleNotch aria-hidden="true" size={18} className="animate-spin" />
                ) : (
                  <MagnifyingGlass aria-hidden="true" size={18} weight="bold" />
                )}
                {state.kind === "loading" ? t.track.submitting : t.track.submit}
              </button>
            </div>

            <button
              type="button"
              onClick={() => void lookup(DEMO_CODE)}
              className="mt-3 text-start text-xs text-bone/45 underline decoration-bone/25 underline-offset-4 transition-colors hover:text-sand"
            >
              {t.track.demoHint}
            </button>
          </form>

          <div aria-live="polite" className="mt-6">
            {state.kind === "notfound" ? (
              <div
                role="status"
                className="flex items-start gap-3 rounded-[var(--radius-field)] border border-danger/30 bg-danger/10 p-5 text-sm text-bone"
              >
                <WarningCircle aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-danger" />
                <p>{t.track.notFound}</p>
              </div>
            ) : null}

            {state.kind === "error" ? (
              <div
                role="alert"
                className="rounded-[var(--radius-field)] border border-danger/30 bg-danger/10 p-5 text-sm text-bone"
              >
                <p>{t.track.error}</p>
                <a
                  href={contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 font-medium text-sand underline underline-offset-2"
                >
                  <WhatsappLogo aria-hidden="true" size={16} weight="fill" />
                  {t.common.whatsappCta}
                </a>
              </div>
            ) : null}

            {state.kind === "loading" ? (
              <div className="flex items-center gap-3 p-2 text-sm text-bone/60">
                <CircleNotch aria-hidden="true" size={18} className="animate-spin text-sand" />
                {t.common.loading}
              </div>
            ) : null}
          </div>

          {state.kind === "found" ? (
            <div className="mt-6 rounded-[var(--radius-card)] border border-bone/15 bg-forest-900/60 p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-bone/50">{t.track.codeLabel}</p>
                  <p dir="ltr" className="mt-1 font-latin text-xl tracking-wide text-sand">
                    {state.data.code}
                  </p>
                </div>
                <span className="inline-flex min-h-[32px] items-center rounded-full border border-sand/40 bg-sand/10 px-3 text-xs font-medium text-sand">
                  {t.track.statuses[state.data.status].label}
                </span>
              </div>

              <dl className="mt-6 grid gap-4 border-y border-bone/10 py-5 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-bone/45">{t.track.created}</dt>
                  <dd className="mt-1 text-sm text-bone/85">
                    {formatter.format(new Date(state.data.createdAt))}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-bone/45">{t.track.service}</dt>
                  <dd className="mt-1 text-sm text-bone/85">
                    {serviceLabels[state.data.service][lang]}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-bone/45">{t.track.quantity}</dt>
                  <dd className="mt-1 font-latin text-sm text-bone/85">
                    {new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-GB").format(
                      state.data.quantity,
                    )}
                  </dd>
                </div>
              </dl>

              <TrackStatus
                status={state.data.status}
                order={STATUS_ORDER}
                statuses={t.track.statuses}
              />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}


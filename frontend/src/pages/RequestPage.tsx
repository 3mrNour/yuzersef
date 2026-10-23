import {
  CaretDown,
  CheckCircle,
  CircleNotch,
  Info,
  PaperPlaneTilt,
  PencilSimple,
  Trash,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { ButtonLink } from "../components/ui/ButtonLink";
import { CtaArrow } from "../components/ui/CtaArrow";
import { DemoTag } from "../components/ui/DemoTag";
import { contact, serviceLabels, type ServiceSlug } from "../content";
import { useDesignDraft } from "../features/studio/DesignDraft";
import { mockProducts } from "../features/studio/mockProducts";
import { createRequest } from "../lib/api";
import { cn } from "../lib/cn";
import { buttonClass } from "../lib/styles";
import { isValidHttpUrl, isValidPhone, normalizePhone } from "../lib/validation";
import { useLanguage } from "../providers/LanguageProvider";

const SERVICE_ORDER: ServiceSlug[] = ["clothing", "mugs", "caps", "stickers", "cases"];

type Field = "name" | "phone" | "service" | "quantity" | "details" | "artwork";
type Errors = Partial<Record<Field, string>>;
type Status = "idle" | "submitting" | "success" | "error";

function readServiceParam(value: string | null): ServiceSlug | "" {
  if (!value) return "";
  return SERVICE_ORDER.includes(value as ServiceSlug) ? (value as ServiceSlug) : "";
}

export function RequestPage() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { draft, clearDraft } = useDesignDraft();
  const initialService = readServiceParam(params.get("service"));
  const draftProduct = draft
    ? mockProducts.find((product) => product._id === draft.state.productId) ?? null
    : null;
  const draftColor = draftProduct?.colors.find((color) => color.id === draft?.state.colorId);
  const draftView = draftProduct?.views.find((view) => view.id === draft?.state.viewId);

  const [values, setValues] = useState({
    name: "",
    phone: "",
    service: initialService as ServiceSlug | "",
    quantity: "1",
    details: "",
    artwork: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [code, setCode] = useState("");
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  function update(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (status === "error") setStatus("idle");
  }

  function validate(): Errors {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = t.request.validation.name;
    if (!isValidPhone(values.phone)) next.phone = t.request.validation.phone;
    if (!values.service) next.service = t.request.validation.service;
    const quantity = Number(values.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 500) {
      next.quantity = t.request.validation.quantity;
    }
    if (values.details.trim().length < 3) next.details = t.request.validation.details;
    if (!isValidHttpUrl(values.artwork)) next.artwork = t.request.validation.artwork;
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const first = Object.keys(nextErrors)[0] as Field;
      document.getElementById(`request-${first}`)?.focus();
      return;
    }

    setStatus("submitting");
    try {
      const created = await createRequest({
        name: values.name.trim(),
        phone: normalizePhone(values.phone),
        service: values.service as ServiceSlug,
        quantity: Number(values.quantity),
        details: values.details.trim(),
        artworkUrl: values.artwork.trim() || undefined,
      });
      setCode(created.code);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function reset() {
    setValues({
      name: "",
      phone: "",
      service: initialService as ServiceSlug | "",
      quantity: "1",
      details: "",
      artwork: "",
    });
    setErrors({});
    setCode("");
    setStatus("idle");
    clearDraft();
  }

  const busy = status === "submitting";

  return (
    <>
      <PageHeader title={t.request.title} intro={t.request.intro} />

      <div className="shell py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div>
            {draft ? (
              <section
                aria-labelledby="attached-design-title"
                className="mb-6 rounded-[var(--radius-card)] border border-sand/25 bg-forest-900/55 p-4 sm:p-5"
              >
                <div className="grid gap-4 sm:grid-cols-[152px_minmax(0,1fr)] sm:items-start">
                  <img
                    src={draft.state.previewUrl}
                    alt={t.studioUi.previewAlt}
                    width={1200}
                    height={1466}
                    className="max-h-[240px] w-full rounded-[var(--radius-field)] border border-bone/10 bg-forest-950 object-contain"
                  />

                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2
                          id="attached-design-title"
                          className="text-sm font-semibold tracking-[0.04em] text-sand"
                        >
                          {t.studioUi.attachedDesign}
                        </h2>
                        <p className="mt-1 truncate text-base text-bone">
                          {draftProduct?.name ?? draft.state.productId}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-bone/50">
                          {[draftColor?.name, draftView?.label].filter(Boolean).join(" / ") ||
                            `${draft.state.colorId} / ${draft.state.viewId}`}
                        </p>
                        {draft.state.logoFileName ? (
                          <p
                            dir="auto"
                            className="mt-1 truncate font-latin text-[11px] text-bone/35"
                          >
                            {draft.state.logoFileName}
                          </p>
                        ) : null}
                      </div>
                      <DemoTag className="shrink-0 text-bone/45" />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => navigate("/studio")}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-bone/20 px-3 text-xs text-bone/65 transition-colors hover:border-bone/40 hover:text-bone"
                      >
                        <PencilSimple aria-hidden="true" size={14} />
                        {t.studioUi.changeDesign}
                      </button>
                      <button
                        type="button"
                        onClick={clearDraft}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3 text-xs text-bone/50 transition-colors hover:text-danger"
                      >
                        <Trash aria-hidden="true" size={14} />
                        {t.studioUi.removeDesign}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {status === "success" ? (
              <div
                ref={successRef}
                tabIndex={-1}
                className="rounded-[var(--radius-card)] border border-sand/30 bg-forest-900/70 p-6 md:p-8"
              >
                <CheckCircle aria-hidden="true" size={32} className="text-sand" />
                <h2 className="mt-4 text-2xl text-bone md:text-3xl">{t.request.successTitle}</h2>
                <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-bone/60">
                  {t.request.successBody}
                </p>

                <div className="mt-6 rounded-[var(--radius-field)] border border-bone/15 bg-forest-950/60 p-4">
                  <p className="text-xs text-bone/50">{t.request.codeLabel}</p>
                  <p dir="ltr" className="mt-1 font-latin text-xl tracking-wide text-sand">
                    {code}
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink to={`/track?code=${encodeURIComponent(code)}`}>
                    {t.request.trackCta}
                    <CtaArrow />
                  </ButtonLink>
                  <button
                    type="button"
                    onClick={reset}
                    className={buttonClass("secondary")}
                  >
                    {t.request.anotherCta}
                  </button>
                </div>

                <p className="mt-6 border-t border-bone/10 pt-4 text-xs leading-relaxed text-bone/50">
                  {t.request.note}
                </p>
              </div>
            ) : (
              <form
                noValidate
                onSubmit={handleSubmit}
                className="rounded-[var(--radius-card)] border border-bone/15 bg-forest-900/55 p-6 md:p-8"
              >
                <h2 className="text-2xl text-bone">{t.request.formTitle}</h2>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="request-name" className="mb-2 block text-sm font-medium text-bone/85">
                      {t.request.fields.name}
                    </label>
                    <input
                      id="request-name"
                      name="name"
                      type="text"
                      maxLength={80}
                      autoComplete="name"
                      className="field"
                      placeholder={t.request.fields.namePlaceholder}
                      value={values.name}
                      onChange={(event) => update("name", event.target.value)}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "request-name-error" : undefined}
                      disabled={busy}
                    />
                    {errors.name ? (
                      <p id="request-name-error" className="mt-1.5 text-xs text-danger">
                        {errors.name}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="request-phone" className="mb-2 block text-sm font-medium text-bone/85">
                      {t.request.fields.phone}
                    </label>
                    <input
                      id="request-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      dir="ltr"
                      autoComplete="tel"
                      className="field text-start"
                      placeholder={t.request.fields.phonePlaceholder}
                      value={values.phone}
                      onChange={(event) => update("phone", event.target.value)}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? "request-phone-error" : undefined}
                      disabled={busy}
                    />
                    {errors.phone ? (
                      <p id="request-phone-error" className="mt-1.5 text-xs text-danger">
                        {errors.phone}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="request-service" className="mb-2 block text-sm font-medium text-bone/85">
                      {t.request.fields.service}
                    </label>
                    <div className="relative">
                      <select
                        id="request-service"
                        name="service"
                        className="field appearance-none pe-10"
                        value={values.service}
                        onChange={(event) => update("service", event.target.value)}
                        aria-invalid={Boolean(errors.service)}
                        aria-describedby={errors.service ? "request-service-error" : undefined}
                        disabled={busy}
                      >
                        <option value="" disabled className="text-forest-950">
                          {t.request.fields.servicePlaceholder}
                        </option>
                        {SERVICE_ORDER.map((slug) => (
                          <option key={slug} value={slug} className="text-forest-950">
                            {serviceLabels[slug][lang]}
                          </option>
                        ))}
                      </select>
                      <CaretDown
                        aria-hidden="true"
                        size={16}
                        className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-bone/60"
                      />
                    </div>
                    {errors.service ? (
                      <p id="request-service-error" className="mt-1.5 text-xs text-danger">
                        {errors.service}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="request-quantity" className="mb-2 block text-sm font-medium text-bone/85">
                      {t.request.fields.quantity}
                    </label>
                    <input
                      id="request-quantity"
                      name="quantity"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={500}
                      step={1}
                      dir="ltr"
                      className="field text-start"
                      value={values.quantity}
                      onChange={(event) => update("quantity", event.target.value)}
                      aria-invalid={Boolean(errors.quantity)}
                      aria-describedby={
                        errors.quantity
                          ? "request-quantity-error"
                          : "request-quantity-hint"
                      }
                      disabled={busy}
                    />
                    {errors.quantity ? (
                      <p id="request-quantity-error" className="mt-1.5 text-xs text-danger">
                        {errors.quantity}
                      </p>
                    ) : (
                      <p id="request-quantity-hint" className="mt-1.5 text-xs text-bone/45">
                        {t.request.fields.quantityHint}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="request-details" className="mb-2 block text-sm font-medium text-bone/85">
                      {t.request.fields.details}
                    </label>
                    <textarea
                      id="request-details"
                      name="details"
                      rows={5}
                      maxLength={1200}
                      className="field resize-y"
                      placeholder={t.request.fields.detailsPlaceholder}
                      value={values.details}
                      onChange={(event) => update("details", event.target.value)}
                      aria-invalid={Boolean(errors.details)}
                      aria-describedby={errors.details ? "request-details-error" : undefined}
                      disabled={busy}
                    />
                    {errors.details ? (
                      <p id="request-details-error" className="mt-1.5 text-xs text-danger">
                        {errors.details}
                      </p>
                    ) : null}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="request-artwork" className="mb-2 block text-sm font-medium text-bone/85">
                      {t.request.fields.artwork}
                    </label>
                    <input
                      id="request-artwork"
                      name="artwork"
                      type="url"
                      maxLength={500}
                      inputMode="url"
                      dir="ltr"
                      className="field text-start"
                      placeholder={t.request.fields.artworkPlaceholder}
                      value={values.artwork}
                      onChange={(event) => update("artwork", event.target.value)}
                      aria-invalid={Boolean(errors.artwork)}
                      aria-describedby={
                        errors.artwork ? "request-artwork-error" : "request-artwork-hint"
                      }
                      disabled={busy}
                    />
                    {errors.artwork ? (
                      <p id="request-artwork-error" className="mt-1.5 text-xs text-danger">
                        {errors.artwork}
                      </p>
                    ) : (
                      <p id="request-artwork-hint" className="mt-1.5 text-xs text-bone/45">
                        {t.request.fields.artworkHint}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={busy}
                    className={cn(buttonClass("primary"), "w-full sm:w-auto")}
                  >
                    {busy ? (
                      <CircleNotch aria-hidden="true" size={18} className="animate-spin" />
                    ) : (
                      <PaperPlaneTilt aria-hidden="true" size={18} />
                    )}
                    {busy ? t.request.submitting : t.request.submit}
                  </button>

                  {status === "error" ? (
                    <div
                      role="alert"
                      className="rounded-[var(--radius-field)] border border-danger/40 bg-danger/10 p-4 text-sm text-bone"
                    >
                      <p>{t.request.error}</p>
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
                </div>
              </form>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[var(--radius-card)] border border-bone/15 bg-forest-900/45 p-6">
              <h2 className="text-sm font-semibold tracking-[0.04em] text-bone/60">
                {t.process.title}
              </h2>
              <ol className="mt-4 space-y-4">
                {[0, 2, 4].map((index, position) => {
                  const step = t.process.steps[index];
                  return (
                    <li key={step.title} className="flex items-start gap-3">
                      <span className="mt-0.5 font-latin text-[11px] tracking-[0.14em] text-sand/60">
                        {String(position + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-sm text-bone/90">{step.title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-bone/50">{step.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="rounded-[var(--radius-card)] border border-bone/15 bg-forest-900/45 p-6">
              <p className="flex items-start gap-2 text-xs leading-relaxed text-bone/55">
                <Info aria-hidden="true" size={15} className="mt-0.5 shrink-0" />
                <span>{t.request.note}</span>
              </p>
              <a
                href={contact.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonClass("secondary"), "mt-4 w-full")}
              >
                <WhatsappLogo aria-hidden="true" size={18} weight="fill" />
                {t.common.whatsappCta}
              </a>
            </div>

            <p className="text-center text-xs text-bone/40 lg:text-start">
              <Link to="/privacy" className="underline underline-offset-2 hover:text-sand">
                {t.footer.privacy}
              </Link>
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}

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
import { createRequest, fetchPrintPlacementSettings } from "../lib/api";
import type { PrintPlacement, PrintPlacementProfile, RequestItem } from "../lib/api";
import { cn } from "../lib/cn";
import { buttonClass } from "../lib/styles";
import { isValidHttpUrl, isValidPhone, normalizePhone } from "../lib/validation";
import { useLanguage } from "../providers/LanguageProvider";
import { useAuth } from "../providers/useAuth";

const SERVICE_ORDER: ServiceSlug[] = ["clothing", "mugs", "caps", "stickers", "cases"];
const DEFAULT_PLACEMENTS: PrintPlacement[] = ["front", "back", "left-sleeve", "right-sleeve", "custom"];

function placementLabel(value: PrintPlacement, lang: "ar" | "en"): string {
  const labels: Record<PrintPlacement, { ar: string; en: string }> = {
    front: { ar: "الأمام", en: "Front" },
    back: { ar: "الخلف", en: "Back" },
    "left-sleeve": { ar: "الكم الأيسر", en: "Left sleeve" },
    "right-sleeve": { ar: "الكم الأيمن", en: "Right sleeve" },
    custom: { ar: "موضع مخصص", en: "Custom placement" },
  };
  return labels[value][lang];
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Could not read the exported design"));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the exported design"));
    reader.readAsDataURL(blob);
  });
}

type Field = "name" | "phone" | "service" | "pieces" | "artwork";
type Errors = Partial<Record<Field, string>>;
type Status = "idle" | "submitting" | "success" | "error";

function readServiceParam(value: string | null): ServiceSlug | "" {
  if (!value) return "";
  return SERVICE_ORDER.includes(value as ServiceSlug) ? (value as ServiceSlug) : "";
}

function getDefaultPiece(
  product: (typeof mockProducts)[number] | null,
  service: ServiceSlug | "",
  lang: "ar" | "en",
  selectedStyle?: string,
  selectedPlacement?: PrintPlacement,
): RequestItem {
  const productName = product?.name ?? (service ? serviceLabels[service][lang] : "");
  const color = product?.colors[0]?.name ?? "";
  const size = product?.options?.sizes?.[0] ?? (product ? "One size" : "");
  const style = selectedStyle ?? product?.options?.styles?.[0] ?? product?.views[0]?.label ?? "";
  return {
    productId: product?._id ?? service,
    productName,
    size,
    color,
    style,
    specialRequest: "",
    printPlacement: selectedPlacement ?? "front",
  };
}

export function RequestPage() {
  const { t, lang } = useLanguage();
  const { user, loading } = useAuth();
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
    artwork: "",
  });
  const [pieces, setPieces] = useState<RequestItem[]>([
    getDefaultPiece(draftProduct, initialService, lang, draft?.state.styleId, draft?.state.printPlacement),
  ]);
  const [availablePlacements, setAvailablePlacements] = useState<PrintPlacement[]>(DEFAULT_PLACEMENTS);
  const [placementProfiles, setPlacementProfiles] = useState<Record<string, PrintPlacementProfile>>({});
  const [placementSettingsReady, setPlacementSettingsReady] = useState(!initialService);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [code, setCode] = useState("");
  const successRef = useRef<HTMLDivElement>(null);

  if (loading) return null;
  if (!user) {
    return (
      <>
        <PageHeader title={t.request.title} intro={t.request.intro} />
        <div className="shell py-16 text-bone">
          <p className="text-lg">Please sign in or create an account before submitting a print request.</p>
          <Link to="/auth" className={`${buttonClass("primary")} mt-6 inline-flex`}>Sign in or sign up</Link>
        </div>
      </>
    );
  }

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  useEffect(() => {
    let active = true;
    if (!values.service) {
      setAvailablePlacements(DEFAULT_PLACEMENTS);
      setPlacementSettingsReady(true);
      return () => {
        active = false;
      };
    }
    const service = values.service as ServiceSlug;
    setPlacementSettingsReady(false);
    void fetchPrintPlacementSettings()
      .then((result) => {
        if (active) {
          setPlacementProfiles(result.profiles);
          const profile = draftProduct ? result.profiles[draftProduct._id] : undefined;
          const nextPlacements = profile?.placements ?? result.placements[service] ?? DEFAULT_PLACEMENTS;
          setAvailablePlacements(nextPlacements);
          setPieces((current) =>
            current.map((piece) =>
              nextPlacements.includes(piece.printPlacement ?? "front")
                ? piece
                : { ...piece, printPlacement: nextPlacements[0] },
            ),
          );
          setPlacementSettingsReady(true);
        }
      })
      .catch(() => {
        if (active) {
          setAvailablePlacements([]);
          setPlacementSettingsReady(false);
        }
      });
    return () => {
      active = false;
    };
  }, [draftProduct, values.service]);

  function update(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (status === "error") setStatus("idle");
  }

  function updatePiece(index: number, field: keyof RequestItem, value: string) {
    setPieces((current) =>
      current.map((piece, pieceIndex) =>
        pieceIndex === index ? { ...piece, [field]: value } : piece,
      ),
    );
    setErrors((current) => ({ ...current, pieces: undefined }));
    if (status === "error") setStatus("idle");
  }

  function addPiece() {
    if (pieces.length >= 500) return;
    setPieces((current) => [
      ...current,
      getDefaultPiece(draftProduct, values.service, lang, undefined, draft?.state.printPlacement),
    ]);
  }

  function removePiece(index: number) {
    if (pieces.length === 1) return;
    setPieces((current) => current.filter((_, pieceIndex) => pieceIndex !== index));
  }

  function validate(): Errors {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = t.request.validation.name;
    if (!isValidPhone(values.phone)) next.phone = t.request.validation.phone;
    if (!values.service) next.service = t.request.validation.service;
    if (pieces.length < 1 || pieces.length > 500) next.pieces = t.request.validation.pieces;
    if (pieces.some((piece) => !piece.size.trim())) next.pieces = t.request.validation.size;
    if (pieces.some((piece) => piece.specialRequest.trim().length > 500)) {
      next.pieces = t.request.validation.specialRequest;
    }
    if (pieces.some((piece) => !availablePlacements.includes(piece.printPlacement ?? "front"))) {
      next.pieces = lang === "ar" ? "يوجد موضع طباعة غير متاح لهذا المنتج." : "A print position is not available for this product.";
    }
    if (values.service && (!placementSettingsReady || availablePlacements.length === 0)) {
      next.pieces = lang === "ar"
        ? "لا يمكن إرسال الطلب قبل تحميل مواضع الطباعة المتاحة."
        : "The available print positions must load before submitting.";
    }
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
        quantity: pieces.length,
        items: pieces.map((piece) => ({
          ...piece,
          specialRequest: piece.specialRequest.trim(),
        })),
        details: pieces
          .map((piece, index) => `${index + 1}. ${piece.productName}, ${piece.size}, ${piece.color}, ${piece.style}`)
          .join(" | "),
        artworkUrl: values.artwork.trim() || undefined,
        designPreviewUrl: draft ? await blobToDataUrl(draft.blob) : undefined,
        designFileName: draft?.state.logoFileName,
        logoDataUrl: draft?.state.logoDataUrl,
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
      artwork: "",
    });
    setPieces([getDefaultPiece(draftProduct, initialService, lang, draft?.state.styleId, draft?.state.printPlacement)]);
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

                  {!draft ? (
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
                        onChange={(event) => {
                          const service = event.target.value as ServiceSlug;
                          update("service", service);
                          setPieces([getDefaultPiece(null, service, lang)]);
                        }}
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
                  ) : (
                    <div className="rounded-[var(--radius-field)] border border-sand/20 bg-sand/5 p-4 text-sm text-sand">
                      {t.request.fields.studioProductNote}
                    </div>
                  )}

                  <section className="sm:col-span-2" aria-labelledby="request-pieces-title">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <h3 id="request-pieces-title" className="text-sm font-semibold text-bone">
                          {t.request.fields.piecesTitle}
                        </h3>
                        <p className="mt-1 text-xs text-bone/50">
                          {pieces.length} / 500 {t.request.fields.pieceLabel}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addPiece}
                        disabled={busy || pieces.length >= 500}
                        className={cn(buttonClass("secondary"), "min-h-[40px] px-4 py-2 text-xs")}
                      >
                        {t.request.fields.addPiece}
                      </button>
                    </div>
                    {errors.pieces ? (
                      <p className="mt-2 text-xs text-danger">{errors.pieces}</p>
                    ) : null}
                    <div className="mt-4 space-y-4">
                      {pieces.map((piece, index) => {
                        const product = draftProduct;
                        const sizes = product?.options?.sizes ?? ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
                        const colors = product?.colors ?? [];
                        return (
                          <article
                            key={`${index}-${piece.productId}`}
                            className="rounded-[var(--radius-field)] border border-bone/15 bg-forest-950/45 p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <h4 className="text-sm font-semibold text-sand">
                                {t.request.fields.pieceLabel} {index + 1}
                              </h4>
                              {pieces.length > 1 ? (
                                <button
                                  type="button"
                                  onClick={() => removePiece(index)}
                                  disabled={busy}
                                  className="min-h-[40px] px-3 text-xs font-medium text-bone/60 transition-colors hover:text-danger"
                                >
                                  {t.request.fields.removePiece}
                                </button>
                              ) : null}
                            </div>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                              <div>
                                <label className="mb-2 block text-xs font-medium text-bone/75">
                                  {t.request.fields.product}
                                </label>
                                <input className="field" value={piece.productName} readOnly disabled={busy} />
                              </div>
                              <div>
                                <label htmlFor={`request-piece-${index}-size`} className="mb-2 block text-xs font-medium text-bone/75">
                                  {t.request.fields.size}
                                </label>
                                <select
                                  id={`request-piece-${index}-size`}
                                  className="field"
                                  value={piece.size}
                                  onChange={(event) => updatePiece(index, "size", event.target.value)}
                                  disabled={busy}
                                >
                                  <option value="" disabled>{t.request.fields.sizePlaceholder}</option>
                                  {sizes.map((size) => <option key={size} value={size} className="text-forest-950">{size}</option>)}
                                </select>
                              </div>
                              <div>
                                <label htmlFor={`request-piece-${index}-color`} className="mb-2 block text-xs font-medium text-bone/75">
                                  {t.request.fields.color}
                                </label>
                                {colors.length ? (
                                  <select
                                    id={`request-piece-${index}-color`}
                                    className="field"
                                    value={piece.color}
                                    onChange={(event) => updatePiece(index, "color", event.target.value)}
                                    disabled={busy}
                                  >
                                    {colors.map((color) => <option key={color.id} value={color.name} className="text-forest-950">{color.name}</option>)}
                                  </select>
                                ) : (
                                  <input className="field" value={piece.color} onChange={(event) => updatePiece(index, "color", event.target.value)} disabled={busy} />
                                )}
                              </div>
                              <div>
                                <label htmlFor={`request-piece-${index}-style`} className="mb-2 block text-xs font-medium text-bone/75">
                                  {t.request.fields.style}
                                </label>
                                <input
                                  id={`request-piece-${index}-style`}
                                  className="field"
                                  maxLength={120}
                                  placeholder={t.request.fields.stylePlaceholder}
                                  value={piece.style}
                                  onChange={(event) => updatePiece(index, "style", event.target.value)}
                                  disabled={busy}
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label htmlFor={`request-piece-${index}-placement`} className="mb-2 block text-xs font-medium text-bone/75">
                                  {lang === "ar" ? "موضع الطباعة" : "Print placement"}
                                </label>
                                <select
                                  id={`request-piece-${index}-placement`}
                                  className="field"
                                  value={availablePlacements.includes(piece.printPlacement ?? "front") ? piece.printPlacement : availablePlacements[0]}
                                  onChange={(event) => updatePiece(index, "printPlacement", event.target.value)}
                                  disabled={busy}
                                >
                                  {(placementProfiles[piece.productId]?.placements ?? availablePlacements).map((placement) => (
                                    <option key={placement} value={placement} className="text-forest-950">
                                      {placementLabel(placement, lang)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="sm:col-span-2">
                                <label htmlFor={`request-piece-${index}-special`} className="mb-2 block text-xs font-medium text-bone/75">
                                  {t.request.fields.specialRequest}
                                </label>
                                <textarea
                                  id={`request-piece-${index}-special`}
                                  rows={3}
                                  maxLength={500}
                                  className="field resize-y"
                                  placeholder={t.request.fields.specialRequestPlaceholder}
                                  value={piece.specialRequest}
                                  onChange={(event) => updatePiece(index, "specialRequest", event.target.value)}
                                  disabled={busy}
                                />
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>

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

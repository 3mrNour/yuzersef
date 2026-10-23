import { CircleNotch, WarningCircle } from "@phosphor-icons/react";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listProducts } from "../features/studio/studioApi";
import { useDesignDraft } from "../features/studio/DesignDraft";
import type { DesignState, Product } from "../features/studio/types";
import type { MockupStudioHandle } from "../features/studio/MockupStudio";
import { serviceLabels, type ServiceSlug } from "../content";
import { cn } from "../lib/cn";
import { buttonClass } from "../lib/styles";
import { useLanguage } from "../providers/LanguageProvider";
import { CtaArrow } from "./ui/CtaArrow";
import { DemoTag } from "./ui/DemoTag";

const MockupStudio = lazy(async () => {
  const module = await import("../features/studio/MockupStudio");
  return { default: module.MockupStudio };
});

interface StudioSlotProps {
  className?: string;
  note?: string;
  variant?: "preview" | "full";
}

export function StudioSlot({ className, note, variant = "preview" }: StudioSlotProps) {
  if (variant === "full") return <StudioWorkspace className={className} />;
  return <StudioPreview className={className} note={note} />;
}

function StudioPreview({ className, note }: { className?: string; note?: string }) {
  const { t } = useLanguage();

  return (
    <figure
      data-studio-slot
      data-variant="preview"
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-card)] border border-bone/15 bg-forest-900",
        className,
      )}
    >
      <div className="relative">
        <img
          src="/mock/studio-preview.svg"
          alt={t.studioUi.previewAlt}
          width={900}
          height={1100}
          loading="lazy"
          className="aspect-[4/5] w-full object-cover"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/85 via-forest-950/35 to-transparent px-5 pb-5 pt-16">
          <span className="block max-w-[30ch] text-xs leading-relaxed text-bone/85">
            {note ?? t.studioPage.note}
          </span>
        </div>
      </div>

      <figcaption className="flex min-h-[52px] items-center justify-between gap-3 border-t border-bone/10 px-4 py-3">
        <span className="text-sm text-bone/75">{t.studio.frameLabel}</span>
        <DemoTag className="text-bone/70" />
      </figcaption>
    </figure>
  );
}

function StudioWorkspace({ className }: { className?: string }) {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const { setDraft } = useDesignDraft();
  const editorRef = useRef<MockupStudioHandle>(null);

  const [products, setProducts] = useState<Product[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [hasLogo, setHasLogo] = useState(false);
  const [usingDesign, setUsingDesign] = useState(false);
  const [useError, setUseError] = useState(false);

  useEffect(() => {
    let active = true;
    setProducts(null);
    setLoadError(false);
    listProducts()
      .then((items) => {
        if (!active) return;
        if (items.length === 0) {
          setLoadError(true);
          return;
        }
        setProducts(items);
        setSelectedId((current) =>
          current && items.some((item) => item._id === current) ? current : items[0]._id,
        );
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const selected = products?.find((product) => product._id === selectedId) ?? null;

  useEffect(() => {
    setUseError(false);
  }, [selectedId]);

  const handleDesignChange = useCallback((state: DesignState) => {
    setHasLogo(Boolean(state.logoFileName));
  }, []);

  async function handleUseDesign() {
    if (!editorRef.current || !hasLogo || usingDesign) return;
    setUsingDesign(true);
    setUseError(false);
    try {
      const result = await editorRef.current.exportPng();
      setDraft(result);
      const category = selected?.category;
      const service =
        category && serviceLabels[category as ServiceSlug] ? encodeURIComponent(category) : null;
      navigate(service ? `/request?service=${service}` : "/request");
    } catch {
      setUseError(true);
    } finally {
      setUsingDesign(false);
    }
  }

  if (loadError) {
    return (
      <div
        role="alert"
        className={cn(
          "rounded-[var(--radius-card)] border border-bone/15 bg-forest-900/45 p-8 text-center",
          className,
        )}
      >
        <WarningCircle aria-hidden="true" size={28} className="mx-auto text-danger" />
        <p className="mx-auto mt-3 max-w-[38ch] text-sm leading-relaxed text-bone/70">
          {t.studioUi.loadError}
        </p>
        <button
          type="button"
          onClick={() => setReloadKey((value) => value + 1)}
          className={cn(buttonClass("secondary"), "mt-5")}
        >
          {t.studioUi.retry}
        </button>
      </div>
    );
  }

  if (!products) {
    return (
      <div
        role="status"
        className={cn(
          "grid min-h-[320px] place-items-center rounded-[var(--radius-card)] border border-bone/15 bg-forest-900/45 p-8",
          className,
        )}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-bone/15 bg-forest-950/70 px-4 py-2 text-sm text-bone/70">
          <CircleNotch aria-hidden="true" size={17} className="animate-spin" />
          {t.studioUi.loading}
        </span>
      </div>
    );
  }

  return (
    <div data-studio-slot data-variant="full" className={cn("space-y-6", className)}>
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-3 flex w-full items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-bone/45">
            {t.studioUi.productLabel}
          </span>
          <DemoTag className="text-bone/45" />
        </legend>

        <div className="grid gap-3 sm:grid-cols-3">
          {products.map((product) => {
            const active = product._id === selectedId;
            const category = serviceLabels[product.category as ServiceSlug]?.[lang];
            return (
              <button
                key={product._id}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedId(product._id)}
                className={cn(
                  "group flex min-h-[92px] flex-col justify-between gap-4 rounded-[var(--radius-field)] border p-4 text-start transition-[border-color,background-color,transform] duration-200",
                  active
                    ? "border-sand bg-sand/[0.08]"
                    : "border-bone/15 bg-forest-900/35 hover:-translate-y-0.5 hover:border-bone/35 hover:bg-forest-900/60",
                )}
              >
                <span className="flex w-full items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-bone">
                      {product.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-bone/45">
                      {category ?? product.category}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1 h-2 w-2 shrink-0 rounded-full transition-colors",
                      active ? "bg-sand" : "bg-bone/20 group-hover:bg-bone/35",
                    )}
                  />
                </span>

                <span className="flex items-center gap-1.5" aria-hidden="true">
                  {product.colors.slice(0, 5).map((color) => (
                    <span
                      key={color.id}
                      className="h-4 w-4 rounded-full border border-black/20"
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                  {product.colors.length > 5 ? (
                    <span className="font-latin text-[10px] text-bone/40">
                      +{product.colors.length - 5}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {selected ? (
        <Suspense
          fallback={
            <div
              role="status"
              className="grid min-h-[420px] place-items-center rounded-[var(--radius-card)] border border-bone/15 bg-forest-900/35 p-8"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-bone/15 bg-forest-950/70 px-4 py-2 text-sm text-bone/70">
                <CircleNotch aria-hidden="true" size={17} className="animate-spin" />
                {t.studioUi.loading}
              </span>
            </div>
          }
        >
          <MockupStudio
            ref={editorRef}
            product={selected}
            onChange={handleDesignChange}
          />
        </Suspense>
      ) : null}

      <div className="grid gap-5 rounded-[var(--radius-card)] border border-bone/15 bg-forest-900/55 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <p className="text-sm leading-relaxed text-bone/70">{t.studioUi.designNote}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-bone/40">{t.studioPage.note}</p>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleUseDesign}
            disabled={!hasLogo || usingDesign}
            className={cn(buttonClass("primary"), "w-full whitespace-nowrap sm:w-auto")}
          >
            {usingDesign ? (
              <CircleNotch aria-hidden="true" size={18} className="animate-spin" />
            ) : null}
            {t.studioUi.useDesign}
            {usingDesign ? null : <CtaArrow />}
          </button>
        </div>
      </div>

      {useError ? (
        <p role="alert" className="text-xs leading-relaxed text-danger">
          {t.studioUi.exportError}
        </p>
      ) : null}
    </div>
  );
}

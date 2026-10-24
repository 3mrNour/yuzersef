import {
  ArrowCounterClockwise,
  CircleNotch,
  DownloadSimple,
  ImageSquare,
  Trash,
  UploadSimple,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { DemoTag } from "../../components/ui/DemoTag";
import { cn } from "../../lib/cn";
import { buttonClass } from "../../lib/styles";
import { useLanguage } from "../../providers/LanguageProvider";
import {
  clampTransform,
  getDefaultTransform,
  getPrintAreaPixels,
  maxScaleFor,
  MIN_LOGO_SCALE,
} from "./geometry";
import {
  getCachedImage,
  getImageSize,
  isAbortError,
  loadImage,
  type InkMode,
} from "./imageCache";
import { renderMockup, renderMockupToBlob } from "./renderMockup";
import type { DesignState, DesignTransform, Product } from "./types";
import { fetchPrintPlacementSettings, type PrintPlacement } from "../../lib/api";

export interface MockupExport {
  blob: Blob;
  state: DesignState;
}

export interface MockupStudioHandle {
  exportPng: () => Promise<MockupExport>;
  getState: () => DesignState;
}

interface MockupStudioProps {
  product: Product;
  initialColorId?: string;
  initialViewId?: string;
  onChange?: (state: DesignState) => void;
  onExport?: (result: MockupExport) => void;
  renderer?: "canvas";
  className?: string;
}

interface LogoAsset {
  img: HTMLImageElement;
  url: string;
  name: string;
  dataUrl: string;
}

type Gesture =
  | {
      mode: "drag";
      startX: number;
      startY: number;
      startTransform: DesignTransform;
      printArea: { w: number; h: number };
    }
  | {
      mode: "pinch";
      startDistance: number;
      startMidpoint: { x: number; y: number };
      startTransform: DesignTransform;
      printArea: { w: number; h: number };
    };

const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/svg+xml"]);
const MAX_LOGO_BYTES = 5 * 1024 * 1024;

function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_TYPES.has(file.type)) return true;
  if (file.type) return false;
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension === "png" || extension === "jpg" || extension === "jpeg" || extension === "svg";
}

function chooseInitialId(ids: string[], preferred?: string): string {
  return preferred && ids.includes(preferred) ? preferred : ids[0];
}

export const MockupStudio = forwardRef<MockupStudioHandle, MockupStudioProps>(
  function MockupStudio(
    {
      product,
      initialColorId,
      initialViewId,
      onChange,
      onExport,
      renderer = "canvas",
      className,
    },
    ref,
  ) {
    const { t, lang } = useLanguage();
    const [colorId, setColorId] = useState(() =>
      chooseInitialId(
        product.colors.map((color) => color.id),
        initialColorId,
      ),
    );
    const [viewId, setViewId] = useState(() =>
      chooseInitialId(
        product.views.map((view) => view.id),
        initialViewId,
      ),
    );
    const [turnAngle, setTurnAngle] = useState(0);
    const [styleId, setStyleId] = useState(product.options?.styles?.[0] ?? "");
    const [printPlacement, setPrintPlacement] = useState<PrintPlacement>("front");
    const [availablePlacements, setAvailablePlacements] = useState<PrintPlacement[]>(["front"]);
    const [transform, setTransform] = useState<DesignTransform>({
      x: 0.5,
      y: 0.5,
      scale: 1,
      rotation: 0,
    });
    const [logo, setLogo] = useState<LogoAsset | null>(null);
    const [assetState, setAssetState] = useState<"loading" | "ready" | "error">("loading");
    const [assetReload, setAssetReload] = useState(0);
    const [logoError, setLogoError] = useState<string | null>(null);
    const [renderError, setRenderError] = useState(false);
    const [removeWhite, setRemoveWhite] = useState(false);
    const [threshold, setThreshold] = useState(245);
    const [inkMode, setInkMode] = useState<InkMode>("original");
    const [guideActive, setGuideActive] = useState(true);
    const [guideOpacity, setGuideOpacity] = useState(0.85);
    const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState(false);
    const [dragging, setDragging] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const idleTimer = useRef<number | null>(null);
    const guideOpacityRef = useRef(0.85);
    const pointers = useRef(new Map<number, { x: number; y: number }>());
    const gesture = useRef<Gesture | null>(null);
    const logoUrl = useRef<string | null>(null);
    const pendingLogoUrl = useRef<string | null>(null);
    const transformRef = useRef(transform);
    transformRef.current = transform;

    const fileInputId = useId();
    const hintId = useId();

    const view = product.views.find((item) => item.id === viewId) ?? product.views[0];
    const color = product.colors.find((item) => item.id === colorId) ?? product.colors[0];
    const baseImage =
      assetState === "ready" ? getCachedImage(color.imageOverride ?? view.baseImage) : null;
    const baseSize = getImageSize(baseImage);
    const aspect = baseSize ? baseSize.width / baseSize.height : 900 / 1100;
    const logoSize = logo ? getImageSize(logo.img) : null;
    const logoAspect = logoSize ? logoSize.height / logoSize.width : 1;
    const logicPrintArea = useMemo(
      () =>
        getPrintAreaPixels(view.printArea, {
          width: 1000,
          height: 1000 / aspect,
        }),
      [view.printArea, aspect],
    );
    const pointerPrintArea = useMemo(
      () => getPrintAreaPixels(view.printArea, displaySize),
      [view.printArea, displaySize],
    );
    const maximumScale = logo
      ? Math.max(MIN_LOGO_SCALE, maxScaleFor(logoAspect, logicPrintArea, transform.rotation))
      : 1;

    const state = useMemo<DesignState>(
      () => ({
        productId: product._id,
        colorId: color.id,
        viewId: view.id,
        ...(styleId ? { styleId } : {}),
        ...(logo ? { logoFileName: logo.name } : {}),
        ...(logo ? { logoDataUrl: logo.dataUrl } : {}),
        printPlacement,
        transform,
      }),
      [product._id, color.id, view.id, styleId, logo, printPlacement, transform],
    );

    const markActive = useCallback(() => {
      setGuideActive(true);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => setGuideActive(false), 1500);
    }, []);

    useEffect(() => {
      let active = true;
      void fetchPrintPlacementSettings().then((settings) => {
        if (!active) return;
        const profile = settings.profiles[product._id];
        const next = profile?.placements ?? settings.placements[product.category as keyof typeof settings.placements] ?? ["front"];
        setAvailablePlacements(next);
        setPrintPlacement((current) => next.includes(current) ? current : next[0]);
      }).catch(() => {
        if (active) setAvailablePlacements(["front"]);
      });
      return () => {
        active = false;
      };
    }, [product]);

    useEffect(() => {
      markActive();
      return () => {
        if (idleTimer.current) window.clearTimeout(idleTimer.current);
      };
    }, [markActive]);

    useEffect(() => {
      const target = guideActive ? 0.85 : 0.18;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        guideOpacityRef.current = target;
        setGuideOpacity(target);
        return;
      }
      let frame = 0;
      const started = performance.now();
      const from = guideOpacityRef.current;
      const duration = 420;
      const tick = (now: number) => {
        const progress = Math.min(1, (now - started) / duration);
        const eased = 1 - (1 - progress) ** 3;
        const value = from + (target - from) * eased;
        guideOpacityRef.current = value;
        setGuideOpacity(value);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }, [guideActive]);

    useEffect(() => {
      const controller = new AbortController();
      const sources = [view.baseImage, view.shadingImage, color.imageOverride].filter(
        (source): source is string => Boolean(source),
      );
      setAssetState("loading");
      loadImages(sources, controller.signal)
        .then(() => {
          setAssetState("ready");
          setRenderError(false);
        })
        .catch((error: unknown) => {
          if (!isAbortError(error)) setAssetState("error");
        });
      return () => controller.abort();
    }, [view.baseImage, view.shadingImage, color.imageOverride, assetReload]);

    useEffect(() => {
      if (!product.colors.some((item) => item.id === colorId)) {
        setColorId(product.colors[0].id);
      }
      if (!product.views.some((item) => item.id === viewId)) {
        setViewId(product.views[0].id);
      }
      if (product.options?.styles && !product.options.styles.includes(styleId)) {
        setStyleId(product.options.styles[0] ?? "");
      }
    }, [product, colorId, viewId, styleId]);

    useEffect(() => {
      setTransform((current) => clampTransform(current, logoAspect, logicPrintArea));
    }, [logoAspect, logicPrintArea]);

    useEffect(() => {
      onChange?.(state);
    }, [state, onChange]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const observer = new ResizeObserver((entries) => {
        const rect = entries[0]?.contentRect;
        if (!rect) return;
        const width = Math.round(rect.width * 100) / 100;
        const height = Math.round(rect.height * 100) / 100;
        setDisplaySize((current) => {
          if (
            Math.abs(current.width - width) < 0.5 &&
            Math.abs(current.height - height) < 0.5
          ) {
            return current;
          }
          return { width, height };
        });
      });
      observer.observe(canvas);
      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || assetState !== "ready" || displaySize.width <= 0 || displaySize.height <= 0) {
        return;
      }
      const context = canvas.getContext("2d");
      if (!context) return;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.max(1, Math.round(displaySize.width * pixelRatio));
      const pixelHeight = Math.max(1, Math.round(displaySize.height * pixelRatio));
      if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
      if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      try {
        renderMockup(context, {
          product,
          colorId: color.id,
          viewId: view.id,
          logoImg: logo?.img ?? null,
          transform,
          size: displaySize,
          showGuides: true,
          guideOpacity,
          inkMode,
          removeWhite: removeWhite ? threshold : 0,
          background: "#033A34",
          pixelRatio,
        });
        setRenderError(false);
      } catch {
        setRenderError(true);
      }
    }, [
      assetState,
      displaySize,
      product,
      color.id,
      view.id,
      logo,
      transform,
      guideOpacity,
      inkMode,
      removeWhite,
      threshold,
    ]);

    useEffect(() => {
      return () => {
        if (logoUrl.current) URL.revokeObjectURL(logoUrl.current);
        if (pendingLogoUrl.current) URL.revokeObjectURL(pendingLogoUrl.current);
      };
    }, []);

    const updateTransform = useCallback(
      (updater: (current: DesignTransform) => DesignTransform) => {
        setTransform((current) => clampTransform(updater(current), logoAspect, logicPrintArea));
        markActive();
      },
      [logoAspect, logicPrintArea, markActive],
    );

    function selectPrintPlacement(placement: PrintPlacement) {
      setPrintPlacement(placement);
      const positionByPlacement: Record<PrintPlacement, { x: number; y: number }> = {
        front: { x: 0.5, y: 0.5 },
        back: { x: 0.5, y: 0.5 },
        "left-sleeve": { x: 0.35, y: 0.42 },
        "right-sleeve": { x: 0.65, y: 0.42 },
        custom: { x: 0.5, y: 0.6 },
      };
      const position = positionByPlacement[placement];
      setTransform((current) => clampTransform({ ...current, ...position }, logoAspect, logicPrintArea));
      markActive();
    }

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      setLogoError(null);
      if (!isAcceptedFile(file)) {
        setLogoError(t.studioUi.uploadTypeError);
        return;
      }
      if (file.size > MAX_LOGO_BYTES) {
        setLogoError(t.studioUi.uploadSizeError);
        return;
      }

      const url = URL.createObjectURL(file);
      if (pendingLogoUrl.current) URL.revokeObjectURL(pendingLogoUrl.current);
      pendingLogoUrl.current = url;
      const image = new Image();
      image.onload = () => {
        pendingLogoUrl.current = null;
        if (logoUrl.current) URL.revokeObjectURL(logoUrl.current);
        logoUrl.current = url;
        const nextAspect = image.naturalHeight / image.naturalWidth;
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            setLogo({ img: image, url, name: file.name, dataUrl: reader.result });
          }
        };
        reader.readAsDataURL(file);
        setTransform(getDefaultTransform(nextAspect, logicPrintArea));
        setRenderError(false);
        markActive();
      };
      image.onerror = () => {
        pendingLogoUrl.current = null;
        URL.revokeObjectURL(url);
        setLogoError(t.studioUi.uploadReadError);
      };
      image.src = url;
    }

    function removeLogo() {
      if (logoUrl.current) URL.revokeObjectURL(logoUrl.current);
      logoUrl.current = null;
      if (pendingLogoUrl.current) URL.revokeObjectURL(pendingLogoUrl.current);
      pendingLogoUrl.current = null;
      setLogo(null);
      setLogoError(null);
      setExportError(false);
      setTransform(getDefaultTransform(1, logicPrintArea));
      markActive();
    }

    function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
      if (!logo || displaySize.width <= 0) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const canvas = event.currentTarget;
      canvas.focus({ preventScroll: true });
      event.preventDefault();
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture can fail after a cancelled touch.
      }
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      markActive();
      setDragging(true);

      if (pointers.current.size === 1) {
        gesture.current = {
          mode: "drag",
          startX: event.clientX,
          startY: event.clientY,
          startTransform: transformRef.current,
          printArea: pointerPrintArea,
        };
        return;
      }

      if (pointers.current.size === 2) {
        const [first, second] = Array.from(pointers.current.values());
        gesture.current = {
          mode: "pinch",
          startDistance: Math.max(1, Math.hypot(first.x - second.x, first.y - second.y)),
          startMidpoint: {
            x: (first.x + second.x) / 2,
            y: (first.y + second.y) / 2,
          },
          startTransform: transformRef.current,
          printArea: pointerPrintArea,
        };
      }
    }

    function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
      if (!pointers.current.has(event.pointerId)) return;
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      markActive();
      const current = gesture.current;
      if (!current) return;

      if (current.mode === "drag" && pointers.current.size === 1) {
        const dx = (event.clientX - current.startX) / current.printArea.w;
        const dy = (event.clientY - current.startY) / current.printArea.h;
        updateTransform(() => ({
          ...current.startTransform,
          x: current.startTransform.x + dx,
          y: current.startTransform.y + dy,
        }));
        return;
      }

      if (current.mode === "pinch" && pointers.current.size >= 2) {
        const [first, second] = Array.from(pointers.current.values()).slice(0, 2);
        const distance = Math.max(1, Math.hypot(first.x - second.x, first.y - second.y));
        const midpoint = {
          x: (first.x + second.x) / 2,
          y: (first.y + second.y) / 2,
        };
        const scale = current.startTransform.scale * (distance / current.startDistance);
        const dx = (midpoint.x - current.startMidpoint.x) / current.printArea.w;
        const dy = (midpoint.y - current.startMidpoint.y) / current.printArea.h;
        updateTransform(() => ({
          ...current.startTransform,
          scale,
          x: current.startTransform.x + dx,
          y: current.startTransform.y + dy,
        }));
      }
    }

    function finishPointer(event: ReactPointerEvent<HTMLCanvasElement>) {
      pointers.current.delete(event.pointerId);
      const canvas = event.currentTarget;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      if (pointers.current.size === 0) {
        gesture.current = null;
        setDragging(false);
        return;
      }
      if (pointers.current.size === 1) {
        const [remaining] = Array.from(pointers.current.values());
        gesture.current = {
          mode: "drag",
          startX: remaining.x,
          startY: remaining.y,
          startTransform: transformRef.current,
          printArea: pointerPrintArea,
        };
      }
    }

    function handleKeyDown(event: ReactKeyboardEvent<HTMLCanvasElement>) {
      if (!logo) return;
      const step = event.shiftKey ? 0.05 : 0.01;
      const x = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      const y = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
      if (x !== 0 || y !== 0) {
        event.preventDefault();
        updateTransform((current) => ({
          ...current,
          x: current.x + x * step,
          y: current.y + y * step,
        }));
        return;
      }
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        updateTransform((current) => ({ ...current, scale: current.scale + 0.05 }));
        return;
      }
      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        updateTransform((current) => ({ ...current, scale: current.scale - 0.05 }));
      }
    }

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !logo || displaySize.width <= 0) return;
      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        markActive();
        const factor = Math.exp(-event.deltaY * 0.0012);
        updateTransform((current) => ({ ...current, scale: current.scale * factor }));
      };
      canvas.addEventListener("wheel", onWheel, { passive: false });
      return () => canvas.removeEventListener("wheel", onWheel);
    }, [logo, displaySize, markActive, updateTransform]);

    const exportPng = useCallback(async (): Promise<MockupExport> => {
      if (!logo) throw new Error("A logo is required");
      const blob = await renderMockupToBlob(
        {
          product,
          colorId: color.id,
          viewId: view.id,
          logoImg: logo.img,
          transform,
          size: {
            width: 1200,
            height: Math.max(1, Math.round(1200 * (baseSize ? baseSize.height / baseSize.width : 1100 / 900))),
          },
          showGuides: false,
          inkMode,
          removeWhite: removeWhite ? threshold : 0,
          background: "#033A34",
          pixelRatio: 1,
        },
        1200,
      );
      return { blob, state };
    }, [
      logo,
      product,
      color.id,
      view.id,
      transform,
      baseSize,
      inkMode,
      removeWhite,
      threshold,
      state,
    ]);

    useImperativeHandle(
      ref,
      () => ({
        exportPng,
        getState: () => state,
      }),
      [exportPng, state],
    );

    async function handleDownload() {
      if (!logo || isExporting) return;
      setIsExporting(true);
      setExportError(false);
      try {
        const result = await exportPng();
        const url = URL.createObjectURL(result.blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `yuzersef-${product._id}-${color.id}-${view.id}.png`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        onExport?.(result);
      } catch {
        setExportError(true);
      } finally {
        setIsExporting(false);
      }
    }

    const disabled = !logo;

    return (
      <div
        data-mockup-studio
        data-renderer={renderer}
        className={cn(
          "grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start",
          className,
        )}
      >
        <div className="min-w-0">
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-bone/15 bg-forest-900">
            <div className="flex items-center justify-between gap-3 border-b border-bone/10 px-4 py-3">
              <p className="truncate text-sm text-bone/75">
                {product.name}
                <span className="text-bone/35"> / {view.label}</span>
              </p>
              <DemoTag className="text-bone/60" />
            </div>

            <div className="relative bg-forest-950/45 p-3 sm:p-5">
              <div className="relative mx-auto w-full max-w-[640px]">
                <div
                  className="relative transition-transform duration-500 [transform-style:preserve-3d]"
                  style={{
                    perspective: "1000px",
                    transform: `rotateY(${turnAngle}deg)`,
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    width={900}
                    height={1100}
                    tabIndex={0}
                    role="application"
                    aria-label={t.studioUi.previewAlt}
                    aria-describedby={hintId}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={finishPointer}
                    onPointerCancel={finishPointer}
                    onLostPointerCapture={(event) => {
                      pointers.current.delete(event.pointerId);
                      if (pointers.current.size === 0) {
                        gesture.current = null;
                        setDragging(false);
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    style={{ aspectRatio: aspect }}
                    className={cn(
                      "block w-full touch-none select-none rounded-[1.35rem] border border-bone/10",
                      logo ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default",
                    )}
                  />
                </div>

                {!logo && assetState === "ready" && !renderError ? (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center p-5">
                    <span className="flex max-w-[26ch] flex-col items-center gap-2 rounded-2xl border border-bone/15 bg-forest-950/70 px-5 py-4 text-center text-sm leading-relaxed text-bone/75 backdrop-blur-sm">
                      <ImageSquare aria-hidden="true" size={22} className="text-sand/80" />
                      {t.studioUi.noLogo}
                    </span>
                  </div>
                ) : null}

                {assetState === "loading" ? (
                  <div
                    role="status"
                    className="pointer-events-none absolute inset-0 grid place-items-center bg-forest-950/50 p-5"
                  >
                    <span className="inline-flex items-center gap-2 rounded-full border border-bone/15 bg-forest-950/80 px-4 py-2 text-sm text-bone/75">
                      <CircleNotch aria-hidden="true" size={17} className="animate-spin" />
                      {t.studioUi.loading}
                    </span>
                  </div>
                ) : null}

                {assetState === "error" ? (
                  <div
                    role="alert"
                    className="absolute inset-0 grid place-items-center bg-forest-950/75 p-5 text-center"
                  >
                    <div className="max-w-[30ch]">
                      <WarningCircle aria-hidden="true" size={26} className="mx-auto text-danger" />
                      <p className="mt-2 text-sm leading-relaxed text-bone/80">
                        {t.studioUi.loadError}
                      </p>
                      <button
                        type="button"
                        onClick={() => setAssetReload((value) => value + 1)}
                        className={cn(buttonClass("secondary"), "mt-4")}
                      >
                        {t.studioUi.retry}
                      </button>
                    </div>
                  </div>
                ) : null}

                {renderError ? (
                  <div
                    role="alert"
                    className="pointer-events-none absolute inset-0 grid place-items-center bg-forest-950/70 p-5 text-center"
                  >
                    <p className="max-w-[30ch] text-sm leading-relaxed text-danger">
                      {t.studioUi.loadError}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            <p
              id={hintId}
              className="border-t border-bone/10 px-4 py-3 text-xs leading-relaxed text-bone/50"
            >
              {t.studioUi.dragHint}
            </p>
          </div>

          <p className="mt-3 px-1 text-xs leading-relaxed text-bone/40">
            {t.studioUi.demoNote}
          </p>
        </div>

        <aside className="space-y-5 rounded-[var(--radius-card)] border border-bone/15 bg-forest-900/45 p-5">
          <section aria-labelledby={`${fileInputId}-logo-label`}>
            <h2
              id={`${fileInputId}-logo-label`}
              className="text-xs font-semibold uppercase tracking-[0.16em] text-bone/45"
            >
              {t.studioUi.logoLabel}
            </h2>
            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,.png,.jpg,.jpeg,.svg"
              onChange={handleFileChange}
              className="sr-only"
            />
            <label
              htmlFor={fileInputId}
              className={cn(buttonClass("secondary"), "mt-3 w-full cursor-pointer")}
            >
              <UploadSimple aria-hidden="true" size={18} />
              {logo ? t.studioUi.replace : t.studioUi.upload}
            </label>
            {logo ? (
              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-bone/55">
                <span className="min-w-0 truncate" dir="auto">
                  {logo.name}
                </span>
                <button
                  type="button"
                  onClick={removeLogo}
                  className="inline-flex min-h-[36px] shrink-0 items-center gap-1 rounded-full px-2 text-bone/55 transition-colors hover:text-danger"
                >
                  <Trash aria-hidden="true" size={15} />
                  {t.studioUi.remove}
                </button>
              </div>
            ) : (
              <p className="mt-3 text-xs leading-relaxed text-bone/45">
                {t.studioUi.uploadHint}
              </p>
            )}
            {logoError ? (
              <p role="alert" className="mt-2 text-xs leading-relaxed text-danger">
                {logoError}
              </p>
            ) : null}
          </section>

          {product.options?.styles?.length ? (
            <section className="border-t border-bone/10 pt-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-bone/45">
                {t.request.fields.style}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.options.styles.map((style) => (
                  <button
                    key={style}
                    type="button"
                    aria-pressed={style === styleId}
                    onClick={() => {
                      setStyleId(style);
                      markActive();
                    }}
                    className={cn(
                      "min-h-[40px] rounded-full border px-4 text-sm transition-colors",
                      style === styleId
                        ? "border-sand bg-sand text-forest-950"
                        : "border-bone/25 bg-forest-900/40 text-bone/75 hover:border-sand/60 hover:text-sand",
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section className="border-t border-bone/10 pt-5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-bone/45">
              {t.studioUi.colorLabel}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {product.colors.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`${t.studioUi.colorLabel}: ${item.name}`}
                  aria-pressed={item.id === color.id}
                  title={item.name}
                  onClick={() => {
                    setColorId(item.id);
                    markActive();
                  }}
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-full border transition-[transform,border-color,box-shadow]",
                    item.id === color.id
                      ? "border-sand shadow-[0_0_0_2px_var(--color-forest-900),0_0_0_4px_var(--color-sand)]"
                      : "border-bone/25 hover:scale-105 hover:border-bone/50",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="block h-7 w-7 rounded-full border border-black/15"
                    style={{ backgroundColor: item.hex }}
                  />
                </button>
              ))}
            </div>
          </section>

          {product.views.length > 1 ? (
            <section className="border-t border-bone/10 pt-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-bone/45">
                {t.studioUi.viewLabel}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.views.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={item.id === view.id}
                    onClick={() => {
                      setViewId(item.id);
                      setTurnAngle(product.views.indexOf(item) === 0 ? 0 : 180);
                      markActive();
                    }}
                    className={cn(
                      "min-h-[40px] rounded-full border px-4 text-sm transition-colors",
                      item.id === view.id
                        ? "border-sand bg-sand text-forest-950"
                        : "border-bone/20 text-bone/65 hover:border-bone/40 hover:text-bone",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <label className="mt-4 block">
                <span className="flex items-center justify-between gap-3 text-sm text-bone/75">
                  <span>{t.studioUi.turnLabel}</span>
                  <span className="font-latin text-xs text-sand/80">{turnAngle}°</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={180}
                  step={1}
                  value={turnAngle}
                  onChange={(event) => {
                    const angle = Number(event.target.value);
                    setTurnAngle(angle);
                    if (product.views.length > 1) {
                      setViewId(product.views[angle >= 90 ? 1 : 0].id);
                    }
                    markActive();
                  }}
                  className="mt-2 w-full accent-sand"
                  aria-label={t.studioUi.turnLabel}
                />
              </label>
            </section>
          ) : null}

          <section className="border-t border-bone/10 pt-5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-bone/45">
              {lang === "ar" ? "موضع الطباعة" : "Print placement"}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-bone/55">
              {lang === "ar" ? "اختر موضعًا متاحًا لهذا المنتج فقط. الخيارات يحددها فريق الإدارة." : "Choose a position available for this product. Options are controlled by the admin."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {availablePlacements.map((placement) => (
                <button
                  key={placement}
                  type="button"
                  aria-pressed={printPlacement === placement}
                  onClick={() => selectPrintPlacement(placement)}
                  className={cn(
                    "min-h-[40px] rounded-full border px-4 text-sm transition-colors",
                    printPlacement === placement
                      ? "border-sand bg-sand text-forest-950"
                      : "border-bone/20 text-bone/65 hover:border-bone/40 hover:text-bone",
                  )}
                >
                  {{
                    front: lang === "ar" ? "الأمام" : "Front",
                    back: lang === "ar" ? "الخلف" : "Back",
                    "left-sleeve": lang === "ar" ? "الكم الأيسر" : "Left sleeve",
                    "right-sleeve": lang === "ar" ? "الكم الأيمن" : "Right sleeve",
                    custom: lang === "ar" ? "موضع مخصص" : "Custom placement",
                  }[placement]}
                </button>
              ))}
            </div>
          </section>

          <section className="border-t border-bone/10 pt-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-bone/45">
                {t.studioUi.controls}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setTransform(getDefaultTransform(logoAspect, logicPrintArea));
                  markActive();
                }}
                disabled={disabled}
                className="inline-flex min-h-[36px] items-center gap-1 rounded-full px-2 text-xs text-bone/55 transition-colors hover:text-sand disabled:opacity-40"
              >
                <ArrowCounterClockwise aria-hidden="true" size={14} />
                {t.studioUi.reset}
              </button>
            </div>

            <label className="mt-4 block">
              <span className="flex items-center justify-between gap-3 text-sm text-bone/75">
                <span>{t.studioUi.scale}</span>
                <span className="font-latin text-xs text-sand/80">
                  {Math.round(transform.scale * 100)}%
                </span>
              </span>
              <input
                type="range"
                min={MIN_LOGO_SCALE}
                max={maximumScale}
                step={0.01}
                value={Math.min(transform.scale, maximumScale)}
                disabled={disabled}
                onChange={(event) => {
                  const scale = Number(event.target.value);
                  updateTransform((current) => ({ ...current, scale }));
                }}
                className="mt-2 w-full accent-sand disabled:opacity-40"
              />
            </label>

            <label className="mt-4 block">
              <span className="flex items-center justify-between gap-3 text-sm text-bone/75">
                <span>{t.studioUi.rotation}</span>
                <span className="font-latin text-xs text-sand/80">
                  {Math.round(transform.rotation)}°
                </span>
              </span>
              <input
                type="range"
                min={-45}
                max={45}
                step={1}
                value={transform.rotation}
                disabled={disabled}
                onChange={(event) => {
                  const rotation = Number(event.target.value);
                  updateTransform((current) => ({ ...current, rotation }));
                }}
                className="mt-2 w-full accent-sand disabled:opacity-40"
              />
            </label>
          </section>

          {logo ? (
            <section className="border-t border-bone/10 pt-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-bone/45">
                {t.studioUi.treatment}
              </h2>

              <label className="mt-4 flex items-center justify-between gap-3">
                <span className="text-sm text-bone/75">{t.studioUi.removeWhite}</span>
                <input
                  type="checkbox"
                  checked={removeWhite}
                  onChange={(event) => {
                    setRemoveWhite(event.target.checked);
                    markActive();
                  }}
                  className="h-5 w-5 accent-sand"
                />
              </label>
              <p className="mt-1 text-xs leading-relaxed text-bone/45">
                {t.studioUi.removeWhiteHint}
              </p>

              {removeWhite ? (
                <label className="mt-3 block">
                  <span className="flex items-center justify-between gap-3 text-xs text-bone/60">
                    <span>{t.studioUi.removalStrength}</span>
                    <span className="font-latin text-sand/70">{threshold}</span>
                  </span>
                  <input
                    type="range"
                    min={210}
                    max={255}
                    step={1}
                    value={threshold}
                    onChange={(event) => {
                      setThreshold(Number(event.target.value));
                      markActive();
                    }}
                    className="mt-2 w-full accent-sand"
                  />
                </label>
              ) : null}

              <div className="mt-4">
                <p className="text-sm text-bone/75">{t.studioUi.inkMode}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(
                    [
                      ["original", t.studioUi.inkOriginal],
                      ["white", t.studioUi.inkWhite],
                    ] as const
                  ).map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={inkMode === mode}
                      onClick={() => {
                        setInkMode(mode);
                        markActive();
                      }}
                      className={cn(
                        "min-h-[40px] rounded-full border px-3 text-sm transition-colors",
                        inkMode === mode
                          ? "border-sand bg-sand text-forest-950"
                          : "border-bone/20 text-bone/65 hover:border-bone/40 hover:text-bone",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-bone/45">
                  {t.studioUi.whiteHint}
                </p>
              </div>
            </section>
          ) : null}

          <section className="border-t border-bone/10 pt-5">
            <button
              type="button"
              onClick={handleDownload}
              disabled={disabled || isExporting}
              className={cn(buttonClass("primary"), "w-full")}
            >
              {isExporting ? (
                <CircleNotch aria-hidden="true" size={18} className="animate-spin" />
              ) : (
                <DownloadSimple aria-hidden="true" size={18} />
              )}
              {isExporting ? t.studioUi.exporting : t.studioUi.download}
            </button>
            {exportError ? (
              <p role="alert" className="mt-2 text-xs leading-relaxed text-danger">
                {t.studioUi.exportError}
              </p>
            ) : null}
          </section>
        </aside>
      </div>
    );
  },
);

function loadImages(sources: string[], signal: AbortSignal): Promise<void> {
  return Promise.all(sources.map((source) => loadImage(source, signal))).then(() => undefined);
}

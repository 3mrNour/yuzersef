import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "../../lib/cn";
import { clamp, clampRect, MIN_PRINT_AREA } from "./geometry";
import type { Rect } from "./types";

export type PrintAreaLang = "ar" | "en";

export interface PrintAreaLabels {
  editor: string;
  x: string;
  y: string;
  width: string;
  height: string;
  hint: string;
  imageAlt: string;
  imageError: string;
}

const LABELS: Record<PrintAreaLang, PrintAreaLabels> = {
  ar: {
    editor: "محرر مساحة الطباعة",
    x: "س",
    y: "ص",
    width: "العرض",
    height: "الارتفاع",
    hint: "اسحب المستطيل للتحريك، واسحب المقابض لتغيير الحجم. الأسهم للتحريك، وAlt مع الأسهم لتغيير الحجم.",
    imageAlt: "صورة المنتج لضبط مساحة الطباعة",
    imageError: "مش قادرين نحمّل صورة المنتج.",
  },
  en: {
    editor: "Print area editor",
    x: "X",
    y: "Y",
    width: "Width",
    height: "Height",
    hint: "Drag the rectangle to move it, and drag a handle to resize. Arrow keys move, Alt plus arrows resize.",
    imageAlt: "Product image for print area editing",
    imageError: "We could not load the product image.",
  },
};

type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
type Interaction = { mode: "move" | Handle; startX: number; startY: number; startRect: Rect };

interface PrintAreaEditorProps {
  imageUrl: string;
  value: Rect;
  onChange: (rect: Rect) => void;
  lang?: PrintAreaLang;
  labels?: Partial<PrintAreaLabels>;
  className?: string;
  minSize?: number;
}

const HANDLES: { id: Handle; className: string }[] = [
  { id: "nw", className: "-left-3 -top-3 cursor-nwse-resize" },
  { id: "n", className: "left-1/2 -top-3 -translate-x-1/2 cursor-ns-resize" },
  { id: "ne", className: "-right-3 -top-3 cursor-nesw-resize" },
  { id: "e", className: "-right-3 top-1/2 -translate-y-1/2 cursor-ew-resize" },
  { id: "se", className: "-bottom-3 -right-3 cursor-nwse-resize" },
  { id: "s", className: "bottom-[-0.75rem] left-1/2 -translate-x-1/2 cursor-ns-resize" },
  { id: "sw", className: "-bottom-3 -left-3 cursor-nesw-resize" },
  { id: "w", className: "-left-3 top-1/2 -translate-y-1/2 cursor-ew-resize" },
];

function percent(value: number): number {
  return Math.round(value * 10000) / 100;
}

function handleResize(start: Rect, handle: Handle, dx: number, dy: number, minSize: number): Rect {
  let left = start.x;
  let top = start.y;
  let right = start.x + start.w;
  let bottom = start.y + start.h;

  if (handle.includes("w")) left = clamp(start.x + dx, 0, right - minSize);
  if (handle.includes("e")) right = clamp(start.x + start.w + dx, left + minSize, 1);
  if (handle.includes("n")) top = clamp(start.y + dy, 0, bottom - minSize);
  if (handle.includes("s")) bottom = clamp(start.y + start.h + dy, top + minSize, 1);

  return { x: left, y: top, w: right - left, h: bottom - top };
}

export function PrintAreaEditor({
  imageUrl,
  value,
  onChange,
  lang = "ar",
  labels: labelOverrides,
  className,
  minSize = MIN_PRINT_AREA,
}: PrintAreaEditorProps) {
  const labels = { ...LABELS[lang], ...labelOverrides };
  const hintId = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const interaction = useRef<Interaction | null>(null);
  const [imageState, setImageState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    setImageState("loading");
  }, [imageUrl]);

  function begin(mode: "move" | Handle, event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    overridePointerCapture(event.pointerId);
    interaction.current = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      startRect: value,
    };
  }

  function overridePointerCapture(pointerId: number) {
    const overlay = overlayRef.current;
    if (!overlay) return;
    try {
      overlay.setPointerCapture(pointerId);
    } catch {
      // Pointer capture can fail after a cancelled touch.
    }
  }

  function move(event: ReactPointerEvent<HTMLDivElement>) {
    const current = interaction.current;
    const overlay = overlayRef.current;
    if (!current || !overlay) return;
    const bounds = overlay.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0) return;
    const dx = (event.clientX - current.startX) / bounds.width;
    const dy = (event.clientY - current.startY) / bounds.height;

    if (current.mode === "move") {
      onChange(
        clampRect(
          {
            ...current.startRect,
            x: current.startRect.x + dx,
            y: current.startRect.y + dy,
          },
          minSize,
        ),
      );
      return;
    }

    onChange(handleResize(current.startRect, current.mode, dx, dy, minSize));
  }

  function end(event: ReactPointerEvent<HTMLDivElement>) {
    const overlay = overlayRef.current;
    if (overlay?.hasPointerCapture(event.pointerId)) {
      overlay.releasePointerCapture(event.pointerId);
    }
    interaction.current = null;
  }

  function nudge(event: ReactKeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 0.05 : 0.01;
    const directionX = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    const directionY = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
    if (directionX === 0 && directionY === 0) return;
    event.preventDefault();

    if (event.altKey) {
      const w = clamp(value.w + directionX * step, minSize, 1 - value.x);
      const h = clamp(value.h + directionY * step, minSize, 1 - value.y);
      onChange(clampRect({ ...value, w, h }, minSize));
      return;
    }

    onChange(
      clampRect(
        {
          ...value,
          x: value.x + directionX * step,
          y: value.y + directionY * step,
        },
        minSize,
      ),
    );
  }

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className={cn("w-full", className)}>
      <div className="relative overflow-hidden rounded-[var(--radius-field)] border border-bone/15 bg-forest-950">
        <img
          src={imageUrl}
          alt={labels.imageAlt}
          draggable={false}
          onLoad={() => setImageState("ready")}
          onError={() => setImageState("error")}
          className="block w-full select-none"
        />

        {imageState === "error" ? (
          <div className="absolute inset-0 grid place-items-center bg-forest-950/80 p-6 text-center text-sm text-danger">
            {labels.imageError}
          </div>
        ) : null}

        {imageState === "ready" ? (
          <div
            ref={overlayRef}
            className="absolute inset-0 touch-none"
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            onLostPointerCapture={() => {
              interaction.current = null;
            }}
          >
            <div
              role="group"
              tabIndex={0}
              aria-label={labels.editor}
              aria-describedby={hintId}
              onKeyDown={nudge}
              onPointerDown={(event) => begin("move", event)}
              className="absolute cursor-move touch-none border-2 border-sand bg-sand/10 shadow-[0_0_0_9999px_rgba(2,37,33,0.58)] focus-visible:outline-offset-2"
              style={{
                left: `${value.x * 100}%`,
                top: `${value.y * 100}%`,
                width: `${value.w * 100}%`,
                height: `${value.h * 100}%`,
              }}
            >
              {HANDLES.map((handle) => (
                <span
                  key={handle.id}
                  aria-hidden="true"
                  className={cn(
                    "absolute grid h-7 w-7 touch-none place-items-center",
                    handle.className,
                  )}
                  onPointerDown={(event) => begin(handle.id, event)}
                >
                  <span className="h-3.5 w-3.5 rounded-full border border-forest-950 bg-sand shadow-sm" />
                </span>
              ))}

              <span className="pointer-events-none absolute start-1 top-1 rounded bg-forest-950/80 px-1.5 py-0.5 font-latin text-[10px] text-sand">
                {Math.round(value.w * 100)} x {Math.round(value.h * 100)}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <p id={hintId} className="mt-3 text-xs leading-relaxed text-bone/50">
        {labels.hint}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ["x", value.x, 1 - value.w],
            ["y", value.y, 1 - value.h],
            ["width", value.w, 1 - value.x],
            ["height", value.h, 1 - value.y],
          ] as const
        ).map(([key, current, maximum]) => {
          const label = labels[key];
          const minimum = key === "width" || key === "height" ? minSize : 0;
          return (
            <label key={key} className="block">
              <span className="mb-1.5 block text-xs text-bone/60">{label}</span>
              <span className="relative block">
                <input
                  type="number"
                  dir="ltr"
                  inputMode="decimal"
                  min={percent(minimum)}
                  max={percent(maximum)}
                  step={0.5}
                  value={percent(current)}
                  onChange={(event) => {
                    if (event.target.value === "") return;
                    const next = Number(event.target.value);
                    if (!Number.isFinite(next)) return;
                    const normalized = next / 100;
                    if (key === "width") {
                      onChange({ ...value, w: clamp(normalized, minSize, 1 - value.x) });
                      return;
                    }
                    if (key === "height") {
                      onChange({ ...value, h: clamp(normalized, minSize, 1 - value.y) });
                      return;
                    }
                    if (key === "x") {
                      onChange({ ...value, x: clamp(normalized, 0, 1 - value.w) });
                      return;
                    }
                    onChange({ ...value, y: clamp(normalized, 0, 1 - value.h) });
                  }}
                  className="field pe-7 text-start font-latin text-sm"
                />
                <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs text-bone/40">
                  %
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

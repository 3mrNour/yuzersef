import { clampTransform, getPrintAreaPixels } from "./geometry";
import {
  getCachedImage,
  getFallbackShading,
  getImageSize,
  getProcessedLogo,
  loadImage,
  type InkMode,
} from "./imageCache";
import type { DesignTransform, Product } from "./types";

export interface RenderOptions {
  product: Product;
  colorId: string;
  viewId: string;
  logoImg: HTMLImageElement | null;
  transform: DesignTransform;
  size: { width: number; height: number };
  showGuides?: boolean;
  guideOpacity?: number;
  inkMode?: InkMode;
  removeWhite?: number;
  background?: string | null;
  pixelRatio?: number;
}

export interface MockupRenderer {
  readonly kind: "canvas";
  render(context: CanvasRenderingContext2D, options: RenderOptions): void;
  exportPng(options: RenderOptions, width?: number): Promise<Blob>;
}

const DEFAULT_BACKGROUND = "#033A34";
const tintedBases = new WeakMap<object, Map<string, HTMLCanvasElement>>();
const scratchCanvases = new Map<string, HTMLCanvasElement>();

function getTintedBase(source: CanvasImageSource, hex: string): CanvasImageSource {
  if (typeof source !== "object" || source === null) return source;
  let cache = tintedBases.get(source);
  if (!cache) {
    cache = new Map();
    tintedBases.set(source, cache);
  }
  const cached = cache.get(hex);
  if (cached) return cached;

  const size = getImageSize(source);
  if (!size) return source;
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  if (!context) return source;

  context.drawImage(source, 0, 0);
  context.globalCompositeOperation = "multiply";
  context.fillStyle = hex;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalCompositeOperation = "destination-in";
  context.drawImage(source, 0, 0);
  context.globalCompositeOperation = "source-over";
  cache.set(hex, canvas);
  return canvas;
}

function getScratch(
  name: string,
  width: number,
  height: number,
  pixelRatio: number,
): CanvasRenderingContext2D {
  let canvas = scratchCanvases.get(name);
  if (!canvas) {
    canvas = document.createElement("canvas");
    scratchCanvases.set(name, canvas);
  }
  const pixelWidth = Math.max(1, Math.ceil(width * pixelRatio));
  const pixelHeight = Math.max(1, Math.ceil(height * pixelRatio));
  if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
  if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is not available");
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  return context;
}

function getScratchCanvas(name: string): HTMLCanvasElement {
  const canvas = scratchCanvases.get(name);
  if (!canvas) throw new Error(`Missing scratch canvas: ${name}`);
  return canvas;
}

function drawLogo(
  context: CanvasRenderingContext2D,
  logo: CanvasImageSource,
  logoAspect: number,
  transform: DesignTransform,
  printArea: { x: number; y: number; w: number; h: number },
): void {
  const width = transform.scale * printArea.w;
  const height = width * logoAspect;
  const centerX = printArea.x + transform.x * printArea.w;
  const centerY = printArea.y + transform.y * printArea.h;

  context.save();
  context.beginPath();
  context.rect(printArea.x, printArea.y, printArea.w, printArea.h);
  context.clip();
  context.translate(centerX, centerY);
  context.rotate((transform.rotation * Math.PI) / 180);
  context.drawImage(logo, -width / 2, -height / 2, width, height);
  context.restore();
}

function drawWrappedLogo(
  context: CanvasRenderingContext2D,
  designCanvas: HTMLCanvasElement,
  printArea: { x: number; y: number; w: number; h: number },
  size: { width: number; height: number },
  pixelRatio: number,
): void {
  const warpContext = getScratch("warp", size.width, size.height, pixelRatio);
  const sourceY = printArea.y * pixelRatio;
  const sourceHeight = printArea.h * pixelRatio;
  const stripWidth = Math.max(2, size.width / 300);
  const strips = Math.max(1, Math.ceil(printArea.w / stripWidth));

  warpContext.setTransform(1, 0, 0, 1, 0, 0);
  for (let index = 0; index < strips; index += 1) {
    const left = (index / strips) * printArea.w;
    const right = ((index + 1) / strips) * printArea.w;
    const u0 = clamp(left / printArea.w, 0, 1);
    const u1 = clamp(right / printArea.w, 0, 1);
    const t0 = 0.5 + Math.asin(clamp(2 * u0 - 1, -1, 1)) / Math.PI;
    const t1 = 0.5 + Math.asin(clamp(2 * u1 - 1, -1, 1)) / Math.PI;
    const sourceX = (printArea.x + t0 * printArea.w) * pixelRatio;
    const sourceWidth = Math.max(0.25, (t1 - t0) * printArea.w * pixelRatio);
    const destinationX = (printArea.x + left) * pixelRatio;
    const destinationWidth = Math.max(1, (right - left) * pixelRatio) + 0.35;
    warpContext.drawImage(
      designCanvas,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      destinationX,
      sourceY,
      destinationWidth,
      sourceHeight,
    );
  }
  context.drawImage(getScratchCanvas("warp"), 0, 0, size.width, size.height);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function renderMockup(
  context: CanvasRenderingContext2D,
  options: RenderOptions,
): void {
  const {
    product,
    colorId,
    viewId,
    logoImg,
    transform,
    size,
    showGuides = true,
    guideOpacity = 0.8,
    inkMode = "original",
    removeWhite = 0,
    background = DEFAULT_BACKGROUND,
    pixelRatio = 1,
  } = options;

  const view = product.views.find((item) => item.id === viewId);
  const color = product.colors.find((item) => item.id === colorId);
  if (!view) throw new Error(`Unknown product view: ${viewId}`);
  if (!color) throw new Error(`Unknown product color: ${colorId}`);

  const baseSource = color.imageOverride ?? view.baseImage;
  const baseImage = getCachedImage(baseSource);
  if (!baseImage) return;

  const width = Math.max(1, size.width);
  const height = Math.max(1, size.height);
  const canvasSize = { width, height };
  const printArea = getPrintAreaPixels(view.printArea, canvasSize);
  const tinted = color.imageOverride ? baseImage : getTintedBase(baseImage, color.hex);

  context.save();
  context.clearRect(0, 0, width, height);
  if (background) {
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(tinted, 0, 0, width, height);

  if (logoImg) {
    const logoSize = getImageSize(logoImg);
    if (logoSize) {
      const logoAspect = logoSize.height / logoSize.width;
      const safeTransform = clampTransform(transform, logoAspect, printArea);
      const logo = getProcessedLogo(logoImg, {
        removeWhite,
        inkMode,
      });

      const designContext = getScratch("design", width, height, pixelRatio);
      drawLogo(designContext, logo, logoAspect, safeTransform, printArea);
      designContext.save();
      designContext.globalCompositeOperation = "destination-in";
      designContext.drawImage(tinted, 0, 0, width, height);
      designContext.restore();

      if (view.wrap === "cylinder") {
        drawWrappedLogo(
          context,
          getScratchCanvas("design"),
          printArea,
          canvasSize,
          pixelRatio,
        );
      } else {
        context.drawImage(getScratchCanvas("design"), 0, 0, width, height);
      }
    }
  }

  const shadingSource = view.shadingImage
    ? getCachedImage(view.shadingImage)
    : getFallbackShading(baseImage);
  if (shadingSource) {
    const shadingContext = getScratch("shading", width, height, pixelRatio);
    shadingContext.drawImage(shadingSource, 0, 0, width, height);
    shadingContext.save();
    shadingContext.globalCompositeOperation = "destination-in";
    shadingContext.drawImage(tinted, 0, 0, width, height);
    shadingContext.restore();

    context.save();
    context.globalCompositeOperation = "soft-light";
    context.globalAlpha = view.shadingImage ? 0.7 : 0.45;
    context.drawImage(getScratchCanvas("shading"), 0, 0, width, height);
    context.restore();
  }

  if (showGuides) {
    const lineWidth = Math.max(1, width / 650);
    context.save();
    context.globalAlpha = guideOpacity;
    context.strokeStyle = "#EAC08C";
    context.lineWidth = lineWidth;
    context.setLineDash([lineWidth * 8, lineWidth * 6]);
    context.strokeRect(
      printArea.x + lineWidth / 2,
      printArea.y + lineWidth / 2,
      printArea.w - lineWidth,
      printArea.h - lineWidth,
    );
    context.setLineDash([]);
    context.fillStyle = "#EAC08C";
    const tick = lineWidth * 6;
    const offsets = [
      [printArea.x, printArea.y, 1, 1],
      [printArea.x + printArea.w, printArea.y, -1, 1],
      [printArea.x, printArea.y + printArea.h, 1, -1],
      [printArea.x + printArea.w, printArea.y + printArea.h, -1, -1],
    ];
    for (const [x, y, dx, dy] of offsets) {
      context.fillRect(
        dx > 0 ? x : x - tick,
        dy > 0 ? y : y - lineWidth,
        tick,
        lineWidth,
      );
      context.fillRect(
        dx > 0 ? x : x - lineWidth,
        dy > 0 ? y : y - tick,
        lineWidth,
        tick,
      );
    }
    context.restore();
  }

  context.restore();
}

export async function renderMockupToBlob(
  options: RenderOptions,
  width = 1200,
): Promise<Blob> {
  const { product, colorId, viewId } = options;
  const view = product.views.find((item) => item.id === viewId);
  const color = product.colors.find((item) => item.id === colorId);
  if (!view) throw new Error(`Unknown product view: ${viewId}`);
  if (!color) throw new Error(`Unknown product color: ${colorId}`);

  const sources = [view.baseImage, view.shadingImage, color.imageOverride].filter(
    (source): source is string => Boolean(source),
  );
  await Promise.all(sources.map((source) => loadImage(source)));

  const base = getCachedImage(color.imageOverride ?? view.baseImage);
  const baseSize = getImageSize(base);
  if (!baseSize) throw new Error("The product image is not ready");
  const height = Math.max(1, Math.round((width * baseSize.height) / baseSize.width));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is not available");

  renderMockup(context, {
    ...options,
    size: { width, height },
    showGuides: false,
    pixelRatio: 1,
  });

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
  if (!blob) throw new Error("Could not export the mockup");
  return blob;
}

export const canvasRenderer: MockupRenderer = {
  kind: "canvas",
  render: renderMockup,
  exportPng: renderMockupToBlob,
};

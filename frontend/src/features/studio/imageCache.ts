export type InkMode = "original" | "white";

const imageCache = new Map<string, HTMLImageElement>();
const pendingImages = new Map<string, Promise<HTMLImageElement>>();
const processedLogos = new WeakMap<HTMLImageElement, Map<string, HTMLCanvasElement>>();
const fallbackShading = new WeakMap<object, HTMLCanvasElement>();

function abortError(): Error {
  const error = new Error("Image load aborted");
  error.name = "AbortError";
  return error;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function getCachedImage(src: string): HTMLImageElement | null {
  return imageCache.get(src) ?? null;
}

function withAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(abortError());
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortError());
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}

export function loadImage(src: string, signal?: AbortSignal): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached) return withAbort(Promise.resolve(cached), signal);

  const existing = pendingImages.get(src);
  if (existing) return withAbort(existing, signal);

  if (signal?.aborted) return Promise.reject(abortError());

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    if (/^https?:/i.test(src)) image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => {
      imageCache.set(src, image);
      pendingImages.delete(src);
      resolve(image);
    };
    image.onerror = () => {
      pendingImages.delete(src);
      reject(new Error(`Could not load image: ${src}`));
    };
    image.src = src;
  });

  pendingImages.set(src, promise);
  return withAbort(promise, signal);
}

export async function preloadImages(srcs: string[], signal?: AbortSignal): Promise<void> {
  const unique = Array.from(new Set(srcs.filter(Boolean)));
  await Promise.all(unique.map((src) => loadImage(src, signal)));
}

export function getImageSize(
  source: CanvasImageSource | null | undefined,
): { width: number; height: number } | null {
  if (!source) return null;
  if (source instanceof HTMLImageElement) {
    if (!source.naturalWidth || !source.naturalHeight) return null;
    return { width: source.naturalWidth, height: source.naturalHeight };
  }
  if (source instanceof HTMLCanvasElement) {
    return { width: source.width, height: source.height };
  }
  if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) {
    return { width: source.width, height: source.height };
  }
  if (typeof VideoFrame !== "undefined" && source instanceof VideoFrame) {
    return { width: source.displayWidth, height: source.displayHeight };
  }
  return null;
}

function copyToCanvas(source: CanvasImageSource, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is not available");
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function getProcessedLogo(
  image: HTMLImageElement,
  options: { removeWhite: number; inkMode: InkMode },
): CanvasImageSource {
  const threshold = Math.max(0, Math.min(255, Math.round(options.removeWhite)));
  if (threshold === 0 && options.inkMode === "original") return image;

  let cache = processedLogos.get(image);
  if (!cache) {
    cache = new Map();
    processedLogos.set(image, cache);
  }
  const key = `${threshold}:${options.inkMode}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const size = getImageSize(image);
  if (!size) return image;
  const maximum = 2400;
  const ratio = Math.min(1, maximum / Math.max(size.width, size.height));
  const canvas = copyToCanvas(image, size.width * ratio, size.height * ratio);
  const context = canvas.getContext("2d");
  if (!context) return canvas;

  if (threshold > 0) {
    try {
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = pixels.data;
      const feather = 16;
      for (let index = 0; index < data.length; index += 4) {
        if (data[index + 3] === 0) continue;
        const lightest = Math.min(data[index], data[index + 1], data[index + 2]);
        if (lightest >= threshold) {
          data[index + 3] = 0;
        } else if (lightest > threshold - feather) {
          data[index + 3] = Math.round(
            data[index + 3] * ((threshold - lightest) / feather),
          );
        }
      }
      context.putImageData(pixels, 0, 0);
    } catch {
      // Cross-origin assets cannot be read; keep the original pixels.
    }
  }

  if (options.inkMode === "white") {
    context.globalCompositeOperation = "source-in";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalCompositeOperation = "source-over";
  }

  cache.set(key, canvas);
  return canvas;
}

export function getFallbackShading(source: CanvasImageSource): HTMLCanvasElement | null {
  if (typeof source !== "object" || source === null) return null;
  const cached = fallbackShading.get(source);
  if (cached) return cached;
  const size = getImageSize(source);
  if (!size) return null;

  const maximum = 1600;
  const ratio = Math.min(1, maximum / Math.max(size.width, size.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(size.width * ratio));
  canvas.height = Math.max(1, Math.round(size.height * ratio));
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.filter = "grayscale(1) contrast(1.8) brightness(0.92)";
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  fallbackShading.set(source, canvas);
  return canvas;
}

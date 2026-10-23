import type { DesignTransform, Rect } from "./types";

export const MIN_LOGO_SCALE = 0.05;
export const MAX_LOGO_SCALE = 1;
export const MIN_PRINT_AREA = 0.02;

export interface Size {
  width: number;
  height: number;
}

export interface PixelRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function clampRect(rect: Rect, minSize = MIN_PRINT_AREA): Rect {
  const w = clamp(rect.w, minSize, 1);
  const h = clamp(rect.h, minSize, 1);
  return {
    x: clamp(rect.x, 0, 1 - w),
    y: clamp(rect.y, 0, 1 - h),
    w,
    h,
  };
}

export function getPrintAreaPixels(rect: Rect, size: Size): PixelRect {
  return {
    x: rect.x * size.width,
    y: rect.y * size.height,
    w: rect.w * size.width,
    h: rect.h * size.height,
  };
}

export function getRotatedSize(
  width: number,
  height: number,
  rotation: number,
): { width: number; height: number } {
  const radians = (rotation * Math.PI) / 180;
  const cosine = Math.abs(Math.cos(radians));
  const sine = Math.abs(Math.sin(radians));
  return {
    width: width * cosine + height * sine,
    height: width * sine + height * cosine,
  };
}

export function maxScaleFor(
  logoAspect: number,
  printArea: Pick<PixelRect, "w" | "h">,
  rotation: number,
  upperBound = MAX_LOGO_SCALE,
): number {
  if (printArea.w <= 0 || printArea.h <= 0 || !Number.isFinite(logoAspect)) return 0;
  const radians = (rotation * Math.PI) / 180;
  const cosine = Math.abs(Math.cos(radians));
  const sine = Math.abs(Math.sin(radians));
  const aspect = Math.max(logoAspect, 0.001);
  const widthFactor = cosine + aspect * sine;
  const heightFactor = sine + aspect * cosine;
  const byWidth = 1 / Math.max(widthFactor, 0.0001);
  const byHeight = printArea.h / printArea.w / Math.max(heightFactor, 0.0001);
  return clamp(Math.min(upperBound, byWidth, byHeight), 0, upperBound);
}

export function clampTransform(
  transform: DesignTransform,
  logoAspect: number,
  printArea: Pick<PixelRect, "w" | "h">,
  upperBound = MAX_LOGO_SCALE,
): DesignTransform {
  const maxScale = maxScaleFor(logoAspect, printArea, transform.rotation, upperBound);
  const minScale = Math.min(MIN_LOGO_SCALE, maxScale);
  const scale = clamp(transform.scale, minScale, maxScale);
  const logoWidth = scale * printArea.w;
  const logoHeight = logoWidth * Math.max(logoAspect, 0.001);
  const bounds = getRotatedSize(logoWidth, logoHeight, transform.rotation);
  const halfWidth = bounds.width / printArea.w / 2;
  const halfHeight = bounds.height / printArea.h / 2;
  return {
    ...transform,
    scale,
    x: halfWidth >= 0.5 ? 0.5 : clamp(transform.x, halfWidth, 1 - halfWidth),
    y: halfHeight >= 0.5 ? 0.5 : clamp(transform.y, halfHeight, 1 - halfHeight),
  };
}

export function getDefaultTransform(
  logoAspect: number,
  printArea: Pick<PixelRect, "w" | "h">,
): DesignTransform {
  return clampTransform(
    { x: 0.5, y: 0.5, scale: MAX_LOGO_SCALE, rotation: 0 },
    logoAspect,
    printArea,
  );
}

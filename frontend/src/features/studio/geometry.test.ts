import { describe, expect, it } from "vitest";
import {
  clampRect,
  clampTransform,
  getDefaultTransform,
  getPrintAreaPixels,
  getRotatedSize,
  maxScaleFor,
} from "./geometry";

describe("clampRect", () => {
  it("keeps the rectangle inside the image", () => {
    expect(clampRect({ x: -0.2, y: 0.9, w: 0.4, h: 0.4 })).toEqual({
      x: 0,
      y: 0.6,
      w: 0.4,
      h: 0.4,
    });
  });

  it("enforces the minimum size", () => {
    const rect = clampRect({ x: 0.5, y: 0.5, w: 0.001, h: 0.001 });
    expect(rect.w).toBe(0.02);
    expect(rect.h).toBe(0.02);
  });
});

describe("getPrintAreaPixels", () => {
  it("maps normalized print areas into pixels", () => {
    expect(
      getPrintAreaPixels({ x: 0.1, y: 0.2, w: 0.5, h: 0.6 }, { width: 1000, height: 500 }),
    ).toEqual({ x: 100, y: 100, w: 500, h: 300 });
  });
});

describe("rotated bounds", () => {
  it("swaps width and height at a quarter turn", () => {
    const bounds = getRotatedSize(200, 100, 90);
    expect(bounds.width).toBeCloseTo(100);
    expect(bounds.height).toBeCloseTo(200);
  });

  it("returns the original size at zero rotation", () => {
    const bounds = getRotatedSize(200, 100, 0);
    expect(bounds.width).toBeCloseTo(200);
    expect(bounds.height).toBeCloseTo(100);
  });
});

describe("maxScaleFor", () => {
  it("uses the full width of a square print area for a square logo", () => {
    expect(maxScaleFor(1, { w: 400, h: 400 }, 0)).toBe(1);
  });

  it("shrinks a tall logo so it fits vertically", () => {
    expect(maxScaleFor(4, { w: 400, h: 400 }, 0)).toBeCloseTo(0.25);
  });

  it("reduces the available scale when the logo is rotated", () => {
    expect(maxScaleFor(1, { w: 400, h: 400 }, 45)).toBeLessThan(1);
  });
});

describe("clampTransform", () => {
  const printArea = { w: 400, h: 400 };

  it("centers a default logo at full width", () => {
    const transform = getDefaultTransform(1, printArea);
    expect(transform.x).toBe(0.5);
    expect(transform.y).toBe(0.5);
    expect(transform.scale).toBe(1);
  });

  it("keeps a rotated logo inside the print area", () => {
    const transform = clampTransform(
      { x: 0.02, y: 0.98, scale: 1, rotation: 35 },
      2,
      printArea,
    );
    expect(transform.x).toBeGreaterThan(0.02);
    expect(transform.y).toBeLessThan(0.98);
    expect(transform.x).toBeGreaterThan(0);
    expect(transform.x).toBeLessThan(1);
    expect(transform.y).toBeGreaterThan(0);
    expect(transform.y).toBeLessThan(1);
  });

  it("clamps scale into the allowed range", () => {
    expect(clampTransform({ x: 0.5, y: 0.5, scale: 9, rotation: 0 }, 1, printArea).scale).toBe(1);
    expect(clampTransform({ x: 0.5, y: 0.5, scale: 0.001, rotation: 0 }, 1, printArea).scale).toBe(
      0.05,
    );
  });
});

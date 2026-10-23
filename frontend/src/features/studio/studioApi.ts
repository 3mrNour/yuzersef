import { mockProducts } from "./mockProducts";
import type { Product, ProductColor, ProductView, Rect } from "./types";

export class ProductValidationError extends Error {
  readonly path: string;

  constructor(path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = "ProductValidationError";
    this.path = path;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: Record<string, unknown>, key: string, path: string): string {
  const field = value[key];
  if (typeof field !== "string" || field.trim().length === 0) {
    throw new ProductValidationError(`${path}.${key}`, "must be a non-empty string");
  }
  return field;
}

function readOptionalString(
  value: Record<string, unknown>,
  key: string,
  path: string,
): string | undefined {
  const field = value[key];
  if (field === undefined) return undefined;
  if (typeof field !== "string" || field.trim().length === 0) {
    throw new ProductValidationError(`${path}.${key}`, "must be a non-empty string");
  }
  return field;
}

function validateRect(value: unknown, path: string): Rect {
  if (!isRecord(value)) throw new ProductValidationError(path, "must be a rectangle object");
  const rect = {
    x: Number(value.x),
    y: Number(value.y),
    w: Number(value.w),
    h: Number(value.h),
  };
  for (const [key, number] of Object.entries(rect)) {
    if (!Number.isFinite(number)) {
      throw new ProductValidationError(`${path}.${key}`, "must be a finite number");
    }
  }
  if (rect.w <= 0 || rect.h <= 0) {
    throw new ProductValidationError(path, "width and height must be greater than zero");
  }
  if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > 1.0001 || rect.y + rect.h > 1.0001) {
    throw new ProductValidationError(path, "must stay inside the normalized 0..1 image bounds");
  }
  return rect;
}

function validateColor(value: unknown, path: string): ProductColor {
  if (!isRecord(value)) throw new ProductValidationError(path, "must be a color object");
  const id = readString(value, "id", path);
  const name = readString(value, "name", path);
  const hex = readString(value, "hex", path);
  if (!/^#[0-9a-f]{6}$/i.test(hex)) {
    throw new ProductValidationError(`${path}.hex`, "must be a six digit hex color");
  }
  const imageOverride = readOptionalString(value, "imageOverride", path);
  return { id, name, hex, ...(imageOverride ? { imageOverride } : {}) };
}

function validateView(value: unknown, path: string): ProductView {
  if (!isRecord(value)) throw new ProductValidationError(path, "must be a view object");
  const id = readString(value, "id", path);
  const label = readString(value, "label", path);
  const baseImage = readString(value, "baseImage", path);
  const shadingImage = readOptionalString(value, "shadingImage", path);
  const printArea = validateRect(value.printArea, `${path}.printArea`);
  const wrap = value.wrap;
  if (wrap !== undefined && wrap !== "none" && wrap !== "cylinder") {
    throw new ProductValidationError(`${path}.wrap`, 'must be "none" or "cylinder"');
  }
  return {
    id,
    label,
    baseImage,
    ...(shadingImage ? { shadingImage } : {}),
    printArea,
    ...(wrap ? { wrap } : {}),
  };
}

function validateStringList(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) throw new ProductValidationError(path, "must be an array");
  return value.map((item, index) => {
    if (typeof item !== "string" || item.trim().length === 0) {
      throw new ProductValidationError(`${path}[${index}]`, "must be a non-empty string");
    }
    return item;
  });
}

function assertUnique(ids: string[], path: string): void {
  if (new Set(ids).size !== ids.length) {
    throw new ProductValidationError(path, "ids must be unique");
  }
}

export function validateProduct(input: unknown): Product {
  if (!isRecord(input)) throw new ProductValidationError("product", "must be an object");
  const _id = readString(input, "_id", "product");
  const name = readString(input, "name", "product");
  const category = readString(input, "category", "product");

  if (!Array.isArray(input.colors) || input.colors.length === 0) {
    throw new ProductValidationError("product.colors", "must contain at least one color");
  }
  if (!Array.isArray(input.views) || input.views.length === 0) {
    throw new ProductValidationError("product.views", "must contain at least one view");
  }

  const colors = input.colors.map((color, index) =>
    validateColor(color, `product.colors[${index}]`),
  );
  const views = input.views.map((view, index) => validateView(view, `product.views[${index}]`));
  assertUnique(
    colors.map((color) => color.id),
    "product.colors",
  );
  assertUnique(
    views.map((view) => view.id),
    "product.views",
  );

  let options: Product["options"];
  if (input.options !== undefined) {
    if (!isRecord(input.options)) {
      throw new ProductValidationError("product.options", "must be an object");
    }
    const sizes =
      input.options.sizes === undefined
        ? undefined
        : validateStringList(input.options.sizes, "product.options.sizes");
    const printPositions =
      input.options.printPositions === undefined
        ? undefined
        : validateStringList(input.options.printPositions, "product.options.printPositions");
    options = { ...(sizes ? { sizes } : {}), ...(printPositions ? { printPositions } : {}) };
  }

  return { _id, name, category, colors, views, ...(options ? { options } : {}) };
}

export function validateProducts(input: unknown): Product[] {
  if (!Array.isArray(input)) {
    throw new ProductValidationError("products", "must be an array");
  }
  return input.map((product) => validateProduct(product));
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export async function listProducts(): Promise<Product[]> {
  await wait(180);
  return validateProducts(mockProducts);
}

export async function getProduct(id: string): Promise<Product | null> {
  const products = await listProducts();
  return products.find((product) => product._id === id) ?? null;
}

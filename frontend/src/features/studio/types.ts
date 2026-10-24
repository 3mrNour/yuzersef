export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  imageOverride?: string;
}

export interface ProductView {
  id: string;
  label: string;
  baseImage: string;
  shadingImage?: string;
  printArea: Rect;
  wrap?: "none" | "cylinder";
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  colors: ProductColor[];
  views: ProductView[];
  options?: {
    sizes?: string[];
    printPositions?: string[];
    styles?: string[];
  };
}

export interface DesignTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface DesignState {
  productId: string;
  colorId: string;
  viewId: string;
  styleId?: string;
  logoFileName?: string;
  logoDataUrl?: string;
  printPlacement?: "front" | "back" | "left-sleeve" | "right-sleeve" | "custom";
  transform: DesignTransform;
  previewUrl?: string;
}

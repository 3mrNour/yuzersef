export type Studio3DZone = "front" | "back" | "left-sleeve" | "right-sleeve";

export interface Studio3DDecal {
  position: [number, number, number];
  normal: [number, number, number];
  scale: number;
  spin: number;
}

export interface Studio3DFace {
  imageDataUrl: string;
  aspect: number;
}

export interface Studio3DDesign {
  version: 1;
  tintHex: string;
  sheetDataUrl: string;
  faces: Partial<Record<Studio3DZone, Studio3DFace>>;
  decals: Partial<Record<Studio3DZone, Studio3DDecal>>;
}

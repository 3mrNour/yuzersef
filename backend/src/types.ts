import { randomInt } from "node:crypto";

export const SERVICE_SLUGS = ["clothing", "mugs", "caps", "stickers", "cases"] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export const REQUEST_STATUSES = ["received", "review", "confirmed", "closed"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export const PRINT_PLACEMENTS = ["front", "back", "left-sleeve", "right-sleeve", "custom"] as const;
export type PrintPlacement = (typeof PRINT_PLACEMENTS)[number];

export interface RequestItem {
  productId: string;
  productName: string;
  size: string;
  color: string;
  style: string;
  specialRequest: string;
  printPlacement?: PrintPlacement;
}

export interface PrintRequest {
  id: string;
  userId: string;
  code: string;
  name: string;
  phone: string;
  service: ServiceSlug;
  quantity: number;
  details: string;
  items: RequestItem[];
  artworkUrl?: string;
  designPreviewUrl?: string;
  designFileName?: string;
  logoDataUrl?: string;
  studio3d?: Studio3DRequest;
  status: RequestStatus;
  createdAt: string;
}

export interface Studio3DRequest {
  version: 1;
  tintHex: string;
  sheetDataUrl: string;
  faces: Partial<Record<"front" | "back" | "left-sleeve" | "right-sleeve", {
    imageDataUrl: string;
    aspect: number;
  }>>;
  decals: Partial<Record<"front" | "back" | "left-sleeve" | "right-sleeve", {
    position: [number, number, number];
    normal: [number, number, number];
    scale: number;
    spin: number;
  }>>;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  message: string;
  createdAt: string;
}

export function createCode(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i += 1) suffix += alphabet[randomInt(alphabet.length)];
  return `YZ-${yy}${mm}-${suffix}`;
}

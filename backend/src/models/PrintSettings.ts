import { Schema, model } from "mongoose";
import type { PrintPlacement, ServiceSlug } from "../types.js";

export type PrintPlacementSettings = Record<ServiceSlug, PrintPlacement[]>;
export interface PrintPlacementProfile {
  productId: string;
  service: ServiceSlug;
  productName: string;
  placements: PrintPlacement[];
  guidance: string;
}

export const defaultPrintPlacementSettings: PrintPlacementSettings = {
  clothing: ["front", "back", "left-sleeve", "right-sleeve", "custom"],
  mugs: ["front", "back", "custom"],
  caps: ["front", "back", "left-sleeve", "right-sleeve", "custom"],
  stickers: ["front", "back", "custom"],
  cases: ["front", "back", "custom"],
};

export const defaultPrintPlacementProfiles: Record<string, PrintPlacementProfile> = {
  "tee-classic": {
    productId: "tee-classic",
    service: "clothing",
    productName: "Classic Tee",
    placements: ["front", "back", "left-sleeve", "right-sleeve", "custom"],
    guidance: "Front and back body prints; sleeves are optional production positions.",
  },
  "mug-classic": {
    productId: "mug-classic",
    service: "mugs",
    productName: "Classic Mug",
    placements: ["front", "back", "custom"],
    guidance: "Use the front or back panel; sleeve positions are not applicable to mugs.",
  },
  "cap-classic": {
    productId: "cap-classic",
    service: "caps",
    productName: "Classic Cap",
    placements: ["front", "back", "custom"],
    guidance: "Front panel is recommended; back embroidery/print is also available.",
  },
};

const printSettingsSchema = new Schema(
  {
    key: { type: String, unique: true, required: true, default: "default" },
    placements: {
      type: Map,
      of: [{ type: String, enum: ["front", "back", "left-sleeve", "right-sleeve", "custom"] }],
      required: true,
    },
    profiles: {
      type: Map,
      of: {
        productId: String,
        service: String,
        productName: String,
        placements: [{ type: String, enum: ["front", "back", "left-sleeve", "right-sleeve", "custom"] }],
        guidance: String,
      },
      required: true,
    },
  },
  { versionKey: false },
);

export const PrintSettingsModel = model("PrintSettings", printSettingsSchema);

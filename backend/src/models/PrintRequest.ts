import { Schema, model, type HydratedDocument } from "mongoose";
import type { PrintRequest, RequestStatus, ServiceSlug } from "../types.js";

export type PrintRequestDocument = HydratedDocument<PrintRequest>;

const printRequestSchema = new Schema<PrintRequest>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    service: { type: String, required: true, enum: ["clothing", "mugs", "caps", "stickers", "cases"] },
    quantity: { type: Number, required: true, min: 1, max: 500 },
    details: { type: String, required: true, maxlength: 1200, default: "" },
    items: {
      type: [
        {
          productId: { type: String, required: true, maxlength: 80 },
          productName: { type: String, required: true, maxlength: 120 },
          size: { type: String, required: true, maxlength: 20 },
          color: { type: String, required: true, maxlength: 60 },
          style: { type: String, required: true, maxlength: 120 },
          specialRequest: { type: String, required: false, default: "", maxlength: 500 },
          printPlacement: { type: String, enum: ["front", "back", "left-sleeve", "right-sleeve", "custom"], default: "front" },
        },
      ],
      required: true,
      validate: {
        validator: (items: unknown[]) => items.length >= 1 && items.length <= 500,
        message: "A request must contain between 1 and 500 items",
      },
    },
    artworkUrl: { type: String, maxlength: 500 },
    designPreviewUrl: { type: String, maxlength: 8_000_000 },
    designFileName: { type: String, maxlength: 200 },
    logoDataUrl: { type: String, maxlength: 7_000_000 },
    studio3d: {
      type: Schema.Types.Mixed,
      validate: {
        validator: (value: unknown) => value === undefined || JSON.stringify(value).length <= 8_000_000,
        message: "studio3d payload is too large",
      },
    },
    status: { type: String, required: true, enum: ["received", "review", "confirmed", "closed"], default: "received" },
    createdAt: { type: String, required: true },
  },
  { versionKey: false },
);

printRequestSchema.index({ createdAt: -1 });

export const PrintRequestModel = model<PrintRequest>("PrintRequest", printRequestSchema);

export function toPrintRequest(document: PrintRequestDocument): PrintRequest {
  return document.toObject() as PrintRequest;
}

export type PrintRequestInput = {
  id: string;
  code: string;
  name: string;
  phone: string;
  service: ServiceSlug;
  quantity: number;
  details: string;
  items: PrintRequest["items"];
  artworkUrl?: string;
  status: RequestStatus;
  createdAt: string;
};

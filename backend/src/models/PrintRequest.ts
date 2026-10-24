import { Schema, model, type HydratedDocument } from "mongoose";
import type { PrintRequest, RequestStatus, ServiceSlug } from "../types.js";

export type PrintRequestDocument = HydratedDocument<PrintRequest>;

const printRequestSchema = new Schema<PrintRequest>(
  {
    id: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    service: { type: String, required: true, enum: ["clothing", "mugs", "caps", "stickers", "cases"] },
    quantity: { type: Number, required: true, min: 1, max: 500 },
    details: { type: String, required: true, maxlength: 1200 },
    artworkUrl: { type: String, maxlength: 500 },
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
  artworkUrl?: string;
  status: RequestStatus;
  createdAt: string;
};

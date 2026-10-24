import { Schema, model, type HydratedDocument } from "mongoose";
import type { ContactMessage } from "../types.js";

export type ContactMessageDocument = HydratedDocument<ContactMessage>;

const contactMessageSchema = new Schema<ContactMessage>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    message: { type: String, required: true, maxlength: 1200 },
    createdAt: { type: String, required: true },
  },
  { versionKey: false },
);

contactMessageSchema.index({ createdAt: -1 });

export const ContactMessageModel = model<ContactMessage>("ContactMessage", contactMessageSchema);

export function toContactMessage(document: ContactMessageDocument): ContactMessage {
  return document.toObject() as ContactMessage;
}

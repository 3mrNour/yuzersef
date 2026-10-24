import { Schema, model } from "mongoose";
import type { ServiceSlug } from "../types.js";

export interface PortfolioItem {
  id: string;
  category: ServiceSlug;
  titleAr: string;
  titleEn: string;
  altAr: string;
  altEn: string;
  image: string;
  sortOrder: number;
  active: boolean;
}

const portfolioItemSchema = new Schema<PortfolioItem>(
  {
    id: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, enum: ["clothing", "mugs", "caps", "stickers", "cases"] },
    titleAr: { type: String, required: true, trim: true, maxlength: 120 },
    titleEn: { type: String, required: true, trim: true, maxlength: 120 },
    altAr: { type: String, required: true, trim: true, maxlength: 180 },
    altEn: { type: String, required: true, trim: true, maxlength: 180 },
    image: { type: String, required: true, trim: true, maxlength: 2000 },
    sortOrder: { type: Number, required: true, default: 0 },
    active: { type: Boolean, required: true, default: true },
  },
  { versionKey: false },
);

portfolioItemSchema.index({ active: 1, sortOrder: 1 });

export const PortfolioItemModel = model<PortfolioItem>("PortfolioItem", portfolioItemSchema);

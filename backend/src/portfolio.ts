import type { PortfolioItem } from "./models/PortfolioItem.js";

export const defaultPortfolioItems: PortfolioItem[] = [
  ["tee-halftone", "clothing", "تيشيرت", "T-shirt", "تيشيرت مطبوع", "Printed t-shirt", "/mock/tshirt.jpg"],
  ["mug-wave", "mugs", "مج", "Mug", "مج مطبوع", "Printed mug", "/mock/mug.jpg"],
  ["cap-dots", "caps", "كاب", "Cap", "كاب مطبوع", "Printed cap", "/mock/ccap.jpg"],
  ["case-grid", "cases", "شنطة", "Tote bag", "شنطة مطبوعة", "Printed tote bag", "/mock/tote-bag.jpg"],
].map(([id, category, titleAr, titleEn, altAr, altEn, image], sortOrder) => ({
  id,
  category: category as PortfolioItem["category"],
  titleAr,
  titleEn,
  altAr,
  altEn,
  image,
  sortOrder,
  active: true,
}));

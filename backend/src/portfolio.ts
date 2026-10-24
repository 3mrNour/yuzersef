import type { PortfolioItem } from "./models/PortfolioItem.js";

export const defaultPortfolioItems: PortfolioItem[] = [
  ["tee-halftone", "clothing", "تيشيرت هاف تون", "Halftone tee", "نموذج تيشيرت بنقشة نقاط", "Demo t-shirt with a halftone print", "/portfolio/clothing-tee-halftone.svg"],
  ["hoodie-arches", "clothing", "هودي بخطوط", "Arched hoodie", "نموذج هودي بنقشة أقواس", "Demo hoodie with an arch print", "/portfolio/clothing-hoodie-arches.svg"],
  ["mug-wave", "mugs", "مج بموج", "Wave mug", "نموذج مج بنقشة موج", "Demo mug with a wave print", "/portfolio/mugs-wave.svg"],
  ["mug-sun", "mugs", "مج شمس", "Sun mug", "نموذج مج بنقشة شمس", "Demo mug with a sun print", "/portfolio/mugs-sun.svg"],
  ["cap-dots", "caps", "كاب نقاط", "Dot cap", "نموذج كاب بنقطة", "Demo cap with a dot print", "/portfolio/caps-dots.svg"],
  ["cap-stripes", "caps", "كاب خطوط", "Striped cap", "نموذج كاب بخطوط", "Demo cap with stripes", "/portfolio/caps-stripes.svg"],
  ["sticker-sheet", "stickers", "ورقة ستيكرز", "Sticker sheet", "نموذج ورقة ستيكرز", "Demo sticker sheet", "/portfolio/stickers-sheet.svg"],
  ["sticker-badge", "stickers", "ستيكر دايرة", "Round sticker", "نموذج ستيكر دائري", "Demo round sticker", "/portfolio/stickers-badge.svg"],
  ["case-grid", "cases", "جراب شبكة", "Grid case", "نموذج جراب بشبكة", "Demo phone case with a grid print", "/portfolio/cases-grid.svg"],
  ["case-arc", "cases", "جراب قوس", "Arc case", "نموذج جراب بأقواس", "Demo phone case with arc lines", "/portfolio/cases-arc.svg"],
].map(([id, category, titleAr, titleEn, altAr, altEn, image], sortOrder) => ({
  id, category: category as PortfolioItem["category"], titleAr, titleEn, altAr, altEn, image, sortOrder, active: true,
}));

import type { PortfolioItem } from "./models/PortfolioItem.js";

export const defaultPortfolioItems: PortfolioItem[] = [
  ["tee-halftone", "clothing", "تيشيرت هاف تون", "Halftone tee", "نموذج تيشيرت بنقشة نقاط", "Demo t-shirt with a halftone print", "/mock/tshirt.jpg"],
  ["hoodie-arches", "clothing", "هودي بخطوط", "Arched hoodie", "نموذج هودي بنقشة أقواس", "Demo hoodie with an arch print", "/mock/tee-front.svg"],
  ["mug-wave", "mugs", "مج بموج", "Wave mug", "نموذج مج بنقشة موج", "Demo mug with a wave print", "/mock/mug.jpg"],
  ["mug-sun", "mugs", "مج شمس", "Sun mug", "نموذج مج بنقشة شمس", "Demo mug with a sun print", "/mock/mug-side.svg"],
  ["cap-dots", "caps", "كاب نقاط", "Dot cap", "نموذج كاب بنقطة", "Demo cap with a dot print", "/mock/ccap.jpg"],
  ["cap-stripes", "caps", "كاب خطوط", "Striped cap", "نموذج كاب بخطوط", "Demo cap with stripes", "/mock/cap-front.svg"],
  ["sticker-sheet", "stickers", "ورقة ستيكرز", "Sticker sheet", "نموذج ورقة ستيكرز", "Demo sticker sheet", "/mock/studio-preview.svg"],
  ["sticker-badge", "stickers", "ستيكر دايرة", "Round sticker", "نموذج ستيكر دائري", "Demo round sticker", "/mock/studio-preview.svg"],
  ["case-grid", "cases", "جراب شبكة", "Grid case", "نموذج جراب بشبكة", "Demo phone case with a grid print", "/mock/tote-bag.jpg"],
  ["case-arc", "cases", "جراب قوس", "Arc case", "نموذج جراب بأقواس", "Demo phone case with arc lines", "/mock/tee-back.svg"],
].map(([id, category, titleAr, titleEn, altAr, altEn, image], sortOrder) => ({
  id, category: category as PortfolioItem["category"], titleAr, titleEn, altAr, altEn, image, sortOrder, active: true,
}));

import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { PortfolioItemModel } from "../models/PortfolioItem.js";
import { defaultPortfolioItems } from "../portfolio.js";
import { SERVICE_SLUGS } from "../types.js";

const itemSchema = z.object({
  category: z.enum(SERVICE_SLUGS),
  titleAr: z.string().trim().min(1).max(120),
  titleEn: z.string().trim().min(1).max(120),
  altAr: z.string().trim().min(1).max(180),
  altEn: z.string().trim().min(1).max(180),
  image: z.string().trim().min(1).max(2000),
  sortOrder: z.coerce.number().int().min(0).max(10000),
  active: z.boolean().default(true),
});

export const portfolioRouter = Router();

portfolioRouter.get("/", async (_req, res) => {
  let items = await PortfolioItemModel.find({ active: true }).sort({ sortOrder: 1 }).lean().exec();
  if (!items.length && (await PortfolioItemModel.countDocuments().exec()) === 0) {
    await PortfolioItemModel.insertMany(defaultPortfolioItems, { ordered: false });
    items = await PortfolioItemModel.find({ active: true }).sort({ sortOrder: 1 }).lean().exec();
  }
  res.json({ items });
});

export const adminPortfolioRouter = Router();

adminPortfolioRouter.get("/", async (_req, res) => {
  const items = await PortfolioItemModel.find().sort({ sortOrder: 1, id: 1 }).lean().exec();
  res.json({ items });
});

adminPortfolioRouter.post("/", async (req, res) => {
  const input = itemSchema.parse(req.body);
  const item = await PortfolioItemModel.create({ ...input, id: randomUUID() });
  res.status(201).json({ item });
});

adminPortfolioRouter.patch("/:id", async (req, res) => {
  const input = itemSchema.partial().parse(req.body);
  const item = await PortfolioItemModel.findOneAndUpdate({ id: req.params.id }, { $set: input }, { new: true, runValidators: true }).lean().exec();
  if (!item) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json({ item });
});

adminPortfolioRouter.delete("/:id", async (req, res) => {
  const result = await PortfolioItemModel.deleteOne({ id: req.params.id }).exec();
  if (!result.deletedCount) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.status(204).end();
});

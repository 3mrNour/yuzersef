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

async function removeDuplicateMockItems(): Promise<void> {
  const items = await PortfolioItemModel.find({ image: /^\/mock\// })
    .sort({ sortOrder: 1, id: 1 })
    .select({ _id: 1, image: 1 })
    .lean()
    .exec();
  const seen = new Set<string>();
  const duplicateIds = items
    .filter((item) => {
      if (seen.has(item.image)) return true;
      seen.add(item.image);
      return false;
    })
    .map((item) => item._id);
  if (duplicateIds.length) {
    await PortfolioItemModel.deleteMany({ _id: { $in: duplicateIds } }).exec();
  }
}

export const portfolioRouter = Router();

portfolioRouter.get("/", async (_req, res) => {
  await removeDuplicateMockItems();
  await PortfolioItemModel.bulkWrite(
    defaultPortfolioItems.map((item) => ({
      updateOne: {
        filter: { id: item.id, image: { $regex: /(\.svg$|^\/portfolio\/)/ } },
        update: { $set: { image: item.image } },
      },
    })),
    { ordered: false },
  );
  let items = await PortfolioItemModel.find({ active: true }).sort({ sortOrder: 1 }).lean().exec();
  if (!items.length && (await PortfolioItemModel.countDocuments().exec()) === 0) {
    await PortfolioItemModel.insertMany(defaultPortfolioItems, { ordered: false });
    items = await PortfolioItemModel.find({ active: true }).sort({ sortOrder: 1 }).lean().exec();
  }
  res.json({ items });
});

export const adminPortfolioRouter = Router();

adminPortfolioRouter.get("/", async (_req, res) => {
  await removeDuplicateMockItems();
  const items = await PortfolioItemModel.find().sort({ sortOrder: 1, id: 1 }).lean().exec();
  res.json({ items });
});

adminPortfolioRouter.post("/", async (req, res) => {
  const input = itemSchema.parse(req.body);
  if (await PortfolioItemModel.exists({ image: input.image })) {
    res.status(409).json({ error: "duplicate_image" });
    return;
  }
  const item = await PortfolioItemModel.create({ ...input, id: randomUUID() });
  res.status(201).json({ item });
});

adminPortfolioRouter.patch("/:id", async (req, res) => {
  const input = itemSchema.partial().parse(req.body);
  if (input.image && await PortfolioItemModel.exists({ image: input.image, id: { $ne: req.params.id } })) {
    res.status(409).json({ error: "duplicate_image" });
    return;
  }
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

import { timingSafeEqual } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { ContactMessageModel } from "../models/ContactMessage.js";
import { PrintRequestModel } from "../models/PrintRequest.js";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

const statusSchema = z.object({
  status: z.enum(["received", "review", "confirmed", "closed"]),
});

export function isAuthorized(requestKey: string | undefined, configuredKey: string | undefined): boolean {
  if (!requestKey || !configuredKey) return false;
  const requestBuffer = Buffer.from(requestKey);
  const configuredBuffer = Buffer.from(configuredKey);
  return requestBuffer.length === configuredBuffer.length && timingSafeEqual(requestBuffer, configuredBuffer);
}

export function createAdminRouter(adminApiKey: string | undefined): Router {
  const router = Router();

  router.use((req, res, next) => {
    if (!isAuthorized(req.header("x-admin-api-key"), adminApiKey)) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    next();
  });

  router.get("/requests", async (req, res) => {
    const { page, limit } = paginationSchema.parse(req.query);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      PrintRequestModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      PrintRequestModel.countDocuments().exec(),
    ]);
    res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
  });

  router.patch("/requests/:id/status", async (req, res) => {
    const { status } = statusSchema.parse(req.body);
    const request = await PrintRequestModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { status } },
      { new: true, runValidators: true },
    ).exec();
    if (!request) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ id: request.id, code: request.code, status: request.status });
  });

  router.get("/contacts", async (req, res) => {
    const { page, limit } = paginationSchema.parse(req.query);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      ContactMessageModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      ContactMessageModel.countDocuments().exec(),
    ]);
    res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
  });

  return router;
}

import { timingSafeEqual } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { ContactMessageModel } from "../models/ContactMessage.js";
import { PrintRequestModel } from "../models/PrintRequest.js";
import { defaultPrintPlacementProfiles, defaultPrintPlacementSettings, PrintSettingsModel } from "../models/PrintSettings.js";
import { PRINT_PLACEMENTS, SERVICE_SLUGS } from "../types.js";
import { UserModel } from "../models/User.js";

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
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const filter = status ? statusSchema.safeParse({ status }) : { success: true as const, data: undefined };
    if (!filter.success) {
      res.status(400).json({ error: "invalid_status" });
      return;
    }
    const query = filter.data ? { status: filter.data.status } : {};
    const [records, total] = await Promise.all([
      PrintRequestModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      PrintRequestModel.countDocuments(query).exec(),
    ]);
    const items = records.map((record) => ({
      ...record,
      items: Array.isArray(record.items) ? record.items : [],
    }));
    res.json({ items, page, limit, total, pages: Math.ceil(total / limit), status: filter.data?.status ?? "all" });
  });

  router.get("/summary", async (_req, res) => {
    const [totalRequests, totalContacts, groupedStatuses, latestRequest, latestContact] =
      await Promise.all([
        PrintRequestModel.countDocuments().exec(),
        ContactMessageModel.countDocuments().exec(),
        PrintRequestModel.aggregate<{ _id: string; count: number }>([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]).exec(),
        PrintRequestModel.findOne().sort({ createdAt: -1 }).select("code createdAt").lean().exec(),
        ContactMessageModel.findOne().sort({ createdAt: -1 }).select("createdAt").lean().exec(),
      ]);

    const statuses = { received: 0, review: 0, confirmed: 0, closed: 0 };
    for (const group of groupedStatuses) {
      if (group._id in statuses) statuses[group._id as keyof typeof statuses] = group.count;
    }
    res.json({
      totalRequests,
      totalContacts,
      statuses,
      latestRequestAt: latestRequest?.createdAt ?? null,
      latestRequestCode: latestRequest?.code ?? null,
      latestContactAt: latestContact?.createdAt ?? null,
    });

  });

  router.get("/print-settings", async (_req, res) => {
    const settings = await PrintSettingsModel.findOneAndUpdate(
      { key: "default" },
      { $setOnInsert: { key: "default", placements: defaultPrintPlacementSettings, profiles: defaultPrintPlacementProfiles } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean({ flattenMaps: true }).exec();
    res.json({ placements: settings?.placements ?? defaultPrintPlacementSettings, profiles: settings?.profiles ?? defaultPrintPlacementProfiles });
  });

  router.patch("/print-settings", async (req, res) => {
    const placements = z.record(
      z.enum(SERVICE_SLUGS),
      z.array(z.enum(PRINT_PLACEMENTS)).min(1),
    ).parse(req.body.placements);
    const profiles = z.record(z.string().min(1), z.object({
      productId: z.string().min(1),
      service: z.enum(SERVICE_SLUGS),
      productName: z.string().min(1),
      placements: z.array(z.enum(PRINT_PLACEMENTS)).min(1),
      guidance: z.string().max(300),
    })).parse(req.body.profiles);
    for (const profile of Object.values(profiles)) {
      if (profile.placements.some((placement) => !placements[profile.service].includes(placement))) {
        res.status(400).json({ error: "profile_placement_not_allowed", productId: profile.productId });
        return;
      }
    }
    const settings = await PrintSettingsModel.findOneAndUpdate(
      { key: "default" },
      { $set: { placements, profiles } },
      { upsert: true, new: true, runValidators: true },
    ).lean({ flattenMaps: true }).exec();
    res.json({ placements: settings?.placements ?? placements, profiles: settings?.profiles ?? profiles });
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

  router.patch("/requests/:id/items/:itemIndex/placement", async (req, res) => {
    const itemIndex = Number(req.params.itemIndex);
    const { placement } = z.object({
      placement: z.enum(["front", "back", "left-sleeve", "right-sleeve", "custom"]),
    }).parse(req.body);
    if (!Number.isInteger(itemIndex) || itemIndex < 0) {
      res.status(400).json({ error: "invalid_item_index" });
      return;
    }
    const request = await PrintRequestModel.findOne({ id: req.params.id }).exec();
    if (!request || !request.items[itemIndex]) {
      res.status(404).json({ error: "item_not_found" });
      return;
    }
    request.items[itemIndex].printPlacement = placement;
    await request.save();
    res.json({ id: request.id, itemIndex, placement });
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

  router.get("/customers", async (req, res) => {
    const { page, limit } = paginationSchema.parse(req.query);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      UserModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).select("id name email emailVerifiedAt offerNote createdAt").lean().exec(),
      UserModel.countDocuments().exec(),
    ]);
    res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
  });

  router.patch("/customers/:id/offer", async (req, res) => {
    const { offerNote } = z.object({ offerNote: z.string().trim().max(1000) }).parse(req.body);
    const user = await UserModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { offerNote } },
      { new: true, runValidators: true },
    ).select("id name email emailVerifiedAt offerNote createdAt").lean().exec();
    if (!user) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ customer: user });
  });

  return router;
}

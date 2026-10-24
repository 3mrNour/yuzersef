import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { PrintRequestModel, toPrintRequest } from "../models/PrintRequest.js";
import { createCode, SERVICE_SLUGS } from "../types.js";
import { phoneSchema } from "../validation.js";
import { defaultPrintPlacementProfiles, defaultPrintPlacementSettings, PrintSettingsModel } from "../models/PrintSettings.js";
import { requireUser, type AuthenticatedRequest } from "../auth.js";

export const requestSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    phone: phoneSchema,
    service: z.enum(SERVICE_SLUGS),
    quantity: z.coerce.number().int().min(1).max(500),
    items: z.array(
      z.object({
        productId: z.string().trim().min(1).max(80),
        productName: z.string().trim().min(1).max(120),
        size: z.string().trim().min(1).max(20),
        color: z.string().trim().min(1).max(60),
        style: z.string().trim().min(1).max(120),
        specialRequest: z.string().trim().max(500).default(""),
        printPlacement: z.enum(["front", "back", "left-sleeve", "right-sleeve", "custom"]).default("front"),
      }),
    ).min(1).max(500),
    details: z.string().trim().max(1200).default(""),
    artworkUrl: z
    .string()
    .trim()
    .max(500)
    .refine((value) => value === "" || /^https?:\/\/\S+$/i.test(value), {
      message: "artworkUrl must be an http(s) link",
    })
    .optional()
    .default(""),
    designPreviewUrl: z.string().max(8_000_000).refine((value) => value.startsWith("data:image/"), {
      message: "designPreviewUrl must be an image data URL",
    }).optional(),
    designFileName: z.string().trim().max(200).optional(),
    logoDataUrl: z.string().max(7_000_000).refine((value) => value.startsWith("data:image/"), {
      message: "logoDataUrl must be an image data URL",
    }).optional(),
  })
  .superRefine((value, context) => {
    if (value.items.length !== value.quantity) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: "quantity must match the number of items",
      });
    }
  });

export const requestsRouter = Router();

requestsRouter.post("/", requireUser, async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const input = requestSchema.parse(req.body);
  const settings = await PrintSettingsModel.findOne({ key: "default" }).lean({ flattenMaps: true }).exec();
  const placements = (settings?.placements ?? defaultPrintPlacementSettings) as Record<string, string[]>;
  const profiles = (settings?.profiles ?? defaultPrintPlacementProfiles) as Record<string, { service: string; placements: string[] }>;
  for (const [index, item] of input.items.entries()) {
    const profile = profiles[item.productId];
    if (profile && profile.service !== input.service) {
      res.status(400).json({ error: "product_service_mismatch", itemIndex: index });
      return;
    }
    const allowed = profile?.placements ?? placements[input.service] ?? defaultPrintPlacementSettings[input.service];
    if (!allowed.includes(item.printPlacement)) {
      res.status(400).json({ error: "placement_not_available", itemIndex: index });
      return;
    }
  }
  let created;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      created = await PrintRequestModel.create({
        id: randomUUID(),
        userId: user.id,
        code: createCode(),
        ...input,
        status: "received",
        createdAt: new Date().toISOString(),
      });
      break;
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("duplicate key")) throw error;
    }
  }

  if (!created) throw new Error("Could not generate a unique request code");
  const request = toPrintRequest(created);
  res.status(201).json({
    code: request.code,
    status: request.status,
    service: request.service,
    createdAt: request.createdAt,
  });
});

requestsRouter.get("/:code", requireUser, async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const code = String(req.params.code ?? "").trim().toUpperCase();
  if (code.length < 4 || code.length > 40) {
    res.status(400).json({ error: "invalid_code" });
    return;
  }

  const request = await PrintRequestModel.findOne({ code, userId: user.id }).exec();
  if (!request) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  const publicRequest = toPrintRequest(request);
  res.json({
    code: publicRequest.code,
    status: publicRequest.status,
    service: publicRequest.service,
    quantity: publicRequest.quantity,
    items: publicRequest.items,
    createdAt: publicRequest.createdAt,
  });

  requestsRouter.get("/", requireUser, async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const requests = await PrintRequestModel.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(100)
      .select("code status service quantity items createdAt")
      .lean()
      .exec();
    res.json({ items: requests });
  });
});

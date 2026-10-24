import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { PrintRequestModel, toPrintRequest } from "../models/PrintRequest.js";
import { createCode, SERVICE_SLUGS } from "../types.js";
import { phoneSchema } from "../validation.js";

export const requestSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: phoneSchema,
  service: z.enum(SERVICE_SLUGS),
  quantity: z.coerce.number().int().min(1).max(500),
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
});

export const requestsRouter = Router();

requestsRouter.post("/", async (req, res) => {
  const input = requestSchema.parse(req.body);
  let created;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      created = await PrintRequestModel.create({
        id: randomUUID(),
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

requestsRouter.get("/:code", async (req, res) => {
  const code = String(req.params.code ?? "").trim().toUpperCase();
  if (code.length < 4 || code.length > 40) {
    res.status(400).json({ error: "invalid_code" });
    return;
  }

  const request = await PrintRequestModel.findOne({ code }).exec();
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
    createdAt: publicRequest.createdAt,
  });
});

import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { ContactMessageModel } from "../models/ContactMessage.js";
import { phoneSchema } from "../validation.js";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: phoneSchema,
  message: z.string().trim().min(5).max(1200),
});

export const contactRouter = Router();

contactRouter.post("/", async (req, res) => {
  const input = contactSchema.parse(req.body);
  await ContactMessageModel.create({
    id: randomUUID(),
    ...input,
    createdAt: new Date().toISOString(),
  });
  res.status(201).json({ ok: true });
});

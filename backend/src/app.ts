import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { z, ZodError } from "zod";
import { SERVICE_SLUGS } from "./types.js";
import { addContact, addRequest, findRequest } from "./store.js";

const SERVICE_LABELS = [
  { slug: "clothing", ar: "ملابس مطبوعة", en: "Printed clothing" },
  { slug: "mugs", ar: "مجات وهدايا", en: "Mugs & gifts" },
  { slug: "caps", ar: "كابات", en: "Caps" },
  { slug: "stickers", ar: "ستيكرز وليبلات", en: "Stickers & labels" },
  { slug: "cases", ar: "جرابات موبايل", en: "Phone cases" },
] as const;

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function normalizePhone(value: string): string {
  return value
    .trim()
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[\s\-()]/g, "");
}

const phoneSchema = z
  .string()
  .transform(normalizePhone)
  .refine((value) => /^01[0125][0-9]{8}$/.test(value), {
    message: "phone must be a valid Egyptian mobile number",
  });

const requestSchema = z.object({
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

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: phoneSchema,
  message: z.string().trim().min(5).max(1200),
});

function rateLimit(limit: number, windowMs: number) {
  const buckets = new Map<string, { count: number; resetAt: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = req.ip ?? "unknown";
    if (buckets.size > 500) {
      for (const [bucketKey, bucket] of buckets) {
        if (bucket.resetAt < now) buckets.delete(bucketKey);
      }
    }
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    bucket.count += 1;
    if (bucket.count > limit) {
      res.status(429).json({ error: "rate_limited", message: "Too many attempts. Try again later." });
      return;
    }
    next();
  };
}

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    }),
  );
  app.use(express.json({ limit: "32kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "yuzersef-api", time: new Date().toISOString() });
  });

  app.get("/api/services", (_req, res) => {
    res.json({ services: SERVICE_LABELS });
  });

  app.post("/api/requests", rateLimit(10, 10 * 60 * 1000), async (req, res) => {
    const input = requestSchema.parse(req.body);
    const created = await addRequest(input);
    res.status(201).json({
      code: created.code,
      status: created.status,
      service: created.service,
      createdAt: created.createdAt,
    });
  });

  app.get("/api/requests/:code", async (req, res) => {
    const code = String(req.params.code ?? "");
    if (code.length < 4 || code.length > 40) {
      res.status(400).json({ error: "invalid_code" });
      return;
    }
    const request = await findRequest(code);
    if (!request) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({
      code: request.code,
      status: request.status,
      service: request.service,
      quantity: request.quantity,
      createdAt: request.createdAt,
    });
  });

  app.post("/api/contact", rateLimit(6, 10 * 60 * 1000), async (req, res) => {
    const input = contactSchema.parse(req.body);
    await addContact(input);
    res.status(201).json({ ok: true });
  });

  app.use((_req, res) => {
    res.status(404).json({ error: "not_found" });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "validation", issues: err.issues });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  });

  return app;
}

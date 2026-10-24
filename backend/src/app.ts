import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { ZodError } from "zod";
import { createAdminRouter } from "./routes/admin.js";
import { contactRouter } from "./routes/contact.js";
import { requestsRouter } from "./routes/requests.js";
import { defaultPrintPlacementProfiles, defaultPrintPlacementSettings, PrintSettingsModel } from "./models/PrintSettings.js";
import { authRouter } from "./routes/auth.js";

const SERVICE_LABELS = [
  { slug: "clothing", ar: "ملابس مطبوعة", en: "Printed clothing" },
  { slug: "mugs", ar: "مجات وهدايا", en: "Mugs & gifts" },
  { slug: "caps", ar: "كابات", en: "Caps" },
  { slug: "stickers", ar: "ستيكرز وليبلات", en: "Stickers & labels" },
  { slug: "cases", ar: "جرابات موبايل", en: "Phone cases" },
] as const;

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
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "12mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "yuzersef-api", time: new Date().toISOString() });
  });

  app.get("/api/services", (_req, res) => {
    res.json({ services: SERVICE_LABELS });
  });

  app.get("/api/settings/print-placements", async (_req, res) => {
    const settings = await PrintSettingsModel.findOneAndUpdate(
      { key: "default" },
      { $setOnInsert: { key: "default", placements: defaultPrintPlacementSettings, profiles: defaultPrintPlacementProfiles } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean({ flattenMaps: true }).exec();
    res.json({ placements: settings?.placements ?? defaultPrintPlacementSettings, profiles: settings?.profiles ?? defaultPrintPlacementProfiles });
  });

  app.use("/api/requests", rateLimit(10, 10 * 60 * 1000), requestsRouter);
  app.use("/api/auth", rateLimit(12, 10 * 60 * 1000), authRouter);
  app.use("/api/contact", rateLimit(6, 10 * 60 * 1000), contactRouter);
  app.use("/api/admin", createAdminRouter(process.env.ADMIN_API_KEY));

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

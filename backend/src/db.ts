import mongoose from "mongoose";
import { PrintRequestModel } from "./models/PrintRequest.js";

const DEMO_CODE = "YZ-DEMO-0001";

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI is required to start the API");
  }

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB?.trim() || "yuzersef",
    serverSelectionTimeoutMS: 10_000,
  });
  console.log(`MongoDB connected to ${mongoose.connection.host}`);

  await PrintRequestModel.updateOne(
    { code: DEMO_CODE },
    {
      $setOnInsert: {
        id: "demo-request",
        code: DEMO_CODE,
        name: "طلب تجريبي",
        phone: "01000000000",
        service: "clothing",
        quantity: 1,
        details: "بيانات تجريبية لعرض صفحة تتبع الطلب. مش طلب حقيقي.",
        status: "review",
        createdAt: new Date("2026-01-01T10:00:00.000Z").toISOString(),
      },
    },
    { upsert: true },
  );
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}

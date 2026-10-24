import mongoose from "mongoose";

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
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}

import { Schema, model } from "mongoose";

interface AuthToken {
  tokenHash: string;
  userId: string;
  type: "session" | "verify-email" | "reset-password";
  expiresAt: Date;
}

const authTokenSchema = new Schema<AuthToken>(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true, enum: ["session", "verify-email", "reset-password"] },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { versionKey: false },
);

export const AuthTokenModel = model<AuthToken>("AuthToken", authTokenSchema);

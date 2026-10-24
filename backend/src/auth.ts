import { createHash, randomBytes, randomUUID, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { NextFunction, Request, Response } from "express";
import { AuthTokenModel } from "./models/AuthToken.js";
import { UserModel, type UserDocument } from "./models/User.js";

const scrypt = promisify(nodeScrypt);
const SESSION_COOKIE = "yuzersef_session";

export type AuthenticatedRequest = Request & { user: UserDocument };

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [, salt, expectedHex] = encoded.split(":");
  if (!salt || !expectedHex) return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function createUser(name: string, email: string, password: string): Promise<UserDocument> {
  return UserModel.create({
    id: randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  });
}

export async function createAuthToken(userId: string, type: "session" | "verify-email" | "reset-password", ttlMs: number): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await AuthTokenModel.create({
    tokenHash: hashToken(token),
    userId,
    type,
    expiresAt: new Date(Date.now() + ttlMs),
  });
  return token;
}

export function setSessionCookie(res: Response, token: string): void {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=2592000${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
}

export function clearSessionCookie(res: Response): void {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
}

function readCookie(request: Request, name: string): string | undefined {
  const header = request.header("cookie");
  const match = header?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return match?.slice(name.length + 1);
}

export async function authenticate(request: Request): Promise<UserDocument | null> {
  const token = request.header("authorization")?.replace(/^Bearer\s+/i, "") ?? readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const session = await AuthTokenModel.findOne({ tokenHash: hashToken(token), type: "session", expiresAt: { $gt: new Date() } }).exec();
  return session ? UserModel.findOne({ id: session.userId }).exec() : null;
}

export async function requireUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  const user = await authenticate(req);
  if (!user) {
    res.status(401).json({ error: "authentication_required" });
    return;
  }
  (req as AuthenticatedRequest).user = user;
  next();
}

export { hashPassword };

import { Router } from "express";
import { z } from "zod";
import { authenticate, clearSessionCookie, createAuthToken, createUser, hashPassword, hashToken, requireUser, setSessionCookie, verifyPassword } from "../auth.js";
import { AuthEmailError, isAuthEmailConfigured, sendAuthEmail } from "../email.js";
import { AuthTokenModel } from "../models/AuthToken.js";
import { UserModel } from "../models/User.js";

const emailSchema = z.string().trim().toLowerCase().email().max(254);
const passwordSchema = z.string().min(8).max(128);
const credentialsSchema = z.object({ email: emailSchema, password: passwordSchema });

function publicUser(user: { id: string; name: string; email: string; emailVerifiedAt?: string; offerNote?: string }) {
  return { id: user.id, name: user.name, email: user.email, emailVerified: Boolean(user.emailVerifiedAt), offerNote: user.offerNote ?? null };
}

export const authRouter = Router();

authRouter.post("/signup", async (req, res) => {
  const input = credentialsSchema.extend({ name: z.string().trim().min(2).max(80) }).parse(req.body);
  if (!isAuthEmailConfigured()) {
    res.status(503).json({ error: "authentication_email_not_configured" });
    return;
  }
  if (await UserModel.exists({ email: input.email })) {
    res.status(409).json({ error: "email_already_registered" });
    return;
  }
  const user = await createUser(input.name, input.email, input.password);
  const verificationToken = await createAuthToken(user.id, "verify-email", 24 * 60 * 60 * 1000);
  const verifyUrl = `${process.env.APP_URL ?? "http://localhost:5173"}/auth?token=${encodeURIComponent(verificationToken)}`;
  try {
    await sendAuthEmail(user.email, "Verify your Yuzersef account", `Welcome to Yuzersef, ${user.name}.\n\nVerify your email:\n${verifyUrl}`);
  } catch (error) {
    await AuthTokenModel.deleteMany({ userId: user.id }).exec();
    await UserModel.deleteOne({ id: user.id }).exec();
    if (error instanceof AuthEmailError) {
      console.error(`[auth] Verification email delivery failed: ${error.message}`);
      res.status(502).json({ error: "authentication_email_delivery_failed" });
      return;
    }
    throw error;
  }
  res.status(201).json({ user: publicUser(user), message: "verification_email_sent" });
});

authRouter.post("/login", async (req, res) => {
  const input = credentialsSchema.parse(req.body);
  const user = await UserModel.findOne({ email: input.email }).exec();
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    res.status(401).json({ error: "invalid_credentials" });
    return;
  }
  if (!user.emailVerifiedAt) {
    res.status(403).json({ error: "email_not_verified" });
    return;
  }
  const token = await createAuthToken(user.id, "session", 30 * 24 * 60 * 60 * 1000);
  setSessionCookie(res, token);
  res.json({ user: publicUser(user) });
});

authRouter.get("/me", requireUser, async (req, res) => {
  const user = await authenticate(req);
  res.json({ user: user ? publicUser(user) : null });
});

authRouter.post("/logout", async (req, res) => {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (token) await AuthTokenModel.deleteOne({ tokenHash: hashToken(token), type: "session" }).exec();
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.get("/verify", async (req, res) => {
  const token = z.string().min(20).parse(req.query.token);
  const record = await AuthTokenModel.findOneAndDelete({ tokenHash: hashToken(token), type: "verify-email", expiresAt: { $gt: new Date() } }).exec();
  if (!record) {
    res.status(400).json({ error: "invalid_or_expired_verification" });
    return;
  }
  await UserModel.updateOne({ id: record.userId }, { $set: { emailVerifiedAt: new Date().toISOString() } }).exec();
  res.json({ ok: true });
});

authRouter.post("/forgot-password", async (req, res) => {
  const { email } = z.object({ email: emailSchema }).parse(req.body);
  if (!isAuthEmailConfigured()) {
    res.status(503).json({ error: "authentication_email_not_configured" });
    return;
  }
  const user = await UserModel.findOne({ email }).exec();
  if (user) {
    const token = await createAuthToken(user.id, "reset-password", 60 * 60 * 1000);
    const resetUrl = `${process.env.APP_URL ?? "http://localhost:5173"}/auth?reset=1&token=${encodeURIComponent(token)}`;
    await sendAuthEmail(user.email, "Reset your Yuzersef password", `Reset your password:\n${resetUrl}`);
  }
  res.json({ ok: true });
});

authRouter.post("/reset-password", async (req, res) => {
  const { token, password } = z.object({ token: z.string().min(20), password: passwordSchema }).parse(req.body);
  const record = await AuthTokenModel.findOneAndDelete({ tokenHash: hashToken(token), type: "reset-password", expiresAt: { $gt: new Date() } }).exec();
  if (!record) {
    res.status(400).json({ error: "invalid_or_expired_reset" });
    return;
  }
  await UserModel.updateOne({ id: record.userId }, { $set: { passwordHash: await hashPassword(password) } }).exec();
  await AuthTokenModel.deleteMany({ userId: record.userId, type: "session" }).exec();
  res.json({ ok: true });
});

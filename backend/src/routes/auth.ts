import { Router } from "express";
import { z } from "zod";
import { authenticate, clearSessionCookie, createAuthToken, createUser, hashPassword, hashToken, requireUser, setSessionCookie, verifyPassword } from "../auth.js";
import { AuthEmailError, isAuthEmailConfigured, sendAuthEmail } from "../email.js";
import { AuthTokenModel } from "../models/AuthToken.js";
import { UserModel } from "../models/User.js";
import { phoneSchema } from "../validation.js";

const emailSchema = z.string().trim().toLowerCase().email().max(254);
const passwordSchema = z.string().min(8).max(128);
const credentialsSchema = z.object({ email: emailSchema, password: passwordSchema });
const signupSchema = credentialsSchema.extend({
  name: z.string().trim().min(2).max(80),
  phone: phoneSchema,
  confirmPassword: passwordSchema,
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function publicUser(user: { id: string; name: string; phone: string; email: string; emailVerifiedAt?: string; offerNote?: string }) {
  return { id: user.id, name: user.name, phone: user.phone, email: user.email, emailVerified: Boolean(user.emailVerifiedAt), offerNote: user.offerNote ?? null };
}

export const authRouter = Router();

authRouter.post("/signup", async (req, res) => {
  const input = signupSchema.parse(req.body);
  if (!isAuthEmailConfigured()) {
    res.status(503).json({ error: "authentication_email_not_configured" });
    return;
  }
  if (await UserModel.exists({ email: input.email })) {
    res.status(409).json({ error: "email_already_registered" });
    return;
  }
  const user = await createUser(input.name, input.phone, input.email, input.password);
  const verificationToken = await createAuthToken(user.id, "verify-email", 24 * 60 * 60 * 1000);
  const verifyUrl = `${process.env.APP_URL ?? "http://localhost:5173"}/auth?token=${encodeURIComponent(verificationToken)}`;
  try {
    await sendAuthEmail(
      user.email,
      "Verify your Yuzersef account | فعّل حسابك في يوزرسف",
      `Welcome to Yuzersef, ${user.name}.\n\nVerify your email:\n${verifyUrl}`,
      `<div dir="rtl" style="background:#10251e;padding:32px 16px;font-family:Arial,sans-serif;color:#f5f0e8"><div style="max-width:560px;margin:auto;background:#18352a;border:1px solid #395746;border-radius:20px;overflow:hidden"><div style="padding:28px 32px;background:#d6b47a;color:#10251e"><div style="font-size:28px;font-weight:700;letter-spacing:1px">YUZERSEF</div><div style="margin-top:6px;font-size:14px">طباعة تعبّر عنك</div></div><div style="padding:32px"><h1 style="margin:0 0 12px;font-size:24px">أهلاً ${escapeHtml(user.name)}،</h1><p style="line-height:1.8;color:#e6dfd2">شكراً لانضمامك إلى يوزرسف. فعّل بريدك الإلكتروني للبدء في إرسال طلبات الطباعة وحفظ سجل طلباتك.</p><p dir="ltr" style="line-height:1.7;color:#e6dfd2">Welcome to Yuzersef. Verify your email to submit print requests and keep your order history.</p><div style="text-align:center;margin:28px 0"><a href="${verifyUrl}" style="display:inline-block;background:#d6b47a;color:#10251e;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:999px">تفعيل الحساب · Verify email</a></div><p style="font-size:12px;line-height:1.7;color:#a9b5aa">إذا لم تنشئ هذا الحساب، يمكنك تجاهل هذه الرسالة.<br>If you did not create this account, you can ignore this email.</p></div></div></div>`,
    );
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
    await sendAuthEmail(
      user.email,
      "Reset your Yuzersef password | استعادة كلمة المرور",
      `Reset your password:\n${resetUrl}`,
      `<div dir="rtl" style="background:#10251e;padding:32px 16px;font-family:Arial,sans-serif;color:#f5f0e8"><div style="max-width:560px;margin:auto;background:#18352a;border:1px solid #395746;border-radius:20px;overflow:hidden"><div style="padding:28px 32px;background:#d6b47a;color:#10251e"><div style="font-size:28px;font-weight:700;letter-spacing:1px">YUZERSEF</div><div style="margin-top:6px;font-size:14px">طباعة تعبّر عنك</div></div><div style="padding:32px"><h1 style="margin:0 0 12px;font-size:24px">استعادة كلمة المرور</h1><p style="line-height:1.8;color:#e6dfd2">اضغط الزر أدناه لإنشاء كلمة مرور جديدة لحسابك.</p><p dir="ltr" style="line-height:1.7;color:#e6dfd2">Use the button below to set a new password for your account.</p><div style="text-align:center;margin:28px 0"><a href="${resetUrl}" style="display:inline-block;background:#d6b47a;color:#10251e;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:999px">استعادة كلمة المرور · Reset password</a></div><p style="font-size:12px;line-height:1.7;color:#a9b5aa">ينتهي هذا الرابط خلال ساعة واحدة. إذا لم تطلب ذلك، تجاهل الرسالة.</p></div></div></div>`,
    );
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

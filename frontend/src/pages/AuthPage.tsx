import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../providers/AuthProvider";
import { ApiError, forgotPassword, resetPassword, verifyEmail } from "../lib/api";

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = params.get("token");
    if (token && params.get("reset") === "1") setMode("reset");
    else if (token) void verifyEmail(token).then(() => setMessage("Your email is verified. You can sign in now.")).catch(() => setMessage("This verification link is invalid or expired."));
  }, [params]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      if (mode === "signup") {
        await signUp(name, email, password);
        setMessage("Check your email to verify your account, then sign in.");
      } else if (mode === "forgot") {
        await forgotPassword(email);
        setMessage("If that email exists, we sent password reset instructions.");
      } else if (mode === "reset") {
        const token = params.get("token");
        if (!token) throw new Error("missing reset token");
        await resetPassword(token, password);
        setMessage("Your password has been reset. You can sign in now.");
        setMode("login");
      } else {
        await signIn(email, password);
        navigate("/account");
      }
    } catch (error) {
      if (error instanceof ApiError && error.code === "authentication_email_delivery_failed") {
        setMessage("We could not send the verification email. Check your Resend sender and recipient settings.");
      } else if (error instanceof ApiError && error.code === "authentication_email_not_configured") {
        setMessage("Email delivery is not configured on the server yet.");
      } else if (error instanceof ApiError && error.code === "email_already_registered") {
        setMessage("An account with this email already exists. Try signing in.");
      } else {
        setMessage("We could not complete that action. Check your details and try again.");
      }
    }
  }

  return (
    <>
      <PageHeader title={mode === "login" ? "Sign in" : "Create your account"} intro="Manage your print requests and reorder from your history." />
      <div className="shell py-12">
        <form onSubmit={submit} className="mx-auto max-w-lg rounded-[var(--radius-card)] border border-bone/15 bg-forest-900/55 p-6 md:p-8">
          {mode === "signup" ? <input required minLength={2} value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" className="mb-4 w-full rounded-xl border border-bone/15 bg-forest-950 p-3 text-bone" /> : null}
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="mb-4 w-full rounded-xl border border-bone/15 bg-forest-950 p-3 text-bone" />
          {mode !== "forgot" ? <input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password (8+ characters)" className="mb-4 w-full rounded-xl border border-bone/15 bg-forest-950 p-3 text-bone" /> : null}
          <button className="w-full rounded-full bg-sand px-5 py-3 font-semibold text-forest-950">{mode === "login" ? "Sign in" : mode === "signup" ? "Sign up" : "Send reset email"}</button>
          {message ? <p className="mt-4 text-sm text-sand">{message}</p> : null}
          {mode !== "reset" ? <button type="button" onClick={() => setMode(mode === "signup" ? "login" : "signup")} className="mt-5 text-sm text-bone/65 underline">{mode === "signup" ? "I already have an account" : "Create an account"}</button> : null}
          {mode === "login" ? <button type="button" onClick={() => setMode("forgot")} className="mt-3 block text-sm text-bone/65 underline">Forgot password?</button> : null}
          <p className="mt-4 text-sm text-bone/50"><Link to="/request" className="underline">Return to request page</Link></p>
        </form>
      </div>
    </>
  );
}

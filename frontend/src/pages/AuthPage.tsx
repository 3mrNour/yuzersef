import { Eye, EyeSlash, LockKey, ShieldCheck, UserCircle } from "@phosphor-icons/react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { ApiError, forgotPassword, resetPassword, verifyEmail } from "../lib/api";
import { buttonClass } from "../lib/styles";
import { isValidPhone, normalizePhone } from "../lib/validation";
import { useAuth } from "../providers/useAuth";
import { useLanguage } from "../providers/LanguageProvider";

type AuthMode = "login" | "signup" | "forgot" | "reset";

function PasswordField({
  visible,
  value,
  label,
  placeholder,
  isArabic,
  onChange,
  onToggle,
}: {
  visible: boolean;
  value: string;
  label: string;
  placeholder: string;
  isArabic: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-bone/80">{label}</span>
      <span className="relative block">
        <LockKey aria-hidden="true" size={18} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-bone/35" />
        <input required minLength={8} type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="auth-input ps-11 pe-12" />
        <button type="button" onClick={onToggle} aria-label={visible ? (isArabic ? "إخفاء كلمة المرور" : "Hide password") : (isArabic ? "إظهار كلمة المرور" : "Show password")} className="absolute end-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-bone/45 transition-colors hover:bg-sand/20 hover:text-sand">
          {visible ? <EyeSlash size={18} /> : <Eye size={18} />}
        </button>
      </span>
    </label>
  );
}

export function AuthPage() {
  const { lang } = useLanguage();
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isArabic = lang === "ar";
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = params.get("token");
    if (token && params.get("reset") === "1") setMode("reset");
    else if (token) {
      void verifyEmail(token)
        .then(() => setMessage(isArabic ? "تم تفعيل بريدك الإلكتروني. يمكنك تسجيل الدخول الآن." : "Your email is verified. You can sign in now."))
        .catch(() => setMessage(isArabic ? "رابط التفعيل غير صالح أو منتهي." : "This verification link is invalid or expired."));
    }
  }, [isArabic, params]);

  const copy = isArabic
    ? {
        loginTitle: "مرحباً بعودتك",
        signupTitle: "أنشئ حسابك",
        forgotTitle: "استعادة كلمة المرور",
        resetTitle: "أنشئ كلمة مرور جديدة",
        intro: "احفظ طلبات الطباعة وأعد طلبها بسهولة.",
        loginIntro: "سجّل الدخول لمتابعة طلباتك وإدارتها.",
        signupIntro: "أنشئ حساباً لحفظ سجل طلباتك والحصول على عروض خاصة.",
        name: "الاسم الكامل",
        phone: "رقم الهاتف",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        confirmPassword: "تأكيد كلمة المرور",
        namePlaceholder: "اكتب اسمك الكامل",
        phonePlaceholder: "01xxxxxxxxx",
        emailPlaceholder: "you@example.com",
        passwordPlaceholder: "8 أحرف أو أكثر",
        login: "تسجيل الدخول",
        signup: "إنشاء الحساب",
        sendReset: "إرسال رابط الاستعادة",
        reset: "حفظ كلمة المرور",
        createAccount: "ليس لديك حساب؟ أنشئ حساباً",
        alreadyAccount: "لديك حساب بالفعل؟ سجّل الدخول",
        forgot: "نسيت كلمة المرور؟",
        verifySent: "تحقق من بريدك الإلكتروني لتفعيل الحساب، ثم سجّل الدخول.",
        resetSent: "إذا كان البريد مسجلاً، أرسلنا تعليمات الاستعادة.",
        passwordReset: "تم تغيير كلمة المرور. يمكنك تسجيل الدخول الآن.",
        mismatch: "كلمتا المرور غير متطابقتين.",
        invalidPhone: "اكتب رقم هاتف مصري صحيح.",
        generic: "تعذر إتمام العملية. راجع البيانات وحاول مرة أخرى.",
        emailDelivery: "تعذر إرسال رسالة التفعيل. تحقق من إعدادات البريد.",
        emailExists: "هذا البريد مسجل بالفعل. جرّب تسجيل الدخول.",
        emailNotConfigured: "خدمة البريد غير مفعلة على الخادم بعد.",
        returnRequest: "العودة إلى صفحة الطلب",
      }
    : {
        loginTitle: "Welcome back",
        signupTitle: "Create your account",
        forgotTitle: "Reset your password",
        resetTitle: "Set a new password",
        intro: "Save your print requests and reorder with ease.",
        loginIntro: "Sign in to manage your requests and order history.",
        signupIntro: "Create an account to save your history and receive special offers.",
        name: "Full name",
        phone: "Phone number",
        email: "Email address",
        password: "Password",
        confirmPassword: "Confirm password",
        namePlaceholder: "Your full name",
        phonePlaceholder: "01xxxxxxxxx",
        emailPlaceholder: "you@example.com",
        passwordPlaceholder: "At least 8 characters",
        login: "Sign in",
        signup: "Create account",
        sendReset: "Send reset link",
        reset: "Save new password",
        createAccount: "New to Yuzersef? Create an account",
        alreadyAccount: "Already have an account? Sign in",
        forgot: "Forgot your password?",
        verifySent: "Check your email to verify your account, then sign in.",
        resetSent: "If that email exists, we sent reset instructions.",
        passwordReset: "Your password was reset. You can sign in now.",
        mismatch: "Passwords do not match.",
        invalidPhone: "Enter a valid Egyptian phone number.",
        generic: "We could not complete that action. Check your details and try again.",
        emailDelivery: "We could not send the verification email. Check your email settings.",
        emailExists: "An account with this email already exists. Try signing in.",
        emailNotConfigured: "Email delivery is not configured on the server yet.",
        returnRequest: "Return to request page",
      };

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    if (mode === "signup" && !isValidPhone(phone)) {
      setMessage(copy.invalidPhone);
      return;
    }
    if ((mode === "signup" || mode === "reset") && password !== confirmPassword) {
      setMessage(copy.mismatch);
      return;
    }
    try {
      if (mode === "signup") {
        await signUp(name.trim(), normalizePhone(phone), email.trim(), password, confirmPassword);
        setMessage(copy.verifySent);
      } else if (mode === "forgot") {
        await forgotPassword(email.trim());
        setMessage(copy.resetSent);
      } else if (mode === "reset") {
        const token = params.get("token");
        if (!token) throw new Error("missing reset token");
        await resetPassword(token, password);
        setMessage(copy.passwordReset);
        setMode("login");
      } else {
        await signIn(email.trim(), password);
        navigate("/account");
      }
    } catch (error) {
      if (error instanceof ApiError && error.code === "authentication_email_delivery_failed") setMessage(copy.emailDelivery);
      else if (error instanceof ApiError && error.code === "authentication_email_not_configured") setMessage(copy.emailNotConfigured);
      else if (error instanceof ApiError && error.code === "email_already_registered") setMessage(copy.emailExists);
      else setMessage(copy.generic);
    }
  }

  const title = mode === "login" ? copy.loginTitle : mode === "signup" ? copy.signupTitle : mode === "forgot" ? copy.forgotTitle : copy.resetTitle;
  const intro = mode === "login" ? copy.loginIntro : mode === "signup" ? copy.signupIntro : copy.intro;
  const needsPassword = mode !== "forgot";

  return (
    <>
      <PageHeader title={title} intro={intro} />
      <div className="shell py-12 md:py-16">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-bone/15 bg-forest-900/60 shadow-2xl shadow-black/20 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="hidden flex-col justify-between bg-sand p-8 text-forest-950 lg:flex" dir="rtl">
            <div>
              <div className="mb-10 flex items-center gap-3"><ShieldCheck size={28} weight="duotone" /><span className="font-latin text-sm font-bold tracking-[0.2em]">YUZERSEF</span></div>
              <h2 className="font-arabic text-3xl font-semibold leading-tight">خلّي فكرتك<br />تلبس شكلها.</h2>
              <p className="mt-5 max-w-[24ch] text-sm leading-7 text-forest-950/70">حسابك يجمع طلباتك وتصاميمك في مكان واحد، لتعود إليها وقتما تريد.</p>
            </div>
            <p className="text-xs font-semibold tracking-[0.08em] text-forest-950/55">PRINT · PERSONALISE · REPEAT</p>
          </div>
          <form onSubmit={submit} className="p-6 sm:p-8 md:p-10" dir={isArabic ? "rtl" : "ltr"}>
            <div className="mb-8 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sand/15 text-sand"><UserCircle size={25} weight="duotone" /></span>
              <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand/70">YUZERSEF</p><p className="mt-1 text-sm text-bone/50">{copy.intro}</p></div>
            </div>
            {mode === "signup" ? <label className="mb-5 block"><span className="mb-2 block text-sm font-semibold text-bone/80">{copy.name}</span><input required minLength={2} value={name} onChange={(event) => setName(event.target.value)} placeholder={copy.namePlaceholder} className="auth-input" /></label> : null}
            {mode === "signup" ? <label className="mb-5 block"><span className="mb-2 block text-sm font-semibold text-bone/80">{copy.phone}</span><input required type="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder={copy.phonePlaceholder} className="auth-input font-latin" dir="ltr" /></label> : null}
            <label className="mb-5 block"><span className="mb-2 block text-sm font-semibold text-bone/80">{copy.email}</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={copy.emailPlaceholder} className="auth-input font-latin" dir="ltr" /></label>
            {needsPassword ? <div className="grid gap-5 sm:grid-cols-2"><PasswordField visible={showPassword} value={password} label={copy.password} placeholder={copy.passwordPlaceholder} isArabic={isArabic} onChange={setPassword} onToggle={() => setShowPassword((current) => !current)} />{mode === "signup" || mode === "reset" ? <PasswordField visible={showConfirmPassword} value={confirmPassword} label={copy.confirmPassword} placeholder={copy.passwordPlaceholder} isArabic={isArabic} onChange={setConfirmPassword} onToggle={() => setShowConfirmPassword((current) => !current)} /> : null}</div> : null}
            <button className={buttonClass("primary", "dark") + " mt-7 w-full"}>{mode === "login" ? copy.login : mode === "signup" ? copy.signup : mode === "forgot" ? copy.sendReset : copy.reset}</button>
            {message ? <p role="status" className="mt-4 rounded-xl border border-sand/20 bg-sand/10 p-3 text-sm leading-6 text-sand">{message}</p> : null}
            {mode !== "reset" ? <button type="button" onClick={() => setMode(mode === "signup" ? "login" : "signup")} className="mt-6 text-sm font-medium text-bone/65 underline underline-offset-4 hover:text-bone">{mode === "signup" ? copy.alreadyAccount : copy.createAccount}</button> : null}
            {mode === "login" ? <button type="button" onClick={() => setMode("forgot")} className="mt-3 block text-sm text-bone/55 underline underline-offset-4 hover:text-bone">{copy.forgot}</button> : null}
            <p className="mt-6 border-t border-bone/10 pt-5 text-sm text-bone/45"><Link to="/request" className="underline underline-offset-4 hover:text-bone">{copy.returnRequest}</Link></p>
          </form>
        </div>
      </div>
    </>
  );
}

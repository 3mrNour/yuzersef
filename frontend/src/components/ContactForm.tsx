import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle, CircleNotch, PaperPlaneTilt, WhatsappLogo } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { contact } from "../content";
import { sendContact } from "../lib/api";
import { cn } from "../lib/cn";
import { buttonClass } from "../lib/styles";
import { isValidPhone, normalizePhone } from "../lib/validation";
import { useLanguage } from "../providers/LanguageProvider";

type Status = "idle" | "submitting" | "success" | "error";
type Field = "name" | "phone" | "message";
type Errors = Partial<Record<Field, string>>;

export function ContactForm() {
  const { t } = useLanguage();
  const [values, setValues] = useState({ name: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "success") {
      successRef.current?.focus();
    }
  }, [status]);

  function update(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (status === "error") setStatus("idle");
  }

  function validate(): Errors {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = t.contact.validation.name;
    if (!isValidPhone(values.phone)) next.phone = t.contact.validation.phone;
    if (values.message.trim().length < 5) next.message = t.contact.validation.message;
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const first = Object.keys(nextErrors)[0] as Field;
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }

    setStatus("submitting");
    try {
      await sendContact({
        name: values.name.trim(),
        phone: normalizePhone(values.phone),
        message: values.message.trim(),
      });
      setValues({ name: "", phone: "", message: "" });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const busy = status === "submitting";

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="contact-name" className="mb-2 block text-sm font-medium text-bone/85">
          {t.contact.fields.name}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          maxLength={80}
          autoComplete="name"
          className="field"
          placeholder={t.contact.fields.namePlaceholder}
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          disabled={busy}
        />
        {errors.name ? (
          <p id="contact-name-error" className="mt-1.5 text-xs text-danger">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="contact-phone" className="mb-2 block text-sm font-medium text-bone/85">
          {t.contact.fields.phone}
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          dir="ltr"
          autoComplete="tel"
          className="field text-start"
          placeholder={t.contact.fields.phonePlaceholder}
          value={values.phone}
          onChange={(event) => update("phone", event.target.value)}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "contact-phone-error" : undefined}
          disabled={busy}
        />
        {errors.phone ? (
          <p id="contact-phone-error" className="mt-1.5 text-xs text-danger">
            {errors.phone}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-bone/85">
          {t.contact.fields.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          maxLength={1200}
          className="field resize-y"
          placeholder={t.contact.fields.messagePlaceholder}
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          disabled={busy}
        />
        {errors.message ? (
          <p id="contact-message-error" className="mt-1.5 text-xs text-danger">
            {errors.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        <button
          type="submit"
          disabled={busy}
          className={cn(buttonClass("primary"), "w-full sm:w-auto")}
        >
          {busy ? (
            <CircleNotch aria-hidden="true" size={18} className="animate-spin" />
          ) : (
            <PaperPlaneTilt aria-hidden="true" size={18} />
          )}
          {busy ? t.contact.submitting : t.contact.submit}
        </button>

        <p className="text-xs leading-relaxed text-bone/50">
          {t.contact.privacyNote.split(t.footer.privacy)[0]}
          <Link to="/privacy" className="text-sand underline underline-offset-2">
            {t.footer.privacy}
          </Link>
          {t.contact.privacyNote.split(t.footer.privacy)[1]}
        </p>
      </div>

      <div aria-live="polite">
        {status === "success" ? (
          <div
            ref={successRef}
            tabIndex={-1}
            role="status"
            className="flex items-start gap-3 rounded-[var(--radius-field)] border border-sand/30 bg-sand/10 p-4 text-sm text-bone"
          >
            <CheckCircle aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-sand" />
            <span>{t.contact.success}</span>
          </div>
        ) : null}

        {status === "error" ? (
          <div
            role="alert"
            className="rounded-[var(--radius-field)] border border-danger/40 bg-danger/10 p-4 text-sm text-bone"
          >
            <p>{t.contact.error}</p>
            <a
              href={contact.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 font-medium text-sand underline underline-offset-2"
            >
              <WhatsappLogo aria-hidden="true" size={16} weight="fill" />
              {t.common.whatsappCta}
            </a>
          </div>
        ) : null}
      </div>
    </form>
  );
}

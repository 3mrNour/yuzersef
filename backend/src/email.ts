export function isAuthEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.AUTH_EMAIL_FROM?.trim());
}

export class AuthEmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthEmailError";
  }
}

export async function sendAuthEmail(to: string, subject: string, text: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.AUTH_EMAIL_FROM?.trim();
  if (!apiKey || !from) {
    throw new AuthEmailError("Authentication email delivery is not configured");
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, text, html }),
  });
  if (!response.ok) {
    const details = await response.text();
    throw new AuthEmailError(`Resend rejected email with status ${response.status}: ${details.slice(0, 300)}`);
  }
}

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function normalizePhone(value: string): string {
  return value
    .trim()
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[\s\-()]/g, "");
}

export function isValidPhone(value: string): boolean {
  return /^01[0125][0-9]{8}$/.test(normalizePhone(value));
}

export function isValidHttpUrl(value: string): boolean {
  if (!value.trim()) return true;
  return /^https?:\/\/\S+$/i.test(value.trim());
}

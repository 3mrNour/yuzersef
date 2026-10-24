import { z } from "zod";

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function normalizePhone(value: string): string {
  return value
    .trim()
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[\s\-()]/g, "");
}

export const phoneSchema = z
  .string()
  .transform(normalizePhone)
  .refine((value) => /^01[0125][0-9]{8}$/.test(value), {
    message: "phone must be a valid Egyptian mobile number",
  });

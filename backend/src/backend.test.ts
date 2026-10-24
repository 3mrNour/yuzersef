import { describe, expect, it } from "vitest";
import { contactSchema } from "./routes/contact.js";
import { isAuthorized } from "./routes/admin.js";
import { requestSchema } from "./routes/requests.js";

describe("backend request validation", () => {
  it("normalizes Arabic phone digits and accepts a valid request", () => {
    const result = requestSchema.parse({
      name: "أحمد",
      phone: "٠١٠١٢٣٤٥٦٧٨",
      service: "clothing",
      quantity: "12",
      details: "قمصان سوداء",
    });

    expect(result.phone).toBe("01012345678");
    expect(result.quantity).toBe(12);
  });

  it("rejects invalid phone numbers and quantities", () => {
    const result = requestSchema.safeParse({
      name: "Ahmed",
      phone: "123",
      service: "clothing",
      quantity: 0,
      details: "",
    });

    expect(result.success).toBe(false);
  });

  it("requires a valid contact message", () => {
    expect(
      contactSchema.safeParse({
        name: "Sara",
        phone: "01123456789",
        message: "Hello",
      }).success,
    ).toBe(true);
    expect(contactSchema.safeParse({ name: "S", phone: "01123456789", message: "Hi" }).success).toBe(false);
  });
});

describe("admin API key validation", () => {
  it("accepts only an exact configured key", () => {
    expect(isAuthorized("test-secret", "test-secret")).toBe(true);
    expect(isAuthorized("test-secret-wrong", "test-secret")).toBe(false);
    expect(isAuthorized(undefined, "test-secret")).toBe(false);
    expect(isAuthorized("test-secret", undefined)).toBe(false);
  });
});

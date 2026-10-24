import { describe, expect, it } from "vitest";
import { contactSchema } from "./routes/contact.js";
import { isAuthorized } from "./routes/admin.js";
import { requestSchema } from "./routes/requests.js";
import { defaultPrintPlacementProfiles } from "./models/PrintSettings.js";
import { PrintRequestModel } from "./models/PrintRequest.js";

describe("backend request validation", () => {
  it("normalizes Arabic phone digits and accepts a valid request", () => {
    const result = requestSchema.parse({
      name: "أحمد",
      phone: "٠١٠١٢٣٤٥٦٧٨",
      service: "clothing",
      quantity: "12",
      items: Array.from({ length: 12 }, () => ({
        productId: "tee-classic",
        productName: "Classic Tee",
        size: "M",
        color: "Bone",
        style: "Classic",
        specialRequest: "",
      })),
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
      items: [],
      details: "",
    });

    expect(result.success).toBe(false);
  });

  it("allows an empty optional special request in the persisted schema", () => {
    const validationError = new PrintRequestModel({
      id: "test-id",
      code: "YZ-TEST",
      name: "Ahmed",
      phone: "01012345678",
      service: "clothing",
      quantity: 1,
      details: "",
      items: [{
        productId: "tee-classic",
        productName: "Classic Tee",
        size: "M",
        color: "Bone",
        style: "Classic",
        specialRequest: "",
        printPlacement: "front",
      }],
      status: "received",
      createdAt: new Date().toISOString(),
    }).validateSync();

    expect(validationError?.errors["items.0.specialRequest"]).toBeUndefined();
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

  describe("product print profiles", () => {
    it("keeps product-specific positions instead of applying clothing positions to every product", () => {
      expect(defaultPrintPlacementProfiles["tee-classic"].placements).toContain("left-sleeve");
      expect(defaultPrintPlacementProfiles["mug-classic"].placements).not.toContain("left-sleeve");
      expect(defaultPrintPlacementProfiles["cap-classic"].placements).not.toContain("right-sleeve");
    });

    it("defines production guidance for every supported Studio product", () => {
      for (const profile of Object.values(defaultPrintPlacementProfiles)) {
        expect(profile.placements.length).toBeGreaterThan(0);
        expect(profile.guidance.length).toBeGreaterThan(20);
      }
    });
  });
});

import type { PrintRequest } from "../types.js";

export const DEMO_CODE = "YZ-DEMO-0001";

export const demoRequests: PrintRequest[] = [
  {
    id: "demo-request",
    code: DEMO_CODE,
    name: "طلب تجريبي",
    phone: "01000000000",
    service: "clothing",
    quantity: 1,
    details: "بيانات تجريبية لعرض صفحة تتبع الطلب. مش طلب حقيقي.",
    status: "review",
    createdAt: new Date("2026-01-01T10:00:00.000Z").toISOString(),
  },
];

import type { ServiceSlug } from "../content";
import type { Studio3DDesign } from "../features/studio/studio3d";

export interface CreateRequestBody {
  name: string;
  phone: string;
  service: ServiceSlug;
  quantity: number;
  items: RequestItem[];
  details: string;
  artworkUrl?: string;
  designPreviewUrl?: string;
  designFileName?: string;
  logoDataUrl?: string;
  studio3d?: Studio3DDesign;
}

export interface RequestItem {
  productId: string;
  productName: string;
  size: string;
  color: string;
  style: string;
  specialRequest: string;
  printPlacement?: PrintPlacement;
}

export interface CreatedRequest {
  code: string;
  status: RequestStatus;
  service: ServiceSlug;
  createdAt: string;
}

export type RequestStatus = "received" | "review" | "confirmed" | "closed";
export type PrintPlacement = "front" | "back" | "left-sleeve" | "right-sleeve" | "custom";
export type PrintPlacementSettings = Record<ServiceSlug, PrintPlacement[]>;
export interface PrintPlacementProfile {
  productId: string;
  service: ServiceSlug;
  productName: string;
  placements: PrintPlacement[];
  guidance: string;
}

export interface PortfolioItem {
  id: string;
  category: ServiceSlug;
  titleAr: string;
  titleEn: string;
  altAr: string;
  altEn: string;
  image: string;
  sortOrder: number;
  active: boolean;
}

export interface TrackedRequest {
  code: string;
  status: RequestStatus;
  service: ServiceSlug;
  quantity: number;
  items: RequestItem[];
  createdAt: string;
}

export interface ContactBody {
  name: string;
  phone: string;
  message: string;
}

export interface AdminRequest extends TrackedRequest {
  id: string;
  name: string;
  phone: string;
  details: string;
  artworkUrl?: string;
  designPreviewUrl?: string;
  designFileName?: string;
  logoDataUrl?: string;
  studio3d?: Studio3DDesign;
}

export interface AdminContact {
  id: string;
  name: string;
  phone: string;
  message: string;
  createdAt: string;
}

export interface AdminSummary {
  totalRequests: number;
  totalContacts: number;
  statuses: Record<RequestStatus, number>;
  latestRequestAt: string | null;
  latestRequestCode: string | null;
  latestContactAt: string | null;
}

interface AdminPage<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code = message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError("network_error", 0);
  }

  if (!response.ok) {
    let code = `request_failed_${response.status}`;
    try {
      const body = await response.json() as { error?: string; message?: string };
      code = body.error ?? code;
      if (body.message && body.error) code = `${body.error}:${body.message}`;
    } catch {
      // Keep the HTTP status when the server does not return JSON.
    }
    throw new ApiError(code, response.status, code);
  }

  return (await response.json()) as T;
}

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  emailVerified: boolean;
  offerNote: string | null;
}

export function login(email: string, password: string): Promise<{ user: AuthUser }> {
  return request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export function signup(name: string, phone: string, email: string, password: string, confirmPassword: string): Promise<{ user: AuthUser; message: string }> {
  return request("/api/auth/signup", { method: "POST", body: JSON.stringify({ name, phone, email, password, confirmPassword }) });
}

export function fetchCurrentUser(): Promise<{ user: AuthUser | null }> {
  return requestWithNetworkRetry("/api/auth/me");
}

async function requestWithNetworkRetry<T>(path: string, init?: RequestInit, attempts = 10): Promise<T> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await request<T>(path, init);
    } catch (error) {
      if (!(error instanceof ApiError) || error.code !== "network_error" || attempt === attempts - 1) {
        throw error;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 500));
    }
  }
  throw new ApiError("network_error", 0);
}

export function verifyEmail(token: string): Promise<{ ok: true }> {
  return request(`/api/auth/verify?token=${encodeURIComponent(token)}`);
}

export function forgotPassword(email: string): Promise<{ ok: true }> {
  return request("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
}

export function resetPassword(token: string, password: string): Promise<{ ok: true }> {
  return request("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });
}

export function logout(): Promise<{ ok: true }> {
  return request("/api/auth/logout", { method: "POST" });
}

export function fetchMyRequests(): Promise<{ items: TrackedRequest[] }> {
  return request("/api/requests");
}

export function createRequest(body: CreateRequestBody): Promise<CreatedRequest> {
  return request<CreatedRequest>("/api/requests", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function fetchRequest(code: string): Promise<TrackedRequest> {
  return request<TrackedRequest>(`/api/requests/${encodeURIComponent(code)}`);
}

export function sendContact(body: ContactBody): Promise<{ ok: true }> {
  return request<{ ok: true }>("/api/contact", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function fetchPrintPlacementSettings(): Promise<{ placements: PrintPlacementSettings; profiles: Record<string, PrintPlacementProfile> }> {
  return request<{ placements: PrintPlacementSettings; profiles: Record<string, PrintPlacementProfile> }>("/api/settings/print-placements");
}

export function fetchPortfolio(): Promise<{ items: PortfolioItem[] }> {
  return request("/api/portfolio");
}

function adminHeaders(apiKey: string): HeadersInit {
  return { "x-admin-api-key": apiKey };
}

export function fetchAdminSummary(apiKey: string): Promise<AdminSummary> {
  return requestWithNetworkRetry<AdminSummary>("/api/admin/summary", {
    headers: adminHeaders(apiKey),
  });
}

export function fetchAdminRequests(
  apiKey: string,
  page: number,
  status: RequestStatus | "all",
): Promise<AdminPage<AdminRequest>> {
  const query = new URLSearchParams({ page: String(page), limit: "12" });
  if (status !== "all") query.set("status", status);
  return requestWithNetworkRetry<AdminPage<AdminRequest>>(`/api/admin/requests?${query}`, {
    headers: adminHeaders(apiKey),
  });
}

export function fetchAdminContacts(apiKey: string, page: number): Promise<AdminPage<AdminContact>> {
  return requestWithNetworkRetry<AdminPage<AdminContact>>(`/api/admin/contacts?page=${page}&limit=12`, {
    headers: adminHeaders(apiKey),
  });
}

export function updateAdminRequestStatus(
  apiKey: string,
  id: string,
  status: RequestStatus,
): Promise<{ id: string; code: string; status: RequestStatus }> {
  return request<{ id: string; code: string; status: RequestStatus }>(
    `/api/admin/requests/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      headers: adminHeaders(apiKey),
      body: JSON.stringify({ status }),
    },
  );
}

export function updateAdminItemPlacement(
  apiKey: string,
  requestId: string,
  itemIndex: number,
  placement: PrintPlacement,
): Promise<{ id: string; itemIndex: number; placement: PrintPlacement }> {
  return request(`/api/admin/requests/${encodeURIComponent(requestId)}/items/${itemIndex}/placement`, {
    method: "PATCH",
    headers: adminHeaders(apiKey),
    body: JSON.stringify({ placement }),
  });
}

export function fetchAdminPrintSettings(apiKey: string): Promise<{ placements: PrintPlacementSettings; profiles: Record<string, PrintPlacementProfile> }> {
  return requestWithNetworkRetry<{ placements: PrintPlacementSettings; profiles: Record<string, PrintPlacementProfile> }>("/api/admin/print-settings", {
    headers: adminHeaders(apiKey),
  });
}

export function updateAdminPrintSettings(
  apiKey: string,
  placements: PrintPlacementSettings,
  profiles: Record<string, PrintPlacementProfile>,
): Promise<{ placements: PrintPlacementSettings; profiles: Record<string, PrintPlacementProfile> }> {
  return request<{ placements: PrintPlacementSettings; profiles: Record<string, PrintPlacementProfile> }>("/api/admin/print-settings", {
    method: "PATCH",
    headers: adminHeaders(apiKey),
    body: JSON.stringify({ placements, profiles }),
  });
}

export function fetchAdminPortfolio(apiKey: string): Promise<{ items: PortfolioItem[] }> {
  return requestWithNetworkRetry("/api/admin/portfolio", { headers: adminHeaders(apiKey) });
}

export function createAdminPortfolioItem(apiKey: string, item: Omit<PortfolioItem, "id">): Promise<{ item: PortfolioItem }> {
  return request("/api/admin/portfolio", { method: "POST", headers: adminHeaders(apiKey), body: JSON.stringify(item) });
}

export function updateAdminPortfolioItem(apiKey: string, id: string, item: Partial<Omit<PortfolioItem, "id">>): Promise<{ item: PortfolioItem }> {
  return request(`/api/admin/portfolio/${encodeURIComponent(id)}`, { method: "PATCH", headers: adminHeaders(apiKey), body: JSON.stringify(item) });
}

export function deleteAdminPortfolioItem(apiKey: string, id: string): Promise<void> {
  return request(`/api/admin/portfolio/${encodeURIComponent(id)}`, { method: "DELETE", headers: adminHeaders(apiKey) });
}

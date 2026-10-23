import type { ServiceSlug } from "../content";

export interface CreateRequestBody {
  name: string;
  phone: string;
  service: ServiceSlug;
  quantity: number;
  details: string;
  artworkUrl?: string;
}

export interface CreatedRequest {
  code: string;
  status: RequestStatus;
  service: ServiceSlug;
  createdAt: string;
}

export type RequestStatus = "received" | "review" | "confirmed" | "closed";

export interface TrackedRequest {
  code: string;
  status: RequestStatus;
  service: ServiceSlug;
  quantity: number;
  createdAt: string;
}

export interface ContactBody {
  name: string;
  phone: string;
  message: string;
}

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError("network_error", 0);
  }

  if (!response.ok) {
    throw new ApiError(`request_failed_${response.status}`, response.status);
  }

  return (await response.json()) as T;
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

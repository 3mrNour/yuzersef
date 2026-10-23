import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createCode, type ContactMessage, type PrintRequest, type ServiceSlug } from "./types.js";
import { demoRequests } from "./data/seed.js";

const dataDir = fileURLToPath(new URL("../data/", import.meta.url));
const storeFile = path.join(dataDir, "store.json");

interface StoreState {
  requests: PrintRequest[];
  contacts: ContactMessage[];
}

let state: StoreState | null = null;
let writing: Promise<void> = Promise.resolve();

async function load(): Promise<StoreState> {
  if (state) return state;
  await mkdir(dataDir, { recursive: true });
  try {
    const raw = await readFile(storeFile, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreState>;
    state = {
      requests: parsed.requests?.length ? parsed.requests : demoRequests,
      contacts: parsed.contacts ?? [],
    };
  } catch {
    state = { requests: demoRequests, contacts: [] };
    await persist();
  }
  return state;
}

async function persist(): Promise<void> {
  if (!state) return;
  const payload = JSON.stringify(state, null, 2);
  writing = writing.then(async () => {
    await mkdir(dataDir, { recursive: true });
    const tmp = path.join(dataDir, `.store-${Date.now()}.tmp`);
    await writeFile(tmp, payload, "utf8");
    await rename(tmp, storeFile);
  });
  return writing;
}

export async function findRequest(code: string): Promise<PrintRequest | undefined> {
  const normalized = code.trim().toUpperCase();
  const current = await load();
  return current.requests.find((item) => item.code.toUpperCase() === normalized);
}

export interface NewRequestInput {
  name: string;
  phone: string;
  service: ServiceSlug;
  quantity: number;
  details: string;
  artworkUrl?: string;
}

export async function addRequest(input: NewRequestInput): Promise<PrintRequest> {
  const current = await load();
  let code = createCode();
  while (current.requests.some((item) => item.code === code)) code = createCode();

  const request: PrintRequest = {
    id: crypto.randomUUID(),
    code,
    name: input.name,
    phone: input.phone,
    service: input.service,
    quantity: input.quantity,
    details: input.details,
    artworkUrl: input.artworkUrl || undefined,
    status: "received",
    createdAt: new Date().toISOString(),
  };

  current.requests.unshift(request);
  await persist();
  return request;
}

export interface NewContactInput {
  name: string;
  phone: string;
  message: string;
}

export async function addContact(input: NewContactInput): Promise<ContactMessage> {
  const current = await load();
  const contact: ContactMessage = {
    id: crypto.randomUUID(),
    name: input.name,
    phone: input.phone,
    message: input.message,
    createdAt: new Date().toISOString(),
  };
  current.contacts.unshift(contact);
  await persist();
  return contact;
}

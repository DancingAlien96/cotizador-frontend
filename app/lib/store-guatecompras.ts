import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { CotizacionGuatecomprasData } from "./cotizacion-guatecompras";

export type SavedGuatecompras = {
  id: string;
  data: CotizacionGuatecomprasData;
  createdAt: number;
  updatedAt: number;
};

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "guatecompras.json");

async function readAll(): Promise<SavedGuatecompras[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as SavedGuatecompras[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function writeAll(items: SavedGuatecompras[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(items, null, 2), "utf8");
}

export async function listGuatecompras(): Promise<SavedGuatecompras[]> {
  const all = await readAll();
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function upsertGuatecompras(input: {
  id?: string | null;
  data: CotizacionGuatecomprasData;
}): Promise<SavedGuatecompras> {
  const all = await readAll();
  const now = Date.now();

  if (input.id) {
    const idx = all.findIndex((c) => c.id === input.id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], data: input.data, updatedAt: now };
      await writeAll(all);
      return all[idx];
    }
  }

  const created: SavedGuatecompras = {
    id: crypto.randomUUID(),
    data: input.data,
    createdAt: now,
    updatedAt: now,
  };
  all.push(created);
  await writeAll(all);
  return created;
}

export async function deleteGuatecompras(id: string): Promise<void> {
  const all = await readAll();
  await writeAll(all.filter((c) => c.id !== id));
}

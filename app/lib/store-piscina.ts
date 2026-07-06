import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { PropuestaPiscinaData } from "./propuesta-piscina";

export type SavedPiscina = {
  id: string;
  data: PropuestaPiscinaData;
  createdAt: number;
  updatedAt: number;
};

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "piscina.json");

async function readAll(): Promise<SavedPiscina[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as SavedPiscina[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function writeAll(items: SavedPiscina[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(items, null, 2), "utf8");
}

export async function listPiscina(): Promise<SavedPiscina[]> {
  const all = await readAll();
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function upsertPiscina(input: {
  id?: string | null;
  data: PropuestaPiscinaData;
}): Promise<SavedPiscina> {
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
  const created: SavedPiscina = {
    id: crypto.randomUUID(),
    data: input.data,
    createdAt: now,
    updatedAt: now,
  };
  all.push(created);
  await writeAll(all);
  return created;
}

export async function deletePiscina(id: string): Promise<void> {
  const all = await readAll();
  await writeAll(all.filter((c) => c.id !== id));
}

import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { CartaData } from "./carta";

// Persistencia simple en archivo JSON (sin base de datos).
// Se guarda en <proyecto>/data/cotizaciones.json (ignorado por git).

export type SavedCotizacion = {
  id: string;
  nombre: string;
  data: CartaData;
  createdAt: number;
  updatedAt: number;
};

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "cotizaciones.json");

async function readAll(): Promise<SavedCotizacion[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as SavedCotizacion[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function writeAll(items: SavedCotizacion[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(items, null, 2), "utf8");
}

export async function listCotizaciones(): Promise<SavedCotizacion[]> {
  const all = await readAll();
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function upsertCotizacion(input: {
  id?: string | null;
  nombre: string;
  data: CartaData;
}): Promise<SavedCotizacion> {
  const all = await readAll();
  const now = Date.now();

  if (input.id) {
    const idx = all.findIndex((c) => c.id === input.id);
    if (idx !== -1) {
      all[idx] = {
        ...all[idx],
        nombre: input.nombre,
        data: input.data,
        updatedAt: now,
      };
      await writeAll(all);
      return all[idx];
    }
  }

  const created: SavedCotizacion = {
    id: crypto.randomUUID(),
    nombre: input.nombre,
    data: input.data,
    createdAt: now,
    updatedAt: now,
  };
  all.push(created);
  await writeAll(all);
  return created;
}

export async function deleteCotizacion(id: string): Promise<void> {
  const all = await readAll();
  await writeAll(all.filter((c) => c.id !== id));
}

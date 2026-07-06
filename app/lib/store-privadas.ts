import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { CotizacionPrivadaData } from "./cotizacion-privada";

export type SavedCotizacionPrivada = {
  id: string;
  numero: string; // folio autogenerado, ej. "0001"
  data: CotizacionPrivadaData;
  createdAt: number;
  updatedAt: number;
};

type StoreFile = {
  seq: number;
  items: SavedCotizacionPrivada[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "privadas.json");

function formatNumero(seq: number): string {
  return String(seq).padStart(4, "0");
}

async function readStore(): Promise<StoreFile> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    return {
      seq: typeof parsed.seq === "number" ? parsed.seq : 0,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { seq: 0, items: [] };
    }
    throw err;
  }
}

async function writeStore(store: StoreFile): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function listPrivadas(): Promise<SavedCotizacionPrivada[]> {
  const { items } = await readStore();
  return items.sort((a, b) => b.updatedAt - a.updatedAt);
}

// Número que recibiría la próxima cotización nueva (sin consumirlo).
export async function peekNextNumero(): Promise<string> {
  const { seq } = await readStore();
  return formatNumero(seq + 1);
}

export async function upsertPrivada(input: {
  id?: string | null;
  data: CotizacionPrivadaData;
}): Promise<{ saved: SavedCotizacionPrivada; siguienteNumero: string }> {
  const store = await readStore();
  const now = Date.now();

  if (input.id) {
    const idx = store.items.findIndex((c) => c.id === input.id);
    if (idx !== -1) {
      store.items[idx] = {
        ...store.items[idx],
        data: input.data,
        updatedAt: now,
      };
      await writeStore(store);
      return {
        saved: store.items[idx],
        siguienteNumero: formatNumero(store.seq + 1),
      };
    }
  }

  store.seq += 1;
  const created: SavedCotizacionPrivada = {
    id: crypto.randomUUID(),
    numero: formatNumero(store.seq),
    data: input.data,
    createdAt: now,
    updatedAt: now,
  };
  store.items.push(created);
  await writeStore(store);
  return { saved: created, siguienteNumero: formatNumero(store.seq + 1) };
}

export async function deletePrivada(id: string): Promise<void> {
  const store = await readStore();
  store.items = store.items.filter((c) => c.id !== id);
  await writeStore(store);
}

"use server";

import { getSession } from "../lib/session";
import {
  listPiscina,
  upsertPiscina,
  deletePiscina,
  type SavedPiscina,
} from "../lib/store-piscina";
import type { PropuestaPiscinaData } from "../lib/propuesta-piscina";

async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
}

export async function savePiscina(input: {
  id?: string | null;
  nombre?: string;
  autor?: string;
  data: PropuestaPiscinaData;
}): Promise<{ saved: SavedPiscina; all: SavedPiscina[] }> {
  await requireAuth();
  const saved = await upsertPiscina(input);
  const all = await listPiscina();
  return { saved, all };
}

export async function removePiscina(id: string): Promise<SavedPiscina[]> {
  await requireAuth();
  await deletePiscina(id);
  return listPiscina();
}

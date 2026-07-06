"use server";

import { getSession } from "../lib/session";
import {
  listGuatecompras,
  upsertGuatecompras,
  deleteGuatecompras,
  type SavedGuatecompras,
} from "../lib/store-guatecompras";
import type { CotizacionGuatecomprasData } from "../lib/cotizacion-guatecompras";

async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
}

export async function saveGuatecompras(input: {
  id?: string | null;
  data: CotizacionGuatecomprasData;
}): Promise<{ saved: SavedGuatecompras; all: SavedGuatecompras[] }> {
  await requireAuth();
  const saved = await upsertGuatecompras(input);
  const all = await listGuatecompras();
  return { saved, all };
}

export async function removeGuatecompras(
  id: string,
): Promise<SavedGuatecompras[]> {
  await requireAuth();
  await deleteGuatecompras(id);
  return listGuatecompras();
}

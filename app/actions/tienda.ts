"use server";

import { getSession } from "../lib/session";
import {
  listTienda,
  upsertTienda,
  deleteTienda,
  type SavedTienda,
} from "../lib/store-tienda";
import type { CotizacionTiendaData } from "../lib/cotizacion-tienda";

async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
}

export async function saveTienda(input: {
  id?: string | null;
  data: CotizacionTiendaData;
}): Promise<{ saved: SavedTienda; all: SavedTienda[] }> {
  await requireAuth();
  const saved = await upsertTienda(input);
  const all = await listTienda();
  return { saved, all };
}

export async function removeTienda(id: string): Promise<SavedTienda[]> {
  await requireAuth();
  await deleteTienda(id);
  return listTienda();
}

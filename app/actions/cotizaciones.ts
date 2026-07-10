"use server";

import { getSession } from "../lib/session";
import {
  listCotizaciones,
  upsertCotizacion,
  deleteCotizacion,
  type SavedCotizacion,
} from "../lib/store";
import type { CartaData } from "../lib/carta";

async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
}

export async function saveCotizacion(input: {
  id?: string | null;
  nombre: string;
  autor?: string;
  data: CartaData;
}): Promise<{ saved: SavedCotizacion; all: SavedCotizacion[] }> {
  await requireAuth();
  const saved = await upsertCotizacion(input);
  const all = await listCotizaciones();
  return { saved, all };
}

export async function removeCotizacion(
  id: string,
): Promise<SavedCotizacion[]> {
  await requireAuth();
  await deleteCotizacion(id);
  return listCotizaciones();
}

"use server";

import { getSession } from "../lib/session";
import {
  listTienda,
  upsertTienda,
  deleteTienda,
  peekNextNumeroTienda,
  type SavedTienda,
} from "../lib/store-tienda";
import type { CotizacionTiendaData } from "../lib/cotizacion-tienda";

async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
}

export async function saveTienda(input: {
  id?: string | null;
  nombre?: string;
  autor?: string;
  data: CotizacionTiendaData;
}): Promise<{
  saved: SavedTienda;
  all: SavedTienda[];
  siguienteNumero: string;
}> {
  await requireAuth();
  const { saved, siguienteNumero } = await upsertTienda(input);
  const all = await listTienda();
  return { saved, all, siguienteNumero };
}

export async function removeTienda(id: string): Promise<{
  all: SavedTienda[];
  siguienteNumero: string;
}> {
  await requireAuth();
  await deleteTienda(id);
  const all = await listTienda();
  const siguienteNumero = await peekNextNumeroTienda();
  return { all, siguienteNumero };
}

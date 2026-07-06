"use server";

import { getSession } from "../lib/session";
import {
  listPrivadas,
  upsertPrivada,
  deletePrivada,
  peekNextNumero,
  type SavedCotizacionPrivada,
} from "../lib/store-privadas";
import type { CotizacionPrivadaData } from "../lib/cotizacion-privada";

async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
}

export async function savePrivada(input: {
  id?: string | null;
  data: CotizacionPrivadaData;
}): Promise<{
  saved: SavedCotizacionPrivada;
  all: SavedCotizacionPrivada[];
  siguienteNumero: string;
}> {
  await requireAuth();
  const { saved, siguienteNumero } = await upsertPrivada(input);
  const all = await listPrivadas();
  return { saved, all, siguienteNumero };
}

export async function removePrivada(id: string): Promise<{
  all: SavedCotizacionPrivada[];
  siguienteNumero: string;
}> {
  await requireAuth();
  await deletePrivada(id);
  const all = await listPrivadas();
  const siguienteNumero = await peekNextNumero();
  return { all, siguienteNumero };
}

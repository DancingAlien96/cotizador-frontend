"use server";

import { getSession } from "../lib/session";
import { apiFrases, type CampoFrase } from "../lib/api";

export async function listFrases(campo: CampoFrase, q: string): Promise<string[]> {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
  try {
    return await apiFrases(campo, q);
  } catch {
    // El autocompletado nunca debe romper la edición: si falla, sin sugerencias.
    return [];
  }
}

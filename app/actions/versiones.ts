"use server";

import { getSession } from "../lib/session";
import {
  apiSaveVersion,
  apiVersion,
  apiVersiones,
  type ApiRecord,
  type Resumen,
  type VersionMeta,
} from "../lib/api";

// Guarda `data` como una nueva versión de la cotización `id` (archiva la
// anterior). Devuelve la fila viva ya actualizada (con su nuevo `version`).
export async function guardarVersion(
  tipo: string,
  id: string,
  body: { data: unknown } & Resumen,
): Promise<ApiRecord> {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
  return apiSaveVersion(tipo, id, body);
}

export async function listarVersiones(
  tipo: string,
  id: string,
): Promise<VersionMeta[]> {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
  try {
    return await apiVersiones(tipo, id);
  } catch {
    return [];
  }
}

export async function abrirVersion(
  tipo: string,
  versionId: string,
): Promise<(VersionMeta & { data: unknown }) | null> {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
  try {
    return await apiVersion(tipo, versionId);
  } catch {
    return null;
  }
}

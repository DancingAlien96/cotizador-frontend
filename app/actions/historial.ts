"use server";

import { getSession } from "../lib/session";
import { apiHistorial, type HistorialItem } from "../lib/api";

export async function fetchHistorial(params: {
  tipo?: string;
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: HistorialItem[]; total: number; limit: number; offset: number }> {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
  return apiHistorial(params);
}

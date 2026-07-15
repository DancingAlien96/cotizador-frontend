"use server";

import { getSession } from "../lib/session";
import { apiReporte, type Reporte } from "../lib/api";

export async function fetchReporte(params: {
  desde?: string;
  hasta?: string;
  tipo?: string;
}): Promise<Reporte> {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
  return apiReporte(params);
}

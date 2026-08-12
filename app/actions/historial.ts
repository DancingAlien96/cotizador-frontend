"use server";

import { getSession } from "../lib/session";
import {
  apiAlertas,
  apiDelete,
  apiHistorial,
  apiSetEstado,
  apiSetSeguimiento,
  apiTablero,
  type Alertas,
  type ColumnaTablero,
  type Estado,
  type HistorialItem,
} from "../lib/api";

export async function fetchAlertas(): Promise<Alertas> {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
  return apiAlertas();
}

// Elimina una cotización (y sus versiones) desde la vista de Seguimiento.
// `tipo` llega en mayúsculas (TIENDA, EMPRESAS…); la API lo espera en minúsculas.
export async function eliminarCotizacion(tipo: string, id: string): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
  await apiDelete(tipo.toLowerCase(), id);
}

export async function setSeguimiento(params: {
  tipo: string;
  id: string;
  fecha: string | null;
}): Promise<{ seguimientoAt: string | null }> {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
  const res = await apiSetSeguimiento(
    params.tipo.toLowerCase(),
    params.id,
    params.fecha,
  );
  return { seguimientoAt: res.seguimientoAt };
}

export async function fetchTablero(params: {
  tipo?: string;
  q?: string;
}): Promise<{ columnas: ColumnaTablero[]; porColumna: number }> {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
  return apiTablero(params);
}

export async function fetchHistorial(params: {
  tipo?: string;
  estado?: string;
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: HistorialItem[]; total: number; limit: number; offset: number }> {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
  return apiHistorial(params);
}

export async function setEstado(params: {
  tipo: string;
  id: string;
  estado: Estado;
  motivoRechazo?: string | null;
}): Promise<{ estado: Estado; motivoRechazo: string | null }> {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
  const res = await apiSetEstado(
    params.tipo.toLowerCase(),
    params.id,
    params.estado,
    params.motivoRechazo,
  );
  return { estado: res.estado, motivoRechazo: res.motivoRechazo };
}

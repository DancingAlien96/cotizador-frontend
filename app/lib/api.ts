// Cliente del backend (Cotizador API). Se usa solo del lado servidor
// (Server Actions / Server Components). Obtiene un token con la contraseña
// compartida y lo cachea en memoria del proceso.

import { getSessionToken } from "./session";

const BASE = process.env.BACKEND_URL || "http://localhost:4000";

// Tipos de cotización válidos (allowlist para los segmentos de ruta).
const TIPOS = new Set(["tienda", "guatecompras", "empresas", "carta", "piscina"]);

function safeTipo(tipo: string): string {
  if (!TIPOS.has(tipo)) throw new Error(`Tipo de cotización inválido: ${tipo}`);
  return tipo;
}

function safeId(id: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(id)) throw new Error("Identificador inválido.");
  return id;
}

// Estados de seguimiento del CRM. Como con `tipo`, la API los devuelve en
// mayúsculas (enum de Prisma) y acepta el parámetro sin importar la caja.
export const ESTADOS = [
  "PENDIENTE",
  "EN_CURSO",
  "CONFIRMADA",
  "RECHAZADA",
] as const;
export type Estado = (typeof ESTADOS)[number];

function safeEstado(estado: string): Estado {
  const e = estado.toUpperCase() as Estado;
  if (!ESTADOS.includes(e)) throw new Error(`Estado inválido: ${estado}`);
  return e;
}

export type ApiRecord = {
  id: string;
  tipo: string;
  numero: string | null;
  nombre?: string | null;
  autor?: string | null;
  data: unknown;
  createdAt: string;
  updatedAt: string;
};

// Usa el JWT del usuario (cookie de sesión) para llamar a la API.
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getSessionToken();
  if (!token) {
    throw new Error("No autenticado.");
  }
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Backend respondió ${res.status} en ${path}`);
  }
  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

export function apiList(tipo: string): Promise<ApiRecord[]> {
  return request<ApiRecord[]>(`/api/cotizaciones/${safeTipo(tipo)}`);
}

export function apiNextNumero(tipo: string): Promise<{ numero: string }> {
  return request<{ numero: string }>(
    `/api/cotizaciones/${safeTipo(tipo)}/next-numero`,
  );
}

export type Resumen = {
  nombre?: string | null;
  autor?: string | null;
  cliente?: string | null;
  total?: number | null;
  fecha?: string | null;
};

export function apiUpsert(
  tipo: string,
  body: { id?: string | null; data: unknown } & Resumen,
): Promise<ApiRecord> {
  return request<ApiRecord>(`/api/cotizaciones/${safeTipo(tipo)}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type HistorialItem = {
  id: string;
  tipo: string;
  numero: string | null;
  nombre: string | null;
  autor: string | null;
  cliente: string | null;
  total: number | null;
  fecha: string | null;
  estado: Estado;
  motivoRechazo: string | null;
  estadoAt: string;
  updatedAt: string;
};

export function apiHistorial(params: {
  tipo?: string;
  estado?: string;
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: HistorialItem[]; total: number; limit: number; offset: number }> {
  const sp = new URLSearchParams();
  if (params.tipo) sp.set("tipo", params.tipo);
  if (params.estado) sp.set("estado", safeEstado(params.estado));
  if (params.q) sp.set("q", params.q);
  if (params.limit != null) sp.set("limit", String(params.limit));
  if (params.offset != null) sp.set("offset", String(params.offset));
  return request(`/api/historial?${sp.toString()}`);
}

export type ColumnaTablero = {
  estado: Estado;
  items: HistorialItem[];
  total: number;
  monto: number;
};

export function apiTablero(params: {
  tipo?: string;
  q?: string;
}): Promise<{ columnas: ColumnaTablero[]; porColumna: number }> {
  const sp = new URLSearchParams();
  if (params.tipo) sp.set("tipo", params.tipo);
  if (params.q) sp.set("q", params.q);
  return request(`/api/historial/tablero?${sp.toString()}`);
}

export function apiSetEstado(
  tipo: string,
  id: string,
  estado: Estado,
  motivoRechazo?: string | null,
): Promise<{ id: string; estado: Estado; motivoRechazo: string | null; estadoAt: string }> {
  return request(
    `/api/cotizaciones/${safeTipo(tipo)}/${encodeURIComponent(safeId(id))}/estado`,
    {
      method: "PATCH",
      body: JSON.stringify({ estado: safeEstado(estado), motivoRechazo }),
    },
  );
}

export type Cliente = {
  id: string;
  nombre: string;
  nit: string | null;
  direccion: string | null;
  telefono: string | null;
  correo: string | null;
  contacto: string | null;
  notas: string | null;
  updatedAt: string;
};

export function apiClientes(params: { q?: string } = {}): Promise<Cliente[]> {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  return request<Cliente[]>(`/api/clientes?${sp.toString()}`);
}

export function apiUpsertCliente(
  body: Partial<Cliente> & { nombre: string },
): Promise<Cliente> {
  return request<Cliente>("/api/clientes", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function apiDeleteCliente(id: string): Promise<void> {
  return request<void>(`/api/clientes/${encodeURIComponent(safeId(id))}`, {
    method: "DELETE",
  });
}

export function apiDelete(tipo: string, id: string): Promise<void> {
  return request<void>(
    `/api/cotizaciones/${safeTipo(tipo)}/${encodeURIComponent(safeId(id))}`,
    { method: "DELETE" },
  );
}

export function ts(iso: string): number {
  return new Date(iso).getTime();
}

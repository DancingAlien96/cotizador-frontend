import {
  apiList,
  apiUpsert,
  apiDelete,
  apiNextNumero,
  ts,
  type ApiRecord,
} from "./api";
import type { CotizacionPrivadaData } from "./cotizacion-privada";

// Nota: este store corresponde a "Cotizaciones de empresas" (tipo `empresas`
// en el backend), con folio autogenerado.

export type SavedCotizacionPrivada = {
  id: string;
  numero: string;
  data: CotizacionPrivadaData;
  createdAt: number;
  updatedAt: number;
};

const TIPO = "empresas";

function map(r: ApiRecord): SavedCotizacionPrivada {
  return {
    id: r.id,
    numero: r.numero ?? "",
    data: r.data as CotizacionPrivadaData,
    createdAt: ts(r.createdAt),
    updatedAt: ts(r.updatedAt),
  };
}

export async function listPrivadas(): Promise<SavedCotizacionPrivada[]> {
  return (await apiList(TIPO)).map(map);
}

export async function peekNextNumero(): Promise<string> {
  return (await apiNextNumero(TIPO)).numero;
}

export async function upsertPrivada(input: {
  id?: string | null;
  data: CotizacionPrivadaData;
}): Promise<{ saved: SavedCotizacionPrivada; siguienteNumero: string }> {
  const saved = map(await apiUpsert(TIPO, { id: input.id, data: input.data }));
  const siguienteNumero = await peekNextNumero();
  return { saved, siguienteNumero };
}

export async function deletePrivada(id: string): Promise<void> {
  await apiDelete(TIPO, id);
}

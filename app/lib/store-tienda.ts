import {
  apiList,
  apiUpsert,
  apiDelete,
  apiNextNumero,
  ts,
  type ApiRecord,
} from "./api";
import { totalTienda, type CotizacionTiendaData } from "./cotizacion-tienda";

export type SavedTienda = {
  id: string;
  numero: string;
  nombre: string;
  autor: string;
  data: CotizacionTiendaData;
  createdAt: number;
  updatedAt: number;
};

const TIPO = "tienda";

function map(r: ApiRecord): SavedTienda {
  return {
    id: r.id,
    numero: r.numero ?? "",
    nombre: r.nombre ?? "",
    autor: r.autor ?? "",
    data: r.data as CotizacionTiendaData,
    createdAt: ts(r.createdAt),
    updatedAt: ts(r.updatedAt),
  };
}

export async function listTienda(): Promise<SavedTienda[]> {
  return (await apiList(TIPO)).map(map);
}

export async function peekNextNumeroTienda(): Promise<string> {
  return (await apiNextNumero(TIPO)).numero;
}

export async function upsertTienda(input: {
  id?: string | null;
  nombre?: string;
  autor?: string;
  data: CotizacionTiendaData;
}): Promise<{ saved: SavedTienda; siguienteNumero: string }> {
  const saved = map(
    await apiUpsert(TIPO, {
      id: input.id,
      data: input.data,
      nombre: input.nombre,
      autor: input.autor,
      cliente: input.data.cliente,
      total: totalTienda(input.data.items, input.data.otros),
      fecha: input.data.fecha,
    }),
  );
  const siguienteNumero = await peekNextNumeroTienda();
  return { saved, siguienteNumero };
}

export async function deleteTienda(id: string): Promise<void> {
  await apiDelete(TIPO, id);
}

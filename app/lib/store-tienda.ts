import { apiList, apiUpsert, apiDelete, ts, type ApiRecord } from "./api";
import { totalTienda, type CotizacionTiendaData } from "./cotizacion-tienda";

export type SavedTienda = {
  id: string;
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

export async function upsertTienda(input: {
  id?: string | null;
  nombre?: string;
  autor?: string;
  data: CotizacionTiendaData;
}): Promise<SavedTienda> {
  return map(
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
}

export async function deleteTienda(id: string): Promise<void> {
  await apiDelete(TIPO, id);
}

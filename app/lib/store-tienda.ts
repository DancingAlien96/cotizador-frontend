import { apiList, apiUpsert, apiDelete, ts, type ApiRecord } from "./api";
import type { CotizacionTiendaData } from "./cotizacion-tienda";

export type SavedTienda = {
  id: string;
  data: CotizacionTiendaData;
  createdAt: number;
  updatedAt: number;
};

const TIPO = "tienda";

function map(r: ApiRecord): SavedTienda {
  return {
    id: r.id,
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
  data: CotizacionTiendaData;
}): Promise<SavedTienda> {
  return map(await apiUpsert(TIPO, { id: input.id, data: input.data }));
}

export async function deleteTienda(id: string): Promise<void> {
  await apiDelete(TIPO, id);
}

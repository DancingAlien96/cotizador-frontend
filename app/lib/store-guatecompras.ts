import { apiList, apiUpsert, apiDelete, ts, type ApiRecord } from "./api";
import type { CotizacionGuatecomprasData } from "./cotizacion-guatecompras";
import { totalGeneral } from "./cotizacion-privada";

export type SavedGuatecompras = {
  id: string;
  nombre: string;
  autor: string;
  data: CotizacionGuatecomprasData;
  createdAt: number;
  updatedAt: number;
};

const TIPO = "guatecompras";

function map(r: ApiRecord): SavedGuatecompras {
  return {
    id: r.id,
    nombre: r.nombre ?? "",
    autor: r.autor ?? "",
    data: r.data as CotizacionGuatecomprasData,
    createdAt: ts(r.createdAt),
    updatedAt: ts(r.updatedAt),
  };
}

export async function listGuatecompras(): Promise<SavedGuatecompras[]> {
  return (await apiList(TIPO)).map(map);
}

export async function upsertGuatecompras(input: {
  id?: string | null;
  nombre?: string;
  autor?: string;
  data: CotizacionGuatecomprasData;
}): Promise<SavedGuatecompras> {
  return map(
    await apiUpsert(TIPO, {
      id: input.id,
      data: input.data,
      nombre: input.nombre,
      autor: input.autor,
      cliente: input.data.cotizacionA,
      total: totalGeneral(input.data.items),
      fecha: input.data.fecha,
    }),
  );
}

export async function deleteGuatecompras(id: string): Promise<void> {
  await apiDelete(TIPO, id);
}

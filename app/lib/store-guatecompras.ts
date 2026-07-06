import { apiList, apiUpsert, apiDelete, ts, type ApiRecord } from "./api";
import type { CotizacionGuatecomprasData } from "./cotizacion-guatecompras";

export type SavedGuatecompras = {
  id: string;
  data: CotizacionGuatecomprasData;
  createdAt: number;
  updatedAt: number;
};

const TIPO = "guatecompras";

function map(r: ApiRecord): SavedGuatecompras {
  return {
    id: r.id,
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
  data: CotizacionGuatecomprasData;
}): Promise<SavedGuatecompras> {
  return map(await apiUpsert(TIPO, { id: input.id, data: input.data }));
}

export async function deleteGuatecompras(id: string): Promise<void> {
  await apiDelete(TIPO, id);
}

import { apiList, apiUpsert, apiDelete, ts, type ApiRecord } from "./api";
import type { PropuestaPiscinaData } from "./propuesta-piscina";

export type SavedPiscina = {
  id: string;
  data: PropuestaPiscinaData;
  createdAt: number;
  updatedAt: number;
};

const TIPO = "piscina";

function map(r: ApiRecord): SavedPiscina {
  return {
    id: r.id,
    data: r.data as PropuestaPiscinaData,
    createdAt: ts(r.createdAt),
    updatedAt: ts(r.updatedAt),
  };
}

export async function listPiscina(): Promise<SavedPiscina[]> {
  return (await apiList(TIPO)).map(map);
}

export async function upsertPiscina(input: {
  id?: string | null;
  data: PropuestaPiscinaData;
}): Promise<SavedPiscina> {
  return map(await apiUpsert(TIPO, { id: input.id, data: input.data }));
}

export async function deletePiscina(id: string): Promise<void> {
  await apiDelete(TIPO, id);
}

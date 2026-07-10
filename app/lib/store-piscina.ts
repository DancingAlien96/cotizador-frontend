import { apiList, apiUpsert, apiDelete, ts, type ApiRecord } from "./api";
import { totalConIva, type PropuestaPiscinaData } from "./propuesta-piscina";

export type SavedPiscina = {
  id: string;
  nombre: string;
  autor: string;
  data: PropuestaPiscinaData;
  createdAt: number;
  updatedAt: number;
};

const TIPO = "piscina";

function map(r: ApiRecord): SavedPiscina {
  return {
    id: r.id,
    nombre: r.nombre ?? "",
    autor: r.autor ?? "",
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
  nombre?: string;
  autor?: string;
  data: PropuestaPiscinaData;
}): Promise<SavedPiscina> {
  return map(
    await apiUpsert(TIPO, {
      id: input.id,
      data: input.data,
      nombre: input.nombre,
      autor: input.autor,
      cliente: input.data.cliente,
      total: totalConIva(input.data.subtotalOp2),
      fecha: input.data.fechaEmision,
    }),
  );
}

export async function deletePiscina(id: string): Promise<void> {
  await apiDelete(TIPO, id);
}

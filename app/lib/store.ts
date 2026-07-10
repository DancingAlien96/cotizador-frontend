import { apiList, apiUpsert, apiDelete, ts, type ApiRecord } from "./api";
import type { CartaData } from "./carta";

export type SavedCotizacion = {
  id: string;
  nombre: string;
  autor: string;
  data: CartaData;
  createdAt: number;
  updatedAt: number;
};

const TIPO = "carta";

// La carta se guarda como envoltorio { nombre, carta } dentro de `data`
// (compatibilidad); el nombre/autor también van en columnas para el historial.
type CartaEnvelope = { nombre: string; carta: CartaData };

function map(r: ApiRecord): SavedCotizacion {
  const env = r.data as CartaEnvelope;
  return {
    id: r.id,
    nombre: r.nombre ?? env?.nombre ?? "",
    autor: r.autor ?? "",
    data: env?.carta ?? ({} as CartaData),
    createdAt: ts(r.createdAt),
    updatedAt: ts(r.updatedAt),
  };
}

export async function listCotizaciones(): Promise<SavedCotizacion[]> {
  return (await apiList(TIPO)).map(map);
}

export async function upsertCotizacion(input: {
  id?: string | null;
  nombre: string;
  autor?: string;
  data: CartaData;
}): Promise<SavedCotizacion> {
  const envelope: CartaEnvelope = { nombre: input.nombre, carta: input.data };
  return map(
    await apiUpsert(TIPO, {
      id: input.id,
      data: envelope,
      nombre: input.nombre,
      autor: input.autor,
      cliente: input.data.institucion || input.nombre,
      fecha: input.data.fecha,
    }),
  );
}

export async function deleteCotizacion(id: string): Promise<void> {
  await apiDelete(TIPO, id);
}

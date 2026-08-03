"use server";

import { getSession } from "../lib/session";
import { apiProductos, type Producto } from "../lib/api";

export async function buscarProductos(search: string): Promise<Producto[]> {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
  try {
    return await apiProductos(search);
  } catch {
    // Si el inventario no responde, el buscador queda vacío (no rompe la edición).
    return [];
  }
}

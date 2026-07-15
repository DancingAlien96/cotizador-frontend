"use server";

import { getSession } from "../lib/session";
import {
  apiClientes,
  apiDeleteCliente,
  apiUpsertCliente,
  type Cliente,
} from "../lib/api";

export async function listClientes(q = ""): Promise<Cliente[]> {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
  return apiClientes({ q });
}

export async function saveCliente(
  body: Partial<Cliente> & { nombre: string },
): Promise<Cliente> {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
  return apiUpsertCliente(body);
}

export async function removeCliente(id: string): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
  await apiDeleteCliente(id);
}

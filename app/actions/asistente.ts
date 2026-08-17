"use server";

import { getSession } from "../lib/session";
import { apiAsistente, apiAsistenteEstado, type MensajeChat } from "../lib/api";

// ¿El asistente está configurado en el backend? (hay API key).
export async function asistenteConfigurado(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  try {
    const { configurado } = await apiAsistenteEstado();
    return configurado;
  } catch {
    return false;
  }
}

// Envía la conversación y devuelve la respuesta del asistente.
export async function preguntarAsistente(
  mensajes: MensajeChat[],
): Promise<string> {
  const session = await getSession();
  if (!session) throw new Error("No autorizado.");
  const { reply } = await apiAsistente(mensajes);
  return reply;
}

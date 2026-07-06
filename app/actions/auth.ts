"use server";

import { redirect } from "next/navigation";
import { setSession, clearSession } from "../lib/session";

export async function login(
  _prev: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.APP_PASSWORD || "cotizador2026";

  if (!password || password !== expected) {
    return "Contraseña incorrecta.";
  }

  await setSession("admin");
  redirect("/");
}

export async function logout(): Promise<void> {
  await clearSession();
  redirect("/login");
}

"use server";

import { redirect } from "next/navigation";
import { setSessionToken, clearSession } from "../lib/session";

const BACKEND = process.env.BACKEND_URL || "http://localhost:4000";

export async function login(
  _prev: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return "Ingresa tu correo y contraseña.";
  }

  let token: string;
  try {
    const res = await fetch(`${BACKEND}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    if (!res.ok) {
      return "Credenciales inválidas.";
    }
    token = (await res.json()).token;
  } catch {
    return "No se pudo conectar con el servidor. Intenta más tarde.";
  }

  await setSessionToken(token);
  redirect("/");
}

export async function logout(): Promise<void> {
  await clearSession();
  redirect("/login");
}

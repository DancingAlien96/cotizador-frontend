import { cookies } from "next/headers";
import {
  verifyToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  type SessionData,
} from "./token";

export async function getSession(): Promise<SessionData | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifyToken(token);
}

// Token JWT crudo de la cookie (para llamar a la API del backend).
export async function getSessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function setSessionToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

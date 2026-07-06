import crypto from "node:crypto";

// Verificación del JWT del backend, SIN depender de `next/headers`, para poder
// importarlo desde `proxy.ts` (se ejecuta en cada request).

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días (segundos)

export type SessionData = {
  sub: string; // id del usuario
  email: string;
  exp: number; // segundos (estándar JWT)
};

// Verifica un JWT HS256 emitido por el backend (mismo JWT_SECRET en ambos).
export function verifyToken(token?: string): SessionData | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  const [header, payload, signature] = parts;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data.exp === "number" && data.exp * 1000 < Date.now()) {
      return null;
    }
    if (typeof data.sub !== "string") return null;
    return { sub: data.sub, email: String(data.email ?? ""), exp: data.exp };
  } catch {
    return null;
  }
}

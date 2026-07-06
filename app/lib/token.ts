import crypto from "node:crypto";

// Session token helpers with NO dependency on `next/headers`, so this module
// is safe to import from `proxy.ts` (which runs on every request).

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días (segundos)

const SECRET =
  process.env.SESSION_SECRET || "dev-insecure-secret-cambia-esto-en-produccion";

export type SessionData = { u: string; exp: number };

function sign(data: string): string {
  return crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
}

export function createToken(user: string): string {
  const exp = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = Buffer.from(JSON.stringify({ u: user, exp })).toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token?: string): SessionData | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    ) as SessionData;
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

// Cliente del backend (Cotizador API). Se usa solo del lado servidor
// (Server Actions / Server Components). Obtiene un token con la contraseña
// compartida y lo cachea en memoria del proceso.

const BASE = process.env.BACKEND_URL || "http://localhost:4000";
const PASSWORD = process.env.APP_PASSWORD || "cotizador2026";

export type ApiRecord = {
  id: string;
  tipo: string;
  numero: string | null;
  data: unknown;
  createdAt: string;
  updatedAt: string;
};

let cachedToken: string | null = null;

async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: PASSWORD }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`No se pudo autenticar contra el backend (${res.status}).`);
  }
  const { token } = (await res.json()) as { token: string };
  cachedToken = token;
  return token;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (res.status === 401 && retry) {
    cachedToken = null;
    return request<T>(path, options, false);
  }
  if (!res.ok) {
    throw new Error(`Backend respondió ${res.status} en ${path}`);
  }
  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

export function apiList(tipo: string): Promise<ApiRecord[]> {
  return request<ApiRecord[]>(`/api/cotizaciones/${tipo}`);
}

export function apiNextNumero(tipo: string): Promise<{ numero: string }> {
  return request<{ numero: string }>(`/api/cotizaciones/${tipo}/next-numero`);
}

export function apiUpsert(
  tipo: string,
  body: { id?: string | null; data: unknown },
): Promise<ApiRecord> {
  return request<ApiRecord>(`/api/cotizaciones/${tipo}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function apiDelete(tipo: string, id: string): Promise<void> {
  return request<void>(`/api/cotizaciones/${tipo}/${id}`, { method: "DELETE" });
}

export function ts(iso: string): number {
  return new Date(iso).getTime();
}

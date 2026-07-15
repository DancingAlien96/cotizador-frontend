"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { fetchHistorial } from "../actions/historial";
import { formatQ } from "../lib/cotizacion-privada";
import type { HistorialItem } from "../lib/api";

const LIMIT = 20;

const TIPO_INFO: Record<string, { label: string; ruta: string; color: string }> = {
  TIENDA: { label: "Tienda", ruta: "/cotizaciones?formato=tienda", color: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300" },
  GUATECOMPRAS: { label: "Guatecompras", ruta: "/guatecompras/cotizacion", color: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300" },
  EMPRESAS: { label: "Empresas", ruta: "/cotizaciones?formato=empresas", color: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" },
  CARTA: { label: "Carta de Garantía", ruta: "/guatecompras/carta-garantia", color: "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300" },
  PISCINA: { label: "Piscina", ruta: "/construccion-piscina", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300" },
};

const FILTROS = [
  { value: "", label: "Todos" },
  { value: "tienda", label: "Tienda" },
  { value: "guatecompras", label: "Guatecompras" },
  { value: "empresas", label: "Empresas" },
  { value: "carta", label: "Carta de Garantía" },
  { value: "piscina", label: "Piscina" },
];

export function HistorialGlobal({
  initial,
}: {
  initial: { items: HistorialItem[]; total: number };
}) {
  const [items, setItems] = useState<HistorialItem[]>(initial.items);
  const [total, setTotal] = useState(initial.total);
  const [tipo, setTipo] = useState("");
  const [q, setQ] = useState("");
  const [offset, setOffset] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [firstRun, setFirstRun] = useState(true);

  useEffect(() => {
    // Evita re-consultar en el primer render (ya tenemos `initial`).
    if (firstRun) {
      setFirstRun(false);
      return;
    }
    const t = setTimeout(() => {
      startTransition(async () => {
        const res = await fetchHistorial({ tipo, q, limit: LIMIT, offset });
        setItems(res.items);
        setTotal(res.total);
      });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, q, offset]);

  const desde = total === 0 ? 0 : offset + 1;
  const hasta = Math.min(offset + LIMIT, total);

  return (
    <section className="mt-12">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
          Historial de cotizaciones
        </h2>
        <div className="flex gap-2">
          <select
            value={tipo}
            onChange={(e) => {
              setOffset(0);
              setTipo(e.target.value);
            }}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 outline-none focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            {FILTROS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <input
            value={q}
            onChange={(e) => {
              setOffset(0);
              setQ(e.target.value);
            }}
            placeholder="Buscar cliente o No.…"
            className="w-56 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 outline-none focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
              <th className="px-4 py-2.5 font-medium">Tipo</th>
              <th className="px-4 py-2.5 font-medium">Nombre / Cliente</th>
              <th className="px-4 py-2.5 font-medium">Autor</th>
              <th className="px-4 py-2.5 font-medium">No.</th>
              <th className="px-4 py-2.5 text-right font-medium">Total</th>
              <th className="px-4 py-2.5 font-medium">Fecha</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className={isPending ? "opacity-50" : ""}>
            {items.map((it) => {
              const info = TIPO_INFO[it.tipo] ?? {
                label: it.tipo,
                ruta: "/",
                color: "bg-zinc-100 text-zinc-700",
              };
              return (
                <tr
                  key={it.id}
                  className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${info.color}`}>
                      {info.label}
                    </span>
                  </td>
                  <td className="max-w-xs px-4 py-2.5">
                    <span className="block truncate text-zinc-800 dark:text-zinc-100">
                      {it.nombre || it.cliente || "—"}
                    </span>
                    {it.nombre && it.cliente && (
                      <span className="block truncate text-[11px] text-zinc-400">
                        {it.cliente}
                      </span>
                    )}
                  </td>
                  <td className="max-w-[10rem] truncate px-4 py-2.5 text-zinc-500">
                    {it.autor || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-500">{it.numero || "—"}</td>
                  <td className="px-4 py-2.5 text-right text-zinc-700 dark:text-zinc-300">
                    {it.total != null ? formatQ(it.total) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-500">{it.fecha || "—"}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      href={`${info.ruta}${info.ruta.includes("?") ? "&" : "?"}id=${it.id}`}
                      className="font-medium text-teal-700 hover:underline"
                    >
                      Abrir →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-zinc-400">
                  No hay cotizaciones que coincidan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <div className="mt-3 flex items-center justify-between text-sm text-zinc-500">
          <span>
            {desde}–{hasta} de {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - LIMIT))}
              disabled={offset === 0 || isPending}
              className="rounded-md border border-zinc-300 px-3 py-1 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setOffset(offset + LIMIT)}
              disabled={hasta >= total || isPending}
              className="rounded-md border border-zinc-300 px-3 py-1 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

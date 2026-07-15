"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { fetchHistorial, setEstado, setSeguimiento } from "../actions/historial";
import { formatQ } from "../lib/cotizacion-privada";
import type { Estado, HistorialItem } from "../lib/api";
import { ESTADO_INFO, ESTADO_ORDEN } from "../lib/estados";
import { tipoInfo, rutaAbrir } from "../lib/tipos";
import { EstadoSelect } from "./estado-select";
import { SeguimientoFecha } from "./seguimiento-fecha";
import { Tablero } from "./tablero";

const LIMIT = 20;

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
  initialQ = "",
}: {
  initial: { items: HistorialItem[]; total: number };
  initialQ?: string;
}) {
  const [items, setItems] = useState<HistorialItem[]>(initial.items);
  const [total, setTotal] = useState(initial.total);
  const [tipo, setTipo] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [q, setQ] = useState(initialQ);
  const [offset, setOffset] = useState(0);
  const [vista, setVista] = useState<"lista" | "tablero">("lista");
  const [isPending, startTransition] = useTransition();
  // Aparte del listado: cambiar estado es optimista y no debe atenuar la tabla.
  const [, startEstadoTransition] = useTransition();
  const [firstRun, setFirstRun] = useState(true);

  useEffect(() => {
    // Evita re-consultar en el primer render (ya tenemos `initial`).
    if (firstRun) {
      setFirstRun(false);
      return;
    }
    // El tablero trae sus propios datos; al volver a la lista se re-consulta
    // para reflejar lo que se haya movido allá.
    if (vista !== "lista") return;
    const t = setTimeout(() => {
      startTransition(async () => {
        const res = await fetchHistorial({
          tipo,
          estado: estadoFiltro,
          q,
          limit: LIMIT,
          offset,
        });
        setItems(res.items);
        setTotal(res.total);
      });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, estadoFiltro, q, offset, vista]);

  // Optimista: la píldora cambia de una vez y se revierte si la API falla.
  function cambiarEstado(it: HistorialItem, estado: Estado, motivo?: string | null) {
    const antes = items;
    setItems((prev) =>
      prev.map((x) =>
        x.id === it.id ? { ...x, estado, motivoRechazo: motivo ?? null } : x,
      ),
    );
    startEstadoTransition(async () => {
      try {
        await setEstado({ tipo: it.tipo, id: it.id, estado, motivoRechazo: motivo });
      } catch {
        setItems(antes);
      }
    });
  }

  function cambiarSeguimiento(it: HistorialItem, fecha: string | null) {
    const antes = items;
    setItems((prev) =>
      prev.map((x) => (x.id === it.id ? { ...x, seguimientoAt: fecha } : x)),
    );
    startEstadoTransition(async () => {
      try {
        await setSeguimiento({ tipo: it.tipo, id: it.id, fecha });
      } catch {
        setItems(antes);
      }
    });
  }

  const desde = total === 0 ? 0 : offset + 1;
  const hasta = Math.min(offset + LIMIT, total);

  return (
    <section className="mt-12">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
            Seguimiento de cotizaciones
          </h2>
          <div className="flex rounded-lg border border-zinc-300 p-0.5 text-sm dark:border-zinc-700">
            {(["lista", "tablero"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVista(v)}
                className={`rounded-md px-2.5 py-1 capitalize transition-colors ${
                  vista === v
                    ? "bg-teal-600 font-medium text-white"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {v === "lista" ? "Lista" : "Tablero"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
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
          {/* En el tablero las columnas ya son los estados. */}
          {vista === "lista" && (
            <select
              value={estadoFiltro}
              onChange={(e) => {
                setOffset(0);
                setEstadoFiltro(e.target.value);
              }}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 outline-none focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="">Todos los estados</option>
              {ESTADO_ORDEN.map((e) => (
                <option key={e} value={e}>
                  {ESTADO_INFO[e].label}
                </option>
              ))}
            </select>
          )}
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

      {vista === "tablero" && <Tablero tipo={tipo} q={q} />}

      {vista === "lista" && (
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
              <th className="px-4 py-2.5 font-medium">Tipo</th>
              <th className="px-4 py-2.5 font-medium">Nombre / Cliente</th>
              <th className="px-4 py-2.5 font-medium">Estado</th>
              <th className="px-4 py-2.5 font-medium">Recordar</th>
              <th className="px-4 py-2.5 font-medium">Autor</th>
              <th className="px-4 py-2.5 font-medium">No.</th>
              <th className="px-4 py-2.5 text-right font-medium">Total</th>
              <th className="px-4 py-2.5 font-medium">Fecha</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className={isPending ? "opacity-50" : ""}>
            {items.map((it) => {
              const info = tipoInfo(it.tipo);
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
                  <td className="px-4 py-2.5">
                    <EstadoSelect
                      estado={it.estado}
                      motivoRechazo={it.motivoRechazo}
                      onChange={(e, motivo) => cambiarEstado(it, e, motivo)}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <SeguimientoFecha
                      valor={it.seguimientoAt}
                      onChange={(fecha) => cambiarSeguimiento(it, fecha)}
                    />
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
                      href={rutaAbrir(it)}
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
                <td colSpan={9} className="px-4 py-10 text-center text-zinc-400">
                  No hay cotizaciones que coincidan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {vista === "lista" && total > 0 && (
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

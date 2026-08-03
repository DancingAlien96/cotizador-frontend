"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { buscarProductos } from "../actions/productos";
import type { Producto } from "../lib/api";
import { formatQ } from "../lib/cotizacion-privada";

// Buscador del inventario externo (SoluPOS). Cada clic en un producto lo agrega
// a la cotización (onAgregar); se puede agregar varios antes de cerrar.
export function ProductoBuscador({
  onAgregar,
  onClose,
}: {
  onAgregar: (p: Producto) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pending, start] = useTransition();
  const [agregados, setAgregados] = useState(0);
  const [tocado, setTocado] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Busca mientras se escribe (con respiro). Solo a partir de 2 letras.
  useEffect(() => {
    if (q.trim().length < 2) {
      setProductos([]);
      return;
    }
    setTocado(true);
    const t = setTimeout(() => {
      start(async () => setProductos(await buscarProductos(q.trim())));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  function agregar(p: Producto) {
    onAgregar(p);
    setAgregados((n) => n + 1);
  }

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-16"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
              Agregar desde inventario
            </h3>
            {agregados > 0 && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                {agregados} agregado{agregados === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar producto por nombre…"
            autoComplete="off"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {pending && (
            <p className="px-3 py-4 text-center text-sm text-zinc-400">Buscando…</p>
          )}
          {!pending && q.trim().length >= 2 && productos.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-zinc-400">
              Sin resultados para “{q.trim()}”.
            </p>
          )}
          {!tocado && (
            <p className="px-3 py-4 text-center text-sm text-zinc-400">
              Escribe al menos 2 letras para buscar en el inventario.
            </p>
          )}
          <ul className="space-y-1">
            {productos.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => agregar(p)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2 text-left hover:border-teal-300 hover:bg-teal-50 dark:hover:border-teal-800 dark:hover:bg-teal-950/30"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-zinc-800 dark:text-zinc-100">
                      {p.nombre}
                    </span>
                    {p.categoria && (
                      <span className="block truncate text-[11px] text-zinc-400">
                        {p.categoria}
                      </span>
                    )}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {formatQ(p.precio)}
                    </span>
                    <span className="rounded-md bg-teal-600 px-2 py-0.5 text-xs font-medium text-white">
                      Agregar
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end border-t border-zinc-200 p-3 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}

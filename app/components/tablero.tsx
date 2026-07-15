"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { fetchTablero, setEstado } from "../actions/historial";
import { formatQ } from "../lib/cotizacion-privada";
import type { ColumnaTablero, Estado, HistorialItem } from "../lib/api";
import { ESTADO_INFO, ESTADO_ORDEN } from "../lib/estados";
import { tipoInfo, rutaAbrir } from "../lib/tipos";
import { MotivoRechazoDialog } from "./estado-select";

export function Tablero({ tipo, q }: { tipo: string; q: string }) {
  const [columnas, setColumnas] = useState<ColumnaTablero[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const [encima, setEncima] = useState<Estado | null>(null);
  // Movimiento a RECHAZADA en espera de que se elija el motivo.
  const [pendienteMotivo, setPendienteMotivo] = useState<HistorialItem | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      startTransition(async () => {
        setColumnas((await fetchTablero({ tipo, q })).columnas);
      });
    }, 250);
    return () => clearTimeout(t);
  }, [tipo, q]);

  function mover(item: HistorialItem, destino: Estado, motivo?: string | null) {
    if (item.estado === destino) return;
    const antes = columnas;
    // Optimista: la tarjeta salta de columna de una vez.
    setColumnas((prev) =>
      prev?.map((c) => {
        if (c.estado === item.estado) {
          return {
            ...c,
            items: c.items.filter((x) => x.id !== item.id),
            total: c.total - 1,
            monto: c.monto - (item.total ?? 0),
          };
        }
        if (c.estado === destino) {
          const movido = { ...item, estado: destino, motivoRechazo: motivo ?? null };
          return {
            ...c,
            items: [movido, ...c.items],
            total: c.total + 1,
            monto: c.monto + (item.total ?? 0),
          };
        }
        return c;
      }) ?? null,
    );
    startTransition(async () => {
      try {
        await setEstado({
          tipo: item.tipo,
          id: item.id,
          estado: destino,
          motivoRechazo: motivo,
        });
      } catch {
        setColumnas(antes);
      }
    });
  }

  function soltar(destino: Estado) {
    setEncima(null);
    const item = columnas?.flatMap((c) => c.items).find((x) => x.id === arrastrando);
    setArrastrando(null);
    if (!item || item.estado === destino) return;
    // Rechazar siempre pide motivo, igual que en el historial.
    if (destino === "RECHAZADA") {
      setPendienteMotivo(item);
      return;
    }
    mover(item, destino);
  }

  if (!columnas) {
    return (
      <div className="py-16 text-center text-sm text-zinc-400">
        Cargando tablero…
      </div>
    );
  }

  return (
    <>
      <div
        className={`grid gap-3 transition-opacity sm:grid-cols-2 lg:grid-cols-4 ${
          isPending ? "opacity-70" : ""
        }`}
      >
        {ESTADO_ORDEN.map((estado) => {
          const col =
            columnas.find((c) => c.estado === estado) ??
            ({ estado, items: [], total: 0, monto: 0 } as ColumnaTablero);
          const info = ESTADO_INFO[estado];
          const activa = encima === estado;
          return (
            <div
              key={estado}
              onDragOver={(e) => {
                e.preventDefault();
                setEncima(estado);
              }}
              onDragLeave={() => setEncima((v) => (v === estado ? null : v))}
              onDrop={() => soltar(estado)}
              className={`flex min-h-[16rem] flex-col rounded-xl border p-2.5 transition-colors ${
                activa
                  ? "border-teal-400 bg-teal-50/70 dark:border-teal-600 dark:bg-teal-950/30"
                  : "border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-900/50"
              }`}
            >
              <div className="mb-2 flex items-baseline justify-between px-1">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  <span className={`h-2 w-2 rounded-full ${info.dot}`} />
                  {info.label}
                  <span className="text-xs font-normal text-zinc-400">
                    {col.total}
                  </span>
                </span>
                {col.monto > 0 && (
                  <span className="text-[11px] font-medium text-zinc-500">
                    {formatQ(col.monto)}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2">
                {col.items.map((it) => (
                  <TarjetaCotizacion
                    key={it.id}
                    item={it}
                    arrastrando={arrastrando === it.id}
                    onDragStart={() => setArrastrando(it.id)}
                    onDragEnd={() => setArrastrando(null)}
                  />
                ))}
                {col.items.length === 0 && (
                  <p className="px-1 py-6 text-center text-xs text-zinc-400">
                    {activa ? "Suelta aquí" : "Sin cotizaciones"}
                  </p>
                )}
                {col.total > col.items.length && (
                  <p className="px-1 pt-1 text-center text-[11px] text-zinc-400">
                    +{col.total - col.items.length} más — usa la vista de lista
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {pendienteMotivo && (
        <MotivoRechazoDialog
          onCancel={() => setPendienteMotivo(null)}
          onConfirm={(motivo) => {
            const item = pendienteMotivo;
            setPendienteMotivo(null);
            mover(item, "RECHAZADA", motivo);
          }}
        />
      )}
    </>
  );
}

function TarjetaCotizacion({
  item,
  arrastrando,
  onDragStart,
  onDragEnd,
}: {
  item: HistorialItem;
  arrastrando: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const info = tipoInfo(item.tipo);
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`cursor-grab rounded-lg border border-zinc-200 bg-white p-2.5 shadow-sm transition-opacity active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-800 ${
        arrastrando ? "opacity-40" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="line-clamp-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">
          {item.nombre || item.cliente || "Sin nombre"}
        </span>
        {item.total != null && (
          <span className="shrink-0 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {formatQ(item.total)}
          </span>
        )}
      </div>

      {item.nombre && item.cliente && (
        <p className="mt-0.5 truncate text-[11px] text-zinc-400">{item.cliente}</p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${info.color}`}
        >
          {info.label}
        </span>
        {item.numero && (
          <span className="text-[10px] text-zinc-400">No. {item.numero}</span>
        )}
        {item.seguimientoAt && (
          <span
            title={`Recordatorio: ${new Date(item.seguimientoAt).toLocaleDateString("es-GT")}`}
            className={`text-[10px] ${
              new Date(item.seguimientoAt).getTime() <= Date.now()
                ? "font-semibold text-rose-600 dark:text-rose-400"
                : "text-zinc-400"
            }`}
          >
            🔔{" "}
            {new Date(item.seguimientoAt).toLocaleDateString("es-GT", {
              day: "2-digit",
              month: "short",
            })}
          </span>
        )}
      </div>

      {item.motivoRechazo && (
        <p className="mt-1.5 truncate text-[10px] text-rose-600 dark:text-rose-400">
          Motivo: {item.motivoRechazo}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-1.5 dark:border-zinc-700">
        <span className="truncate text-[10px] text-zinc-400">{item.autor || "—"}</span>
        <Link
          href={rutaAbrir(item)}
          className="text-[11px] font-medium text-teal-700 hover:underline dark:text-teal-400"
        >
          Abrir →
        </Link>
      </div>
    </div>
  );
}

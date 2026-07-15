"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { fetchAlertas, setSeguimiento } from "../actions/historial";
import { formatQ } from "../lib/cotizacion-privada";
import type { Alertas as AlertasData, HistorialItem } from "../lib/api";
import { ESTADO_INFO } from "../lib/estados";
import { rutaAbrir, tipoInfo } from "../lib/tipos";

// Días transcurridos desde una fecha, en texto corto.
function haceDias(iso: string): string {
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400_000);
  if (dias <= 0) return "hoy";
  if (dias === 1) return "hace 1 día";
  return `hace ${dias} días`;
}

// Cotizaciones que piden atención: recordatorios que ya vencieron y las que
// llevan mucho sin moverse. Si no hay nada, no se dibuja.
export function Alertas() {
  const [datos, setDatos] = useState<AlertasData | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        setDatos(await fetchAlertas());
      } catch {
        setDatos(null);
      }
    });
  }, []);

  function quitar(id: string) {
    setDatos((prev) =>
      prev
        ? {
            ...prev,
            vencidas: prev.vencidas.filter((x) => x.id !== id),
            estancadas: prev.estancadas.filter((x) => x.id !== id),
          }
        : prev,
    );
  }

  if (!datos) return null;
  const total = datos.vencidas.length + datos.estancadas.length;
  if (total === 0) return null;

  return (
    <section className="mt-10 rounded-xl border border-amber-300 bg-amber-50/70 p-4 dark:border-amber-800/60 dark:bg-amber-950/20">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
        <span aria-hidden>🔔</span>
        Requieren seguimiento
        <span className="rounded-full bg-amber-200 px-1.5 text-xs text-amber-900 dark:bg-amber-800 dark:text-amber-100">
          {total}
        </span>
      </h2>

      <div className="mt-3 space-y-1.5">
        {datos.vencidas.map((it) => (
          <FilaAlerta
            key={it.id}
            item={it}
            motivo={`Recordatorio para ${new Date(it.seguimientoAt!).toLocaleDateString("es-GT", { day: "2-digit", month: "short" })}`}
            urgente
            onHecho={() => quitar(it.id)}
          />
        ))}
        {datos.estancadas.map((it) => (
          <FilaAlerta
            key={it.id}
            item={it}
            motivo={`Sin movimiento ${haceDias(it.estadoAt)}`}
            onHecho={() => quitar(it.id)}
          />
        ))}
      </div>

      <p className="mt-3 text-[11px] text-amber-800/70 dark:text-amber-200/60">
        Aparecen las cotizaciones pendientes o en curso con recordatorio vencido, y
        las que llevan más de {datos.dias} días sin cambiar de estado.
      </p>
    </section>
  );
}

function FilaAlerta({
  item,
  motivo,
  urgente,
  onHecho,
}: {
  item: HistorialItem;
  motivo: string;
  urgente?: boolean;
  onHecho: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  // Reprograma el recordatorio a N días desde hoy; la fila desaparece.
  function posponer(dias: number) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    startTransition(async () => {
      try {
        await setSeguimiento({
          tipo: item.tipo,
          id: item.id,
          fecha: fecha.toISOString(),
        });
        onHecho();
      } catch {
        // Si falla, la fila se queda: se reintenta al recargar.
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm dark:border-amber-900/40 dark:bg-zinc-900">
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${urgente ? "bg-rose-500" : "bg-amber-400"}`}
      />
      <Link
        href={rutaAbrir(item)}
        className="min-w-0 flex-1 truncate font-medium text-zinc-800 hover:underline dark:text-zinc-100"
      >
        {item.nombre || item.cliente || "Sin nombre"}
      </Link>
      <span
        className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${tipoInfo(item.tipo).color}`}
      >
        {tipoInfo(item.tipo).label}
      </span>
      <span
        className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${ESTADO_INFO[item.estado].pill}`}
      >
        {ESTADO_INFO[item.estado].label}
      </span>
      {item.total != null && (
        <span className="shrink-0 text-xs text-zinc-500">{formatQ(item.total)}</span>
      )}
      <span className="shrink-0 text-xs text-amber-700 dark:text-amber-300">
        {motivo}
      </span>
      <span className="ml-auto flex shrink-0 gap-2">
        <button
          onClick={() => posponer(3)}
          disabled={isPending}
          className="text-xs text-zinc-500 hover:underline disabled:opacity-50"
        >
          En 3 días
        </button>
        <button
          onClick={() => posponer(7)}
          disabled={isPending}
          className="text-xs text-zinc-500 hover:underline disabled:opacity-50"
        >
          En 1 semana
        </button>
      </span>
    </div>
  );
}

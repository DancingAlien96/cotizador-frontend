"use client";

import { useEffect, useState, useTransition } from "react";
import { fetchReporte } from "../actions/reportes";
import { formatQ } from "../lib/cotizacion-privada";
import type { GrupoReporte, Reporte } from "../lib/api";
import { ESTADO_INFO, ESTADO_ORDEN } from "../lib/estados";
import { tipoInfo } from "../lib/tipos";

const FILTROS_TIPO = [
  { value: "", label: "Todos los tipos" },
  { value: "tienda", label: "Tienda" },
  { value: "guatecompras", label: "Guatecompras" },
  { value: "empresas", label: "Empresas" },
  { value: "carta", label: "Carta de Garantía" },
  { value: "piscina", label: "Piscina" },
];

function pct(v: number | null): string {
  return v == null ? "—" : `${Math.round(v * 100)}%`;
}

export function Reportes({ initial }: { initial: Reporte }) {
  const [datos, setDatos] = useState(initial);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [tipo, setTipo] = useState("");
  const [isPending, startTransition] = useTransition();
  const [firstRun, setFirstRun] = useState(true);

  useEffect(() => {
    if (firstRun) {
      setFirstRun(false);
      return;
    }
    startTransition(async () => {
      try {
        setDatos(await fetchReporte({ desde, hasta, tipo }));
      } catch {
        // Se conserva lo último que se pudo mostrar.
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desde, hasta, tipo]);

  const { resumen } = datos;
  const maxEmbudo = Math.max(...datos.embudo.map((e) => e.cantidad), 1);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          Reportes de cierre
        </h1>
        <p className="text-sm text-zinc-500">
          Cuánto se cotizó, cuánto se ganó y por qué se pierde.
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <label className="text-xs text-zinc-500">
          <span className="mb-1 block">Desde</span>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 outline-none focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
        </label>
        <label className="text-xs text-zinc-500">
          <span className="mb-1 block">Hasta</span>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 outline-none focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
        </label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 outline-none focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        >
          {FILTROS_TIPO.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        {(desde || hasta || tipo) && (
          <button
            onClick={() => {
              setDesde("");
              setHasta("");
              setTipo("");
            }}
            className="py-1.5 text-sm text-zinc-500 hover:underline"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className={isPending ? "opacity-50 transition-opacity" : ""}>
        {/* Tarjetas de resumen */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tarjeta
            titulo="Cotizado"
            valor={formatQ(resumen.montoTotal)}
            pie={`${resumen.total} cotizaciones`}
          />
          <Tarjeta
            titulo="Ganado"
            valor={formatQ(resumen.montoGanado)}
            pie={`${resumen.ganadas} confirmadas`}
            acento="text-emerald-600 dark:text-emerald-400"
          />
          <Tarjeta
            titulo="Perdido"
            valor={formatQ(resumen.montoPerdido)}
            pie={`${resumen.perdidas} rechazadas`}
            acento="text-rose-600 dark:text-rose-400"
          />
          <Tarjeta
            titulo="Tasa de cierre"
            valor={pct(resumen.tasaCierre)}
            pie={
              resumen.tasaCierre == null
                ? "aún nada cerrado"
                : `${resumen.abiertas} siguen abiertas`
            }
            acento="text-teal-700 dark:text-teal-400"
          />
        </div>

        {/* Embudo */}
        <Seccion titulo="Embudo">
          <div className="space-y-2">
            {ESTADO_ORDEN.map((estado) => {
              const e = datos.embudo.find((x) => x.estado === estado);
              const cantidad = e?.cantidad ?? 0;
              const info = ESTADO_INFO[estado];
              return (
                <div key={estado} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs text-zinc-500">
                    {info.label}
                  </span>
                  <div className="h-6 flex-1 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className={`h-full ${info.dot} transition-[width]`}
                      style={{ width: `${(cantidad / maxEmbudo) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {cantidad}
                  </span>
                  <span className="w-28 shrink-0 text-right text-xs text-zinc-500">
                    {formatQ(e?.monto ?? 0)}
                  </span>
                </div>
              );
            })}
          </div>
        </Seccion>

        {/* Por qué se pierde */}
        <Seccion titulo="Por qué se pierde">
          {datos.motivos.length === 0 ? (
            <p className="py-4 text-center text-sm text-zinc-400">
              Todavía no hay cotizaciones rechazadas.
            </p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {datos.motivos.map((m) => (
                  <tr
                    key={m.motivo}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                  >
                    <td className="py-2 text-zinc-700 dark:text-zinc-300">
                      {m.motivo}
                    </td>
                    <td className="py-2 text-right text-zinc-500">{m.cantidad}</td>
                    <td className="w-32 py-2 text-right text-zinc-500">
                      {formatQ(m.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Seccion>

        <Seccion titulo="Por asesor">
          <TablaGrupos filas={datos.porAsesor} />
        </Seccion>

        <Seccion titulo="Por tipo de cotización">
          <TablaGrupos
            filas={datos.porTipo}
            etiqueta={(c) => tipoInfo(c).label}
          />
        </Seccion>
      </div>
    </div>
  );
}

function Tarjeta({
  titulo,
  valor,
  pie,
  acento = "text-zinc-800 dark:text-zinc-100",
}: {
  titulo: string;
  valor: string;
  pie: string;
  acento?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{titulo}</p>
      <p className={`mt-1 text-xl font-bold ${acento}`}>{valor}</p>
      <p className="mt-0.5 text-[11px] text-zinc-400">{pie}</p>
    </div>
  );
}

function Seccion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function TablaGrupos({
  filas,
  etiqueta = (c: string) => c,
}: {
  filas: GrupoReporte[];
  etiqueta?: (clave: string) => string;
}) {
  if (filas.length === 0) {
    return <p className="py-4 text-center text-sm text-zinc-400">Sin datos.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
            <th className="pb-2 font-medium"></th>
            <th className="pb-2 text-right font-medium">Cotizadas</th>
            <th className="pb-2 text-right font-medium">Ganadas</th>
            <th className="pb-2 text-right font-medium">% cierre</th>
            <th className="pb-2 text-right font-medium">Monto ganado</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr
              key={f.clave}
              className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
            >
              <td className="max-w-[14rem] truncate py-2 text-zinc-700 dark:text-zinc-300">
                {etiqueta(f.clave)}
              </td>
              <td className="py-2 text-right text-zinc-500">{f.total}</td>
              <td className="py-2 text-right text-zinc-500">{f.ganadas}</td>
              <td className="py-2 text-right text-zinc-500">
                {/* Igual que la tarjeta de arriba: sobre lo ya cerrado. */}
                {pct(
                  f.ganadas + f.perdidas > 0
                    ? f.ganadas / (f.ganadas + f.perdidas)
                    : null,
                )}
              </td>
              <td className="py-2 text-right font-medium text-emerald-700 dark:text-emerald-400">
                {formatQ(f.montoGanado)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

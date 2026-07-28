"use client";

import { useEffect, useState, useTransition } from "react";
import {
  abrirVersion,
  guardarVersion,
  listarVersiones,
} from "../actions/versiones";
import type { ApiRecord, Resumen, VersionMeta } from "../lib/api";

type Body = { data: unknown } & Resumen;

// Controles de versionado para el panel de un editor. Solo aparece cuando la
// cotización ya está guardada (currentId). "Guardar como nueva versión" archiva
// la actual y sube el número de versión; la lista permite abrir versiones viejas.
export function VersionesControls({
  tipo,
  currentId,
  version,
  getBody,
  onNuevaVersion,
  onAbrirSnapshot,
  formatTotal,
  disabled,
}: {
  tipo: string;
  currentId: string | null;
  version: number;
  getBody: () => Body;
  onNuevaVersion: (rec: ApiRecord) => void;
  onAbrirSnapshot: (data: unknown, meta: VersionMeta) => void;
  formatTotal?: (n: number) => string;
  disabled?: boolean;
}) {
  const [versiones, setVersiones] = useState<VersionMeta[]>([]);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!currentId) {
      setVersiones([]);
      return;
    }
    start(async () => setVersiones(await listarVersiones(tipo, currentId)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, version, tipo]);

  if (!currentId) return null;

  function guardarNueva() {
    if (!currentId) return;
    if (
      !confirm(
        "Se guardará el estado actual como una versión nueva y la anterior quedará archivada. ¿Continuar?",
      )
    )
      return;
    start(async () => {
      const rec = await guardarVersion(tipo, currentId, getBody());
      onNuevaVersion(rec);
      setVersiones(await listarVersiones(tipo, currentId));
    });
  }

  function abrir(v: VersionMeta) {
    start(async () => {
      const snap = await abrirVersion(tipo, v.id);
      if (snap) onAbrirSnapshot(snap.data, v);
    });
  }

  return (
    <section className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          Versiones
        </span>
        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-medium text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
          Actual: v{version}
        </span>
      </div>

      <button
        onClick={guardarNueva}
        disabled={disabled || pending}
        className="flex w-full items-center justify-center gap-1.5 rounded-md border border-teal-600 px-3 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-50 disabled:opacity-60 dark:text-teal-400 dark:hover:bg-teal-950"
      >
        Guardar como nueva versión
      </button>

      {versiones.length > 0 && (
        <>
          <p className="mt-3 mb-1 text-[11px] font-medium text-zinc-400">
            Versiones anteriores
          </p>
          <ul className="max-h-44 space-y-1 overflow-y-auto">
            {versiones.map((v) => (
              <li key={v.id}>
                <button
                  onClick={() => abrir(v)}
                  disabled={pending}
                  title="Abrir esta versión para verla o imprimirla"
                  className="flex w-full items-center justify-between gap-2 rounded-md border border-zinc-200 px-2.5 py-1.5 text-left text-sm hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  <span className="flex flex-col">
                    <span className="font-medium text-zinc-700 dark:text-zinc-200">
                      v{v.version}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {v.fecha || new Date(v.createdAt).toLocaleDateString("es-GT")}
                    </span>
                  </span>
                  {v.total != null && (
                    <span className="text-[11px] text-zinc-500">
                      {formatTotal ? formatTotal(v.total) : v.total}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

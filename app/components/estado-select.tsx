"use client";

import { useState } from "react";
import type { Estado } from "../lib/api";
import { ESTADO_INFO, ESTADO_ORDEN, MOTIVOS_RECHAZO } from "../lib/estados";

// Píldora de estado que abre un menú para cambiarlo. Al pasar a RECHAZADA
// pide el motivo, porque sin motivo los reportes de pérdida no dicen nada.
export function EstadoSelect({
  estado,
  motivoRechazo,
  disabled,
  onChange,
}: {
  estado: Estado;
  motivoRechazo?: string | null;
  disabled?: boolean;
  onChange: (estado: Estado, motivoRechazo?: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pidiendoMotivo, setPidiendoMotivo] = useState(false);
  const info = ESTADO_INFO[estado];

  function elegir(next: Estado) {
    setOpen(false);
    if (next === estado) return;
    if (next === "RECHAZADA") {
      setPidiendoMotivo(true);
      return;
    }
    onChange(next);
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        title={motivoRechazo ? `Motivo: ${motivoRechazo}` : undefined}
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium disabled:opacity-50 ${info.pill}`}
      >
        {info.label}
        <span aria-hidden className="text-[9px] opacity-60">
          ▼
        </span>
      </button>

      {open && (
        <>
          {/* Capa para cerrar el menú al hacer clic fuera */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-20 mt-1 w-40 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            {ESTADO_ORDEN.map((e) => (
              <button
                key={e}
                onClick={() => elegir(e)}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 ${
                  e === estado
                    ? "font-semibold text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-600 dark:text-zinc-300"
                }`}
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${ESTADO_INFO[e].dot}`} />
                {ESTADO_INFO[e].label}
              </button>
            ))}
          </div>
        </>
      )}

      {pidiendoMotivo && (
        <MotivoRechazoDialog
          onCancel={() => setPidiendoMotivo(false)}
          onConfirm={(motivo) => {
            setPidiendoMotivo(false);
            onChange("RECHAZADA", motivo);
          }}
        />
      )}
    </div>
  );
}

// Se exporta porque el tablero lo usa al arrastrar una tarjeta a "Rechazada".
export function MotivoRechazoDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: (motivo: string) => void;
}) {
  const [motivo, setMotivo] = useState(MOTIVOS_RECHAZO[0]);
  const [otro, setOtro] = useState("");
  const final = motivo === "Otro" ? otro.trim() : motivo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-zinc-900">
        <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
          ¿Por qué se rechazó?
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Sirve para el reporte de por qué se pierden cotizaciones.
        </p>

        <div className="mt-4 space-y-1">
          {MOTIVOS_RECHAZO.map((m) => (
            <label
              key={m}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <input
                type="radio"
                name="motivo"
                value={m}
                checked={motivo === m}
                onChange={() => setMotivo(m)}
                className="accent-teal-600"
              />
              {m}
            </label>
          ))}
        </div>

        {motivo === "Otro" && (
          <input
            autoFocus
            value={otro}
            onChange={(e) => setOtro(e.target.value)}
            placeholder="Escribe el motivo…"
            className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(final)}
            disabled={!final}
            className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
          >
            Rechazar
          </button>
        </div>
      </div>
    </div>
  );
}

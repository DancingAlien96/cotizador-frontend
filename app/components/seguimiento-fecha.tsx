"use client";

import { useState } from "react";

// Convierte a "YYYY-MM-DD" en horario local (no con toISOString, que pasa a UTC
// y puede correr la fecha un día).
function aInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function vencido(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() <= Date.now();
}

// Fecha en que toca volver a contactar. Vacío = sin recordatorio.
export function SeguimientoFecha({
  valor,
  disabled,
  onChange,
}: {
  valor: string | null;
  disabled?: boolean;
  onChange: (fecha: string | null) => void;
}) {
  const [abierto, setAbierto] = useState(false);

  if (!abierto && !valor) {
    return (
      <button
        onClick={() => setAbierto(true)}
        disabled={disabled}
        className="text-xs text-zinc-400 hover:text-teal-700 hover:underline disabled:opacity-50 dark:hover:text-teal-400"
      >
        + Recordar
      </button>
    );
  }

  return (
    <span className="flex items-center gap-1">
      <input
        type="date"
        autoFocus={abierto && !valor}
        value={aInput(valor)}
        disabled={disabled}
        onChange={(e) => {
          const v = e.target.value;
          // El input da "YYYY-MM-DD"; se fija a mediodía local para que el
          // cambio de zona horaria no lo mueva de día.
          onChange(v ? new Date(`${v}T12:00:00`).toISOString() : null);
          if (!v) setAbierto(false);
        }}
        className={`rounded-md border px-1.5 py-0.5 text-xs outline-none focus:border-teal-500 dark:bg-zinc-800 ${
          vencido(valor)
            ? "border-rose-300 text-rose-700 dark:border-rose-800 dark:text-rose-300"
            : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
        }`}
      />
      {valor && (
        <button
          onClick={() => {
            onChange(null);
            setAbierto(false);
          }}
          disabled={disabled}
          title="Quitar recordatorio"
          className="text-xs text-zinc-400 hover:text-rose-600 disabled:opacity-50"
        >
          ✕
        </button>
      )}
    </span>
  );
}

"use client";

import { useState } from "react";

const inputClass =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

export function SaveDialog({
  initialNombre,
  initialAutor,
  saving,
  onConfirm,
  onCancel,
}: {
  initialNombre: string;
  initialAutor: string;
  saving: boolean;
  onConfirm: (nombre: string, autor: string) => void;
  onCancel: () => void;
}) {
  const [nombre, setNombre] = useState(initialNombre);
  const [autor, setAutor] = useState(initialAutor);

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-100">
          Guardar cotización
        </h3>

        <label className="mb-3 block">
          <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
            Nombre del archivo
          </span>
          <input
            autoFocus
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Cotización IGSS — abril"
            className={inputClass}
          />
        </label>

        <label className="mb-5 block">
          <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
            Autor
          </span>
          <input
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            className={inputClass}
          />
        </label>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(nombre.trim(), autor.trim())}
            disabled={saving}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

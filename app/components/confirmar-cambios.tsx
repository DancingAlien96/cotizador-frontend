"use client";

// Modal de "cambios sin guardar": aparece al intentar salir/cambiar de versión
// mientras hay ediciones sin guardar en el documento actual.
export function ConfirmarCambios({
  onGuardar,
  onDescartar,
  onCancelar,
  guardando,
}: {
  onGuardar: () => void;
  onDescartar: () => void;
  onCancelar: () => void;
  guardando?: boolean;
}) {
  return (
    <div
      className="no-print fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={onCancelar}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
          Tienes cambios sin guardar
        </h3>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Hiciste cambios en esta cotización que aún no has guardado. ¿Qué deseas
          hacer antes de continuar?
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={onGuardar}
            disabled={guardando}
            className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {guardando ? "Guardando…" : "Guardar y continuar"}
          </button>
          <button
            onClick={onDescartar}
            disabled={guardando}
            className="w-full rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60 dark:border-rose-900 dark:hover:bg-rose-950/40"
          >
            Descartar cambios y continuar
          </button>
          <button
            onClick={onCancelar}
            disabled={guardando}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancelar (seguir editando)
          </button>
        </div>
      </div>
    </div>
  );
}

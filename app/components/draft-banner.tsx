"use client";

export function DraftBanner({
  onRestore,
  onDismiss,
}: {
  onRestore: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
      <span>
        Tienes cambios sin guardar de una sesión anterior. ¿Quieres
        restaurarlos?
      </span>
      <span className="flex gap-2">
        <button
          onClick={onRestore}
          className="rounded-md bg-amber-600 px-3 py-1 font-medium text-white hover:bg-amber-700"
        >
          Restaurar
        </button>
        <button
          onClick={onDismiss}
          className="rounded-md border border-amber-300 px-3 py-1 hover:bg-amber-100 dark:border-amber-800 dark:hover:bg-amber-900/40"
        >
          Descartar
        </button>
      </span>
    </div>
  );
}

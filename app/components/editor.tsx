"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { cartaDefaults, cartaFields, type CartaData } from "../lib/carta";
import type { SavedCotizacion } from "../lib/store";
import { CartaGarantia } from "./carta-garantia";
import { logout } from "../actions/auth";
import { saveCotizacion, removeCotizacion } from "../actions/cotizaciones";
import { descargarPdf, toFilename } from "../lib/pdf";

function defaultNombre(data: CartaData): string {
  const inst = data.institucion.trim();
  const evento = data.evento.trim();
  if (inst || evento) {
    return [inst, evento && `Evento ${evento}`].filter(Boolean).join(" — ");
  }
  return "Cotización sin nombre";
}

function formatFecha(ts: number): string {
  return new Date(ts).toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function Editor({
  initialCotizaciones,
  backHref = "/",
}: {
  initialCotizaciones: SavedCotizacion[];
  backHref?: string;
}) {
  const [data, setData] = useState<CartaData>(cartaDefaults);
  const [saved, setSaved] = useState<SavedCotizacion[]>(initialCotizaciones);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [isPending, startTransition] = useTransition();
  const [pdfLoading, setPdfLoading] = useState(false);
  const cartaRef = useRef<HTMLDivElement>(null);

  function update(name: keyof CartaData, value: string) {
    setData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleDescargarPdf() {
    if (!cartaRef.current) return;
    setPdfLoading(true);
    try {
      const filename = toFilename(nombre.trim() || defaultNombre(data));
      await descargarPdf(cartaRef.current, filename);
    } catch (err) {
      console.error(err);
      alert("No se pudo generar el PDF. Intenta de nuevo.");
    } finally {
      setPdfLoading(false);
    }
  }

  function handleNueva() {
    setData(cartaDefaults);
    setCurrentId(null);
    setNombre("");
  }

  function handleCargar(item: SavedCotizacion) {
    setData(item.data);
    setCurrentId(item.id);
    setNombre(item.nombre);
  }

  function handleGuardar() {
    const nombreFinal = nombre.trim() || defaultNombre(data);
    startTransition(async () => {
      const { saved: item, all } = await saveCotizacion({
        id: currentId,
        nombre: nombreFinal,
        data,
      });
      setSaved(all);
      setCurrentId(item.id);
      setNombre(item.nombre);
    });
  }

  function handleEliminar(id: string) {
    if (!confirm("¿Eliminar esta cotización?")) return;
    startTransition(async () => {
      const all = await removeCotizacion(id);
      setSaved(all);
      if (id === currentId) handleNueva();
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 dark:bg-zinc-950">
      {/* Barra superior */}
      <header className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            ← Volver
          </Link>
          <h1 className="font-semibold text-zinc-800 dark:text-zinc-100">
            Carta de Garantía
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDescargarPdf}
            disabled={pdfLoading}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {pdfLoading ? "Generando…" : "Descargar PDF"}
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Imprimir
          </button>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Formulario + cotizaciones */}
        <aside className="no-print w-full overflow-y-auto border-b border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 lg:h-[calc(100vh-57px)] lg:w-96 lg:border-b-0 lg:border-r">
          <div className="space-y-6">
            {/* --- Panel de cotizaciones --- */}
            <section className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                  Cotización
                </span>
                {currentId ? (
                  <span className="text-[11px] text-zinc-400">Editando</span>
                ) : (
                  <span className="text-[11px] text-zinc-400">Nueva</span>
                )}
              </div>

              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder={defaultNombre(data)}
                autoComplete="off"
                className="mb-2 w-full rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleGuardar}
                  disabled={isPending}
                  className="flex-1 rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
                >
                  {isPending
                    ? "Guardando…"
                    : currentId
                      ? "Guardar cambios"
                      : "Guardar"}
                </button>
                <button
                  onClick={handleNueva}
                  disabled={isPending}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Nueva
                </button>
              </div>

              {saved.length > 0 && (
                <ul className="mt-3 max-h-56 space-y-1 overflow-y-auto">
                  {saved.map((item) => (
                    <li
                      key={item.id}
                      className={`group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                        item.id === currentId
                          ? "bg-teal-50 dark:bg-teal-950/40"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <button
                        onClick={() => handleCargar(item)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="block truncate text-zinc-800 dark:text-zinc-100">
                          {item.nombre}
                        </span>
                        <span
                          className="block text-[11px] text-zinc-400"
                          suppressHydrationWarning
                        >
                          {formatFecha(item.updatedAt)}
                        </span>
                      </button>
                      <button
                        onClick={() => handleEliminar(item.id)}
                        disabled={isPending}
                        title="Eliminar"
                        className="shrink-0 rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-60 dark:hover:bg-red-950/40"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" />
                          <path d="M10 11v6M14 11v6" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* --- Campos del documento --- */}
            {cartaFields.map((group) => (
              <fieldset key={group.group}>
                <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-700">
                  {group.group}
                </legend>
                <div className="space-y-3">
                  {group.fields.map((f) => (
                    <label key={f.name} className="block">
                      <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
                        {f.label}
                      </span>
                      <input
                        value={data[f.name]}
                        onChange={(e) => update(f.name, e.target.value)}
                        autoComplete="off"
                        data-1p-ignore
                        data-lpignore="true"
                        className="w-full rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}

            <button
              onClick={() => setData(cartaDefaults)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Restaurar valores por defecto
            </button>
          </div>
        </aside>

        {/* Vista previa */}
        <main className="flex-1 overflow-y-auto p-4 lg:h-[calc(100vh-57px)] lg:p-8">
          <div id="print-area" ref={cartaRef} className="mx-auto">
            <CartaGarantia data={data} />
          </div>
        </main>
      </div>
    </div>
  );
}

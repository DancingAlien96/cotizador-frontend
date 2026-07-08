"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  guatecomprasDefaults,
  type CotizacionGuatecomprasData,
} from "../lib/cotizacion-guatecompras";
import {
  totalItem,
  totalGeneral,
  formatQ,
  type ItemCotizacion,
} from "../lib/cotizacion-privada";
import type { SavedGuatecompras } from "../lib/store-guatecompras";
import { CotizacionGuatecomprasDoc } from "./cotizacion-guatecompras-doc";
import { saveGuatecompras, removeGuatecompras } from "../actions/guatecompras";
import { descargarPdf, toFilename } from "../lib/pdf";
import { useDraft } from "../lib/use-draft";
import { DraftBanner } from "./draft-banner";

const inputClass =
  "w-full rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

export function EditorGuatecompras({
  initialCotizaciones,
  initialSelectedId,
}: {
  initialCotizaciones: SavedGuatecompras[];
  initialSelectedId?: string;
}) {
  const [data, setData] = useState<CotizacionGuatecomprasData>(
    guatecomprasDefaults,
  );
  const [saved, setSaved] = useState<SavedGuatecompras[]>(initialCotizaciones);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pdfLoading, setPdfLoading] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

  const { draft, canRestore, clear: clearDraft } = useDraft("guatecompras", {
    data,
    currentId,
  });
  function restaurarBorrador() {
    if (!draft) return;
    setData(draft.snapshot.data);
    setCurrentId(draft.snapshot.currentId);
    clearDraft();
  }

  function set<K extends keyof CotizacionGuatecomprasData>(
    key: K,
    value: CotizacionGuatecomprasData[K],
  ) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  // --- Ítems ---
  function updateItem(i: number, key: keyof ItemCotizacion, value: string) {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((it, idx) =>
        idx === i ? { ...it, [key]: value } : it,
      ),
    }));
  }
  function addItem() {
    setData((prev) => ({
      ...prev,
      items: [...prev.items, { cantidad: "1", descripcion: "", precioUnidad: "" }],
    }));
  }
  function removeItem(i: number) {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== i),
    }));
  }

  // --- Observaciones ---
  function updateObs(i: number, value: string) {
    setData((prev) => ({
      ...prev,
      observaciones: prev.observaciones.map((o, idx) => (idx === i ? value : o)),
    }));
  }
  function addObs() {
    setData((prev) => ({ ...prev, observaciones: [...prev.observaciones, ""] }));
  }
  function removeObs(i: number) {
    setData((prev) => ({
      ...prev,
      observaciones: prev.observaciones.filter((_, idx) => idx !== i),
    }));
  }

  // --- Guardadas ---
  function handleNueva() {
    setData(guatecomprasDefaults);
    setCurrentId(null);
    clearDraft();
  }
  function handleCargar(item: SavedGuatecompras) {
    setData(item.data);
    setCurrentId(item.id);
  }

  useEffect(() => {
    if (!initialSelectedId) return;
    const item = initialCotizaciones.find((c) => c.id === initialSelectedId);
    if (item) handleCargar(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function handleGuardar() {
    startTransition(async () => {
      const res = await saveGuatecompras({ id: currentId, data });
      setSaved(res.all);
      setCurrentId(res.saved.id);
      clearDraft();
    });
  }
  function handleEliminar(id: string) {
    if (!confirm("¿Eliminar esta cotización?")) return;
    startTransition(async () => {
      const all = await removeGuatecompras(id);
      setSaved(all);
      if (id === currentId) handleNueva();
    });
  }

  async function handleDescargarPdf() {
    if (!docRef.current) return;
    setPdfLoading(true);
    try {
      await descargarPdf(
        docRef.current,
        toFilename(`Cotizacion GC ${data.numeroOperacion}`),
      );
    } catch (err) {
      console.error(err);
      alert("No se pudo generar el PDF. Intenta de nuevo.");
    } finally {
      setPdfLoading(false);
    }
  }

  const total = totalGeneral(data.items);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 dark:bg-zinc-950">
      <header className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <Link
            href="/guatecompras"
            className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            ← Volver
          </Link>
          <h1 className="font-semibold text-zinc-800 dark:text-zinc-100">
            Cotización Guatecompras
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
        </div>
      </header>

      {canRestore && (
        <DraftBanner onRestore={restaurarBorrador} onDismiss={clearDraft} />
      )}

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Formulario */}
        <aside className="no-print w-full overflow-y-auto border-b border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 lg:h-[calc(100vh-57px)] lg:w-[26rem] lg:border-b-0 lg:border-r">
          <div className="space-y-6">
            {/* Guardadas */}
            <section className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                  Cotización
                </span>
                <span className="text-[11px] text-zinc-400">
                  {currentId ? "Editando" : "Nueva"}
                </span>
              </div>
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
                <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto">
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
                          Op. {item.data.numeroOperacion || "—"}
                        </span>
                        <span className="block truncate text-[11px] text-zinc-400">
                          {formatQ(totalGeneral(item.data.items))} ·{" "}
                          {item.data.cotizacionA}
                        </span>
                      </button>
                      <button
                        onClick={() => handleEliminar(item.id)}
                        disabled={isPending}
                        title="Eliminar"
                        className="shrink-0 rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-60 dark:hover:bg-red-950/40"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Datos generales */}
            <fieldset>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-700">
                Datos generales
              </legend>
              <div className="space-y-3">
                <Field label="Fecha" value={data.fecha} onChange={(v) => set("fecha", v)} />
                <Field label="Número de Operación de Guatecompras" value={data.numeroOperacion} onChange={(v) => set("numeroOperacion", v)} />
                <Field label="Cotización a (institución)" value={data.cotizacionA} onChange={(v) => set("cotizacionA", v)} />
                <FieldArea label="Dirigida a (dependencia)" value={data.dirigidaA} onChange={(v) => set("dirigidaA", v)} />
                <FieldArea label="Dirección del destinatario" value={data.direccion} onChange={(v) => set("direccion", v)} />
              </div>
            </fieldset>

            {/* Ítems */}
            <fieldset>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-700">
                Ítems
              </legend>
              <div className="space-y-3">
                {data.items.map((it, i) => (
                  <div key={i} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-500">
                        Ítem {i + 1} · {formatQ(totalItem(it))}
                      </span>
                      <button onClick={() => removeItem(i)} className="text-xs text-red-500 hover:underline">
                        Quitar
                      </button>
                    </div>
                    <label className="mb-2 block">
                      <span className="mb-1 block text-xs text-zinc-500">Descripción</span>
                      <textarea value={it.descripcion} onChange={(e) => updateItem(i, "descripcion", e.target.value)} rows={2} className={inputClass} />
                    </label>
                    <div className="flex gap-2">
                      <label className="flex-1">
                        <span className="mb-1 block text-xs text-zinc-500">Cantidad</span>
                        <input value={it.cantidad} onChange={(e) => updateItem(i, "cantidad", e.target.value)} inputMode="decimal" className={inputClass} />
                      </label>
                      <label className="flex-1">
                        <span className="mb-1 block text-xs text-zinc-500">Precio unitario</span>
                        <input value={it.precioUnidad} onChange={(e) => updateItem(i, "precioUnidad", e.target.value)} inputMode="decimal" className={inputClass} />
                      </label>
                    </div>
                  </div>
                ))}
                <button onClick={addItem} className="w-full rounded-md border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:border-teal-400 hover:text-teal-700 dark:border-zinc-700 dark:text-zinc-400">
                  + Agregar ítem
                </button>
                <div className="rounded-md bg-zinc-50 px-3 py-2 text-right text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  TOTAL: {formatQ(total)}
                </div>
              </div>
            </fieldset>

            {/* Observaciones */}
            <fieldset>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-700">
                Observaciones
              </legend>
              <div className="space-y-2">
                {data.observaciones.map((o, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <textarea value={o} onChange={(e) => updateObs(i, e.target.value)} rows={2} className={inputClass} />
                    <button onClick={() => removeObs(i)} title="Quitar" className="mt-1.5 shrink-0 rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button onClick={addObs} className="w-full rounded-md border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:border-teal-400 hover:text-teal-700 dark:border-zinc-700 dark:text-zinc-400">
                  + Agregar observación
                </button>
              </div>
            </fieldset>

            {/* Empresa (fijos) */}
            <details className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Datos de la empresa
              </summary>
              <div className="mt-3 space-y-3">
                <Field label="Nombre" value={data.empresaNombre} onChange={(v) => set("empresaNombre", v)} />
                <Field label="Razón Social" value={data.razonSocial} onChange={(v) => set("razonSocial", v)} />
                <Field label="Dirección fiscal" value={data.empresaDireccion} onChange={(v) => set("empresaDireccion", v)} />
                <Field label="NIT" value={data.empresaNit} onChange={(v) => set("empresaNit", v)} />
                <Field label="Régimen" value={data.regimen} onChange={(v) => set("regimen", v)} />
                <Field label="Teléfono" value={data.telefono} onChange={(v) => set("telefono", v)} />
                <Field label="Correo electrónico" value={data.correo1} onChange={(v) => set("correo1", v)} />
                <Field label="Correo electrónico 2" value={data.correo2} onChange={(v) => set("correo2", v)} />
              </div>
            </details>
          </div>
        </aside>

        {/* Vista previa */}
        <main className="flex-1 overflow-y-auto p-4 lg:h-[calc(100vh-57px)] lg:p-8">
          <div id="print-area" ref={docRef} className="mx-auto">
            <CotizacionGuatecomprasDoc data={data} />
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} autoComplete="off" className={inputClass} />
    </label>
  );
}

function FieldArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className={inputClass} />
    </label>
  );
}

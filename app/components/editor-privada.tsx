"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  cotizacionPrivadaDefaults,
  totalItem,
  totalGeneral,
  formatQ,
  type CotizacionPrivadaData,
  type ItemCotizacion,
} from "../lib/cotizacion-privada";
import type { SavedCotizacionPrivada } from "../lib/store-privadas";
import { CotizacionPrivadaDoc } from "./cotizacion-privada-doc";
import { savePrivada, removePrivada } from "../actions/privadas";
import { descargarPdf, toFilename } from "../lib/pdf";
import { descargarWord } from "../lib/word";
import { wordBodyEmpresas } from "../lib/word-bodies";
import { useDraft } from "../lib/use-draft";
import { DraftBanner } from "./draft-banner";
import { PreviewScaler } from "./preview-scaler";
import { SaveDialog } from "./save-dialog";

const inputClass =
  "w-full rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

export function EditorPrivada({
  initialCotizaciones,
  siguienteNumero,
  initialSelectedId,
  userEmail = "",
}: {
  initialCotizaciones: SavedCotizacionPrivada[];
  siguienteNumero: string;
  initialSelectedId?: string;
  userEmail?: string;
}) {
  const [data, setData] = useState<CotizacionPrivadaData>(
    cotizacionPrivadaDefaults,
  );
  const [saved, setSaved] = useState<SavedCotizacionPrivada[]>(
    initialCotizaciones,
  );
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [numero, setNumero] = useState(siguienteNumero);
  const [proximoNumero, setProximoNumero] = useState(siguienteNumero);
  const [nombre, setNombre] = useState("");
  const [autor, setAutor] = useState(userEmail);
  const [saveOpen, setSaveOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pdfLoading, setPdfLoading] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

  const { draft, canRestore, clear: clearDraft } = useDraft("empresas", {
    data,
    currentId,
    numero,
    nombre,
    autor,
  });
  function restaurarBorrador() {
    if (!draft) return;
    setData(draft.snapshot.data);
    setCurrentId(draft.snapshot.currentId);
    setNumero(draft.snapshot.numero);
    setNombre(draft.snapshot.nombre ?? "");
    setAutor(draft.snapshot.autor ?? userEmail);
    clearDraft();
  }

  function set<K extends keyof CotizacionPrivadaData>(
    key: K,
    value: CotizacionPrivadaData[K],
  ) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  // --- Ítems ---
  function updateItem(i: number, key: keyof ItemCotizacion, value: string) {
    setData((prev) => {
      const items = prev.items.map((it, idx) =>
        idx === i ? { ...it, [key]: value } : it,
      );
      return { ...prev, items };
    });
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

  // --- Cotizaciones guardadas ---
  function handleNueva() {
    setData(cotizacionPrivadaDefaults);
    setCurrentId(null);
    setNumero(proximoNumero);
    setNombre("");
    setAutor(userEmail);
    clearDraft();
  }
  function handleCargar(item: SavedCotizacionPrivada) {
    setData(item.data);
    setCurrentId(item.id);
    setNumero(item.numero);
    setNombre(item.nombre);
    setAutor(item.autor || userEmail);
  }

  // Abrir una cotización específica al llegar desde el historial (?id=…).
  useEffect(() => {
    if (!initialSelectedId) return;
    const item = initialCotizaciones.find((c) => c.id === initialSelectedId);
    if (item) handleCargar(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function doGuardar(nombreVal: string, autorVal: string) {
    setNombre(nombreVal);
    setAutor(autorVal);
    startTransition(async () => {
      const res = await savePrivada({
        id: currentId,
        nombre: nombreVal,
        autor: autorVal,
        data,
      });
      setSaved(res.all);
      setCurrentId(res.saved.id);
      setNumero(res.saved.numero);
      setProximoNumero(res.siguienteNumero);
      clearDraft();
      setSaveOpen(false);
    });
  }
  function handleEliminar(id: string) {
    if (!confirm("¿Eliminar esta cotización?")) return;
    startTransition(async () => {
      const res = await removePrivada(id);
      setSaved(res.all);
      setProximoNumero(res.siguienteNumero);
      if (id === currentId) {
        setData(cotizacionPrivadaDefaults);
        setCurrentId(null);
        setNumero(res.siguienteNumero);
      }
    });
  }

  const [wordLoading, setWordLoading] = useState(false);
  async function handleDescargarWord() {
    setWordLoading(true);
    try {
      await descargarWord({
        filename: toFilename(`Cotizacion ${numero}`).replace(/\.pdf$/, ".doc"),
        root: docRef.current,
        bodyHtml: wordBodyEmpresas(data, numero),
      });
    } catch (err) {
      console.error(err);
      alert("No se pudo generar el Word. Intenta de nuevo.");
    } finally {
      setWordLoading(false);
    }
  }

  async function handleDescargarPdf() {
    if (!docRef.current) return;
    setPdfLoading(true);
    try {
      await descargarPdf(docRef.current, toFilename(`Cotizacion ${numero}`));
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
      {/* Barra superior */}
      <header className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            ← Inicio
          </Link>
          <h1 className="font-semibold text-zinc-800 dark:text-zinc-100">
            Cotización de empresa
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
            onClick={handleDescargarWord}
            disabled={wordLoading}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {wordLoading ? "Generando…" : "Word"}
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

      {saveOpen && (
        <SaveDialog
          initialNombre={nombre || `Empresas — ${data.clienteNombre}`.trim()}
          initialAutor={autor || userEmail}
          saving={isPending}
          onConfirm={doGuardar}
          onCancel={() => setSaveOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Formulario */}
        <aside className="no-print w-full overflow-y-auto border-b border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 lg:h-[calc(100vh-57px)] lg:w-[26rem] lg:border-b-0 lg:border-r">
          <div className="space-y-6">
            {/* Panel de cotizaciones */}
            <section className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                  Cotización No. {numero}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {currentId ? "Editando" : "Nueva"}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSaveOpen(true)}
                  disabled={isPending}
                  className="flex-1 rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
                >
                  {currentId ? "Guardar cambios" : "Guardar"}
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
                          No. {item.numero} · {item.data.clienteNombre || "—"}
                        </span>
                        <span className="block text-[11px] text-zinc-400">
                          {formatQ(totalGeneral(item.data.items))}
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
                <Field label="Cliente (destinatario)" value={data.clienteNombre} onChange={(v) => set("clienteNombre", v)} />
                <Field label="Concepto de la oferta" value={data.concepto} onChange={(v) => set("concepto", v)} />
              </div>
            </fieldset>

            {/* Asesor */}
            <fieldset>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-700">
                Asesor de venta
              </legend>
              <div className="space-y-3">
                <Field label="Nombre" value={data.asesorNombre} onChange={(v) => set("asesorNombre", v)} />
                <Field label="Teléfono" value={data.asesorTelefono} onChange={(v) => set("asesorTelefono", v)} />
                <Field label="Correo" value={data.asesorCorreo} onChange={(v) => set("asesorCorreo", v)} />
              </div>
            </fieldset>

            {/* Ítems */}
            <fieldset>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-700">
                Ítems
              </legend>
              <div className="space-y-3">
                {data.items.map((it, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-500">
                        Ítem {i + 1} · {formatQ(totalItem(it))}
                      </span>
                      <button
                        onClick={() => removeItem(i)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Quitar
                      </button>
                    </div>
                    <label className="mb-2 block">
                      <span className="mb-1 block text-xs text-zinc-500">
                        Descripción
                      </span>
                      <textarea
                        value={it.descripcion}
                        onChange={(e) => updateItem(i, "descripcion", e.target.value)}
                        rows={2}
                        className={inputClass}
                      />
                    </label>
                    <div className="flex gap-2">
                      <label className="flex-1">
                        <span className="mb-1 block text-xs text-zinc-500">
                          Cantidad
                        </span>
                        <input
                          value={it.cantidad}
                          onChange={(e) => updateItem(i, "cantidad", e.target.value)}
                          inputMode="decimal"
                          className={inputClass}
                        />
                      </label>
                      <label className="flex-1">
                        <span className="mb-1 block text-xs text-zinc-500">
                          Precio unidad
                        </span>
                        <input
                          value={it.precioUnidad}
                          onChange={(e) => updateItem(i, "precioUnidad", e.target.value)}
                          inputMode="decimal"
                          className={inputClass}
                        />
                      </label>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addItem}
                  className="w-full rounded-md border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:border-teal-400 hover:text-teal-700 dark:border-zinc-700 dark:text-zinc-400"
                >
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
                    <textarea
                      value={o}
                      onChange={(e) => updateObs(i, e.target.value)}
                      rows={2}
                      className={inputClass}
                    />
                    <button
                      onClick={() => removeObs(i)}
                      title="Quitar"
                      className="mt-1.5 shrink-0 rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={addObs}
                  className="w-full rounded-md border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:border-teal-400 hover:text-teal-700 dark:border-zinc-700 dark:text-zinc-400"
                >
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
                <Field label="Dirección fiscal" value={data.empresaDireccion} onChange={(v) => set("empresaDireccion", v)} />
                <Field label="NIT" value={data.empresaNit} onChange={(v) => set("empresaNit", v)} />
                <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Membrete (encabezado)
                </p>
                <Field label="Correo electrónico" value={data.membreteCorreo} onChange={(v) => set("membreteCorreo", v)} />
                <Field label="Celular 1" value={data.membreteTel1} onChange={(v) => set("membreteTel1", v)} />
                <Field label="Celular 2" value={data.membreteTel2} onChange={(v) => set("membreteTel2", v)} />
              </div>
            </details>
          </div>
        </aside>

        {/* Vista previa */}
        <main className="flex-1 overflow-y-auto p-4 lg:h-[calc(100vh-57px)] lg:p-8">
          <PreviewScaler>
            <div id="print-area" ref={docRef}>
              <CotizacionPrivadaDoc data={data} numero={numero} />
            </div>
          </PreviewScaler>
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
      <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        className={inputClass}
      />
    </label>
  );
}

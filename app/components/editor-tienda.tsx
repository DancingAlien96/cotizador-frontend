"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  tiendaDefaults,
  totalItemTienda,
  totalTienda,
  type CotizacionTiendaData,
  type ItemTienda,
} from "../lib/cotizacion-tienda";
import { formatQ } from "../lib/cotizacion-privada";
import type { SavedTienda } from "../lib/store-tienda";
import { CotizacionTiendaDoc } from "./cotizacion-tienda-doc";
import { saveTienda, removeTienda } from "../actions/tienda";
import { descargarPdf, toFilename } from "../lib/pdf";
import { descargarWord } from "../lib/word";
import { wordBodyTienda } from "../lib/word-bodies";
import { useDraft } from "../lib/use-draft";
import { DraftBanner } from "./draft-banner";
import { PreviewScaler } from "./preview-scaler";
import { SaveDialog } from "./save-dialog";
import { ClienteAutocomplete } from "./cliente-autocomplete";

const inputClass =
  "w-full rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

export function EditorTienda({
  initialCotizaciones,
  siguienteNumero,
  onSiguienteNumero,
  initialSelectedId,
  userEmail = "",
  headerExtra,
}: {
  initialCotizaciones: SavedTienda[];
  siguienteNumero: string;
  onSiguienteNumero?: (n: string) => void;
  initialSelectedId?: string;
  userEmail?: string;
  headerExtra?: React.ReactNode;
}) {
  const [data, setData] = useState<CotizacionTiendaData>(tiendaDefaults);
  const [saved, setSaved] = useState<SavedTienda[]>(initialCotizaciones);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [numero, setNumero] = useState(siguienteNumero);
  const [proximoNumero, setProximoNumero] = useState(siguienteNumero);
  const [nombre, setNombre] = useState("");
  const [autor, setAutor] = useState(userEmail);
  const [saveOpen, setSaveOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pdfLoading, setPdfLoading] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

  const { draft, canRestore, clear: clearDraft } = useDraft("tienda", {
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
    setNumero(draft.snapshot.numero ?? proximoNumero);
    setNombre(draft.snapshot.nombre ?? "");
    setAutor(draft.snapshot.autor ?? userEmail);
    clearDraft();
  }

  function set<K extends keyof CotizacionTiendaData>(
    key: K,
    value: CotizacionTiendaData[K],
  ) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function updateItem(i: number, key: keyof ItemTienda, value: string) {
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
      items: [
        ...prev.items,
        { descripcion: "", precio: "", cantidad: "1", unidad: "" },
      ],
    }));
  }
  function removeItem(i: number) {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== i),
    }));
  }

  function updateTermino(i: number, value: string) {
    setData((prev) => ({
      ...prev,
      terminos: prev.terminos.map((t, idx) => (idx === i ? value : t)),
    }));
  }
  function addTermino() {
    setData((prev) => ({ ...prev, terminos: [...prev.terminos, ""] }));
  }
  function removeTermino(i: number) {
    setData((prev) => ({
      ...prev,
      terminos: prev.terminos.filter((_, idx) => idx !== i),
    }));
  }

  function handleNueva() {
    setData(tiendaDefaults);
    setCurrentId(null);
    setNumero(proximoNumero);
    setNombre("");
    setAutor(userEmail);
    clearDraft();
  }
  function handleCargar(item: SavedTienda) {
    setData(item.data);
    setCurrentId(item.id);
    setNumero(item.numero);
    setNombre(item.nombre);
    setAutor(item.autor || userEmail);
  }

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
      const res = await saveTienda({
        id: currentId,
        nombre: nombreVal,
        autor: autorVal,
        data,
      });
      setSaved(res.all);
      setCurrentId(res.saved.id);
      setNumero(res.saved.numero);
      setProximoNumero(res.siguienteNumero);
      onSiguienteNumero?.(res.siguienteNumero);
      clearDraft();
      setSaveOpen(false);
    });
  }
  function handleEliminar(id: string) {
    if (!confirm("¿Eliminar esta cotización?")) return;
    startTransition(async () => {
      const res = await removeTienda(id);
      setSaved(res.all);
      setProximoNumero(res.siguienteNumero);
      onSiguienteNumero?.(res.siguienteNumero);
      if (id === currentId) {
        setData(tiendaDefaults);
        setCurrentId(null);
        setNumero(res.siguienteNumero);
        setNombre("");
        setAutor(userEmail);
        clearDraft();
      }
    });
  }

  const [wordLoading, setWordLoading] = useState(false);
  async function handleDescargarWord() {
    setWordLoading(true);
    try {
      await descargarWord({
        filename: toFilename(`Cotizacion ${numero}`).replace(/\.pdf$/, ".docx"),
        root: docRef.current,
        bodyHtml: wordBodyTienda(data, numero),
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
      await descargarPdf(
        docRef.current,
        toFilename(`Cotizacion ${numero}`),
      );
    } catch (err) {
      console.error(err);
      alert("No se pudo generar el PDF. Intenta de nuevo.");
    } finally {
      setPdfLoading(false);
    }
  }

  const total = totalTienda(data.items, data.otros);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 dark:bg-zinc-950">
      <header className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <Link href="/" className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
            ← Inicio
          </Link>
          <h1 className="font-semibold text-zinc-800 dark:text-zinc-100">
            Cotización
          </h1>
          {headerExtra}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDescargarPdf} disabled={pdfLoading} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60">
            {pdfLoading ? "Generando…" : "Descargar PDF"}
          </button>
          <button onClick={handleDescargarWord} disabled={wordLoading} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
            {wordLoading ? "Generando…" : "Word"}
          </button>
          <button onClick={() => window.print()} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
            Imprimir
          </button>
        </div>
      </header>

      {canRestore && (
        <DraftBanner onRestore={restaurarBorrador} onDismiss={clearDraft} />
      )}

      {saveOpen && (
        <SaveDialog
          initialNombre={nombre || `Tienda — ${data.cliente}`.trim()}
          initialAutor={autor || userEmail}
          saving={isPending}
          onConfirm={doGuardar}
          onCancel={() => setSaveOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col lg:flex-row">
        <aside className="no-print w-full overflow-y-auto border-b border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 lg:h-[calc(100vh-57px)] lg:w-[26rem] lg:border-b-0 lg:border-r">
          <div className="space-y-6">
            {/* Guardadas */}
            <section className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">Cotización No. {numero}</span>
                <span className="text-[11px] text-zinc-400">{currentId ? "Editando" : "Nueva"}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSaveOpen(true)} disabled={isPending} className="flex-1 rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60">
                  {currentId ? "Guardar cambios" : "Guardar"}
                </button>
                <button onClick={handleNueva} disabled={isPending} className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                  Nueva
                </button>
              </div>
              {saved.length > 0 && (
                <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto">
                  {saved.map((item) => (
                    <li key={item.id} className={`group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${item.id === currentId ? "bg-teal-50 dark:bg-teal-950/40" : "hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}>
                      <button onClick={() => handleCargar(item)} className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-zinc-800 dark:text-zinc-100">{item.data.cliente || "—"}</span>
                        <span className="block text-[11px] text-zinc-400">{formatQ(totalTienda(item.data.items, item.data.otros))}</span>
                      </button>
                      <button onClick={() => handleEliminar(item.id)} disabled={isPending} title="Eliminar" className="shrink-0 rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-60 dark:hover:bg-red-950/40">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" /></svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Datos generales */}
            <fieldset>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-700">Datos generales</legend>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Field label="Fecha" value={data.fecha} onChange={(v) => set("fecha", v)} />
                  <Field label="Válido hasta" value={data.validoHasta} onChange={(v) => set("validoHasta", v)} />
                </div>
                <Field label="Asesor de venta" value={data.asesor} onChange={(v) => set("asesor", v)} />
                <ClienteAutocomplete
                  value={data.cliente}
                  onChange={(v) => set("cliente", v)}
                  onSelect={(c) =>
                    setData((prev) => ({
                      ...prev,
                      cliente: c.nombre,
                      nitCliente: c.nit ?? prev.nitCliente,
                    }))
                  }
                  datosActuales={() => ({
                    nombre: data.cliente,
                    nit: data.nitCliente,
                  })}
                />
                <Field label="NIT del cliente" value={data.nitCliente} onChange={(v) => set("nitCliente", v)} />
              </div>
            </fieldset>

            {/* Ítems */}
            <fieldset>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-700">Ítems</legend>
              <div className="space-y-3">
                {data.items.map((it, i) => (
                  <div key={i} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-500">Ítem {i + 1} · {formatQ(totalItemTienda(it))}</span>
                      <button onClick={() => removeItem(i)} className="text-xs text-red-500 hover:underline">Quitar</button>
                    </div>
                    <label className="mb-2 block">
                      <span className="mb-1 block text-xs text-zinc-500">Descripción</span>
                      <textarea value={it.descripcion} onChange={(e) => updateItem(i, "descripcion", e.target.value)} rows={3} className={inputClass} />
                    </label>
                    <div className="flex gap-2">
                      <label className="flex-1">
                        <span className="mb-1 block text-xs text-zinc-500">Precio</span>
                        <input value={it.precio} onChange={(e) => updateItem(i, "precio", e.target.value)} inputMode="decimal" className={inputClass} />
                      </label>
                      <label className="w-20">
                        <span className="mb-1 block text-xs text-zinc-500">Cantidad</span>
                        <input value={it.cantidad} onChange={(e) => updateItem(i, "cantidad", e.target.value)} inputMode="decimal" className={inputClass} />
                      </label>
                      <label className="w-24">
                        <span className="mb-1 block text-xs text-zinc-500">Unidad</span>
                        <input value={it.unidad} onChange={(e) => updateItem(i, "unidad", e.target.value)} className={inputClass} />
                      </label>
                    </div>
                  </div>
                ))}
                <button onClick={addItem} className="w-full rounded-md border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:border-teal-400 hover:text-teal-700 dark:border-zinc-700 dark:text-zinc-400">+ Agregar ítem</button>
                <label className="block">
                  <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">Otros (cargo adicional)</span>
                  <input value={data.otros} onChange={(e) => set("otros", e.target.value)} inputMode="decimal" className={inputClass} />
                </label>
                <div className="rounded-md bg-zinc-50 px-3 py-2 text-right text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">TOTAL: {formatQ(total)}</div>
              </div>
            </fieldset>

            {/* Términos */}
            <fieldset>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-700">Términos y condiciones</legend>
              <div className="space-y-2">
                {data.terminos.map((t, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <textarea value={t} onChange={(e) => updateTermino(i, e.target.value)} rows={2} className={inputClass} />
                    <button onClick={() => removeTermino(i)} title="Quitar" className="mt-1.5 shrink-0 rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                <button onClick={addTermino} className="w-full rounded-md border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:border-teal-400 hover:text-teal-700 dark:border-zinc-700 dark:text-zinc-400">+ Agregar término</button>
              </div>
            </fieldset>

            {/* Membrete */}
            <details className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Membrete (encabezado)
              </summary>
              <div className="mt-3 space-y-3">
                <Field label="Correo electrónico" value={data.membreteCorreo} onChange={(v) => set("membreteCorreo", v)} />
                <Field label="Celular 1" value={data.membreteTel1} onChange={(v) => set("membreteTel1", v)} />
                <Field label="Celular 2" value={data.membreteTel2} onChange={(v) => set("membreteTel2", v)} />
              </div>
            </details>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 lg:h-[calc(100vh-57px)] lg:p-8">
          <PreviewScaler>
            <div id="print-area" ref={docRef}>
              <CotizacionTiendaDoc data={data} numero={numero} />
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
    <label className="block flex-1">
      <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} autoComplete="off" className={inputClass} />
    </label>
  );
}

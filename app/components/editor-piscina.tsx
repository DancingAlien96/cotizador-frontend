"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  piscinaDefaults,
  totalConIva,
  type PropuestaPiscinaData,
  type ComponenteTabla,
  type FilaCronograma,
} from "../lib/propuesta-piscina";
import { formatQ } from "../lib/cotizacion-privada";
import type { SavedPiscina } from "../lib/store-piscina";
import { PropuestaPiscinaDoc } from "./propuesta-piscina-doc";
import { savePiscina, removePiscina } from "../actions/piscina";
import { descargarPdfMultipagina, toFilename } from "../lib/pdf";
import { descargarWord } from "../lib/word";
import { wordBodyPiscina } from "../lib/word-bodies";
import { useDraft } from "../lib/use-draft";
import { DraftBanner } from "./draft-banner";
import { ClienteAutocomplete } from "./cliente-autocomplete";
import { PreviewScaler } from "./preview-scaler";
import { SaveDialog } from "./save-dialog";

const input =
  "w-full rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

export function EditorPiscina({
  initialCotizaciones,
  initialSelectedId,
  userEmail = "",
}: {
  initialCotizaciones: SavedPiscina[];
  initialSelectedId?: string;
  userEmail?: string;
}) {
  const [data, setData] = useState<PropuestaPiscinaData>(piscinaDefaults);
  const [saved, setSaved] = useState<SavedPiscina[]>(initialCotizaciones);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [autor, setAutor] = useState(userEmail);
  const [saveOpen, setSaveOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pdfLoading, setPdfLoading] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

  const { draft, canRestore, clear: clearDraft } = useDraft("piscina", {
    data,
    currentId,
    nombre,
    autor,
  });
  function restaurarBorrador() {
    if (!draft) return;
    setData(draft.snapshot.data);
    setCurrentId(draft.snapshot.currentId);
    setNombre(draft.snapshot.nombre ?? "");
    setAutor(draft.snapshot.autor ?? userEmail);
    clearDraft();
  }

  function set<K extends keyof PropuestaPiscinaData>(
    key: K,
    value: PropuestaPiscinaData[K],
  ) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  // Componentes
  function updComp(i: number, patch: Partial<ComponenteTabla>) {
    setData((p) => ({
      ...p,
      componentes: p.componentes.map((c, idx) =>
        idx === i ? { ...c, ...patch } : c,
      ),
    }));
  }
  function addComp() {
    setData((p) => ({
      ...p,
      componentes: [...p.componentes, { nombre: "", op1: true, op2: true }],
    }));
  }
  function delComp(i: number) {
    setData((p) => ({
      ...p,
      componentes: p.componentes.filter((_, idx) => idx !== i),
    }));
  }

  // Cronograma
  function updCron(i: number, patch: Partial<FilaCronograma>) {
    setData((p) => ({
      ...p,
      cronograma: p.cronograma.map((c, idx) =>
        idx === i ? { ...c, ...patch } : c,
      ),
    }));
  }
  function addCron() {
    setData((p) => ({
      ...p,
      cronograma: [...p.cronograma, { fase: "", duracion: "" }],
    }));
  }
  function delCron(i: number) {
    setData((p) => ({
      ...p,
      cronograma: p.cronograma.filter((_, idx) => idx !== i),
    }));
  }

  function handleNueva() {
    setData(piscinaDefaults);
    setCurrentId(null);
    setNombre("");
    setAutor(userEmail);
    clearDraft();
  }
  function handleCargar(item: SavedPiscina) {
    setData(item.data);
    setCurrentId(item.id);
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
      const res = await savePiscina({
        id: currentId,
        nombre: nombreVal,
        autor: autorVal,
        data,
      });
      setSaved(res.all);
      setCurrentId(res.saved.id);
      clearDraft();
      setSaveOpen(false);
    });
  }
  function handleEliminar(id: string) {
    if (!confirm("¿Eliminar esta propuesta?")) return;
    startTransition(async () => {
      const all = await removePiscina(id);
      setSaved(all);
      if (id === currentId) handleNueva();
    });
  }
  function handlePlanoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert("La imagen es muy grande (máx. 4 MB). Usa una versión más liviana.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set("planoDataUrl", String(reader.result));
    reader.readAsDataURL(file);
  }

  const [wordLoading, setWordLoading] = useState(false);
  async function handleWord() {
    setWordLoading(true);
    try {
      await descargarWord({
        filename: toFilename(`Propuesta Piscina ${data.cliente || ""}`).replace(/\.pdf$/, ".docx"),
        root: docRef.current,
        bodyHtml: wordBodyPiscina(data),
      });
    } catch (err) {
      console.error(err);
      alert("No se pudo generar el Word. Intenta de nuevo.");
    } finally {
      setWordLoading(false);
    }
  }

  async function handlePdf() {
    if (!docRef.current) return;
    setPdfLoading(true);
    try {
      await descargarPdfMultipagina(
        docRef.current,
        toFilename(`Propuesta Piscina ${data.cliente || ""}`),
        { footerText: "Proyectos del Agua PROASA · www.proasa.com.gt" },
      );
    } catch (err) {
      console.error(err);
      alert("No se pudo generar el PDF. Intenta de nuevo.");
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 dark:bg-zinc-950">
      <header className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <Link href="/" className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
            ← Inicio
          </Link>
          <h1 className="font-semibold text-zinc-800 dark:text-zinc-100">
            Propuesta de piscina
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePdf} disabled={pdfLoading} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60">
            {pdfLoading ? "Generando…" : "Descargar PDF"}
          </button>
          <button onClick={handleWord} disabled={wordLoading} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
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
          initialNombre={nombre || `Piscina — ${data.cliente}`.trim()}
          initialAutor={autor || userEmail}
          saving={isPending}
          onConfirm={doGuardar}
          onCancel={() => setSaveOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col lg:flex-row">
        <aside className="no-print w-full overflow-y-auto border-b border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 lg:h-[calc(100vh-57px)] lg:w-[28rem] lg:border-b-0 lg:border-r">
          <div className="space-y-6">
            {/* Guardadas */}
            <section className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">Propuesta</span>
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
                <ul className="mt-3 max-h-40 space-y-1 overflow-y-auto">
                  {saved.map((item) => (
                    <li key={item.id} className={`group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${item.id === currentId ? "bg-teal-50 dark:bg-teal-950/40" : "hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}>
                      <button onClick={() => handleCargar(item)} className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-zinc-800 dark:text-zinc-100">{item.data.cliente || "—"}</span>
                        <span className="block truncate text-[11px] text-zinc-400">{item.data.titulo}</span>
                      </button>
                      <button onClick={() => handleEliminar(item.id)} disabled={isPending} title="Eliminar" className="shrink-0 rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-60 dark:hover:bg-red-950/40">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" /></svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Portada */}
            <Grupo titulo="Portada">
              <Campo label="Título" value={data.titulo} onChange={(v) => set("titulo", v)} />
              <Area label="Subtítulo" value={data.subtitulo} onChange={(v) => set("subtitulo", v)} rows={2} />
              <Area label="Descripción del proyecto" value={data.descripcion} onChange={(v) => set("descripcion", v)} rows={5} />
              <ClienteAutocomplete
                labelClass="mb-1 block text-xs text-zinc-600 dark:text-zinc-400"
                value={data.cliente}
                onChange={(v) => set("cliente", v)}
                onSelect={(c) =>
                  setData((prev) => ({
                    ...prev,
                    cliente: c.nombre,
                    // En piscinas la "ubicación" es la dirección del proyecto.
                    ubicacion: c.direccion ?? prev.ubicacion,
                  }))
                }
                datosActuales={() => ({
                  nombre: data.cliente,
                  direccion: data.ubicacion,
                })}
              />
              <Campo label="Ubicación" value={data.ubicacion} onChange={(v) => set("ubicacion", v)} />
              <Campo label="Fecha de emisión" value={data.fechaEmision} onChange={(v) => set("fechaEmision", v)} />
              <Campo label="Vigencia de la oferta" value={data.vigencia} onChange={(v) => set("vigencia", v)} />
              <Area label="Modalidad" value={data.modalidad} onChange={(v) => set("modalidad", v)} rows={2} />
            </Grupo>

            {/* Secciones de texto */}
            <Grupo titulo="Secciones (texto)">
              <Area label="1. Alcance del proyecto" value={data.alcanceProyecto} onChange={(v) => set("alcanceProyecto", v)} rows={8} />
              <Area label="2. Alcance general y fases" value={data.fasesTexto} onChange={(v) => set("fasesTexto", v)} rows={12} />
              <Area label="3. Criterios de diseño" value={data.criterios} onChange={(v) => set("criterios", v)} rows={8} />
              <Area label="4. Supuestos, limitaciones y exclusiones" value={data.supuestos} onChange={(v) => set("supuestos", v)} rows={8} />
              <Area label="5. Alcances incluidos" value={data.alcancesIncluidos} onChange={(v) => set("alcancesIncluidos", v)} rows={8} />
            </Grupo>

            {/* Económica */}
            <Grupo titulo="Propuesta económica">
              <Area label="Texto introductorio" value={data.introEconomica} onChange={(v) => set("introEconomica", v)} rows={3} />
              <div className="flex gap-2">
                <Campo label="Nombre Opción 1" value={data.nombreOp1} onChange={(v) => set("nombreOp1", v)} />
                <Campo label="Nombre Opción 2" value={data.nombreOp2} onChange={(v) => set("nombreOp2", v)} />
              </div>

              <div className="space-y-2">
                <span className="text-xs text-zinc-500">Componentes (marca en qué opción se incluye)</span>
                {data.componentes.map((c, i) => (
                  <div key={i} className="rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
                    <div className="flex items-start gap-2">
                      <textarea value={c.nombre} onChange={(e) => updComp(i, { nombre: e.target.value })} rows={2} className={input} />
                      <button onClick={() => delComp(i)} title="Quitar" className="mt-1 shrink-0 rounded p-1 text-zinc-400 hover:text-red-600">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="mt-1 flex gap-4 text-xs text-zinc-600 dark:text-zinc-300">
                      <label className="flex items-center gap-1"><input type="checkbox" checked={c.op1} onChange={(e) => updComp(i, { op1: e.target.checked })} /> Opción 1</label>
                      <label className="flex items-center gap-1"><input type="checkbox" checked={c.op2} onChange={(e) => updComp(i, { op2: e.target.checked })} /> Opción 2</label>
                    </div>
                  </div>
                ))}
                <button onClick={addComp} className="w-full rounded-md border border-dashed border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:border-teal-400 hover:text-teal-700 dark:border-zinc-700 dark:text-zinc-400">+ Agregar componente</button>
              </div>

              <div className="flex gap-2">
                <Campo label="Subtotal Opción 1 (sin IVA)" value={data.subtotalOp1} onChange={(v) => set("subtotalOp1", v)} />
                <Campo label="Subtotal Opción 2 (sin IVA)" value={data.subtotalOp2} onChange={(v) => set("subtotalOp2", v)} />
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-md bg-zinc-50 px-3 py-2 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                <span>Total Op.1: <b>{formatQ(totalConIva(data.subtotalOp1))}</b></span>
                <span>Total Op.2: <b>{formatQ(totalConIva(data.subtotalOp2))}</b></span>
              </div>
              <Area label="Resumen / recomendación" value={data.resumenEconomico} onChange={(v) => set("resumenEconomico", v)} rows={5} />
            </Grupo>

            {/* Garantías y pago */}
            <Grupo titulo="Garantías y pago">
              <Area label="7. Anotaciones y garantías" value={data.garantiasTexto} onChange={(v) => set("garantiasTexto", v)} rows={9} />
              <Area label="8. Aceptación y condiciones de pago" value={data.condicionesPago} onChange={(v) => set("condicionesPago", v)} rows={7} />
            </Grupo>

            {/* Cronograma */}
            <Grupo titulo="Cronograma">
              <div className="space-y-2">
                {data.cronograma.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <textarea value={f.fase} onChange={(e) => updCron(i, { fase: e.target.value })} rows={2} className={input} placeholder="Fase" />
                    <input value={f.duracion} onChange={(e) => updCron(i, { duracion: e.target.value })} className={`${input} w-28`} placeholder="Duración" />
                    <button onClick={() => delCron(i)} title="Quitar" className="mt-1 shrink-0 rounded p-1 text-zinc-400 hover:text-red-600">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                <button onClick={addCron} className="w-full rounded-md border border-dashed border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:border-teal-400 hover:text-teal-700 dark:border-zinc-700 dark:text-zinc-400">+ Agregar fila</button>
              </div>
              <Area label="Nota del cronograma" value={data.cronogramaNota} onChange={(v) => set("cronogramaNota", v)} rows={3} />
            </Grupo>

            {/* Anexo A — Plano */}
            <Grupo titulo="Anexo A — Plano">
              <Area label="Descripción del plano" value={data.planoTexto} onChange={(v) => set("planoTexto", v)} rows={5} />
              <label className="block">
                <span className="mb-1 block text-xs text-zinc-600 dark:text-zinc-400">Imagen del plano (máx. 4 MB)</span>
                <input type="file" accept="image/*" onChange={handlePlanoFile} className="block w-full text-xs text-zinc-600 file:mr-2 file:rounded-md file:border-0 file:bg-teal-600 file:px-3 file:py-1.5 file:text-white hover:file:bg-teal-700 dark:text-zinc-300" />
              </label>
              {data.planoDataUrl && (
                <div className="flex items-center gap-3">
                  <img src={data.planoDataUrl} alt="Plano" className="h-16 w-auto rounded border border-zinc-300" />
                  <button onClick={() => set("planoDataUrl", "")} className="text-xs text-red-500 hover:underline">Quitar imagen</button>
                </div>
              )}
            </Grupo>

            {/* Cierre */}
            <Grupo titulo="Cierre">
              <Area label="Texto de cierre" value={data.cierreTexto} onChange={(v) => set("cierreTexto", v)} rows={3} />
              <div className="flex gap-2">
                <Campo label="Asesor" value={data.asesor} onChange={(v) => set("asesor", v)} />
                <Campo label="Cel." value={data.asesorCel} onChange={(v) => set("asesorCel", v)} />
              </div>
            </Grupo>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 lg:h-[calc(100vh-57px)] lg:p-8">
          <PreviewScaler>
            <div id="print-area" ref={docRef}>
              <PropuestaPiscinaDoc data={data} />
            </div>
          </PreviewScaler>
        </main>
      </div>
    </div>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-700">{titulo}</legend>
      <div className="space-y-3">{children}</div>
    </fieldset>
  );
}
function Campo({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block flex-1">
      <span className="mb-1 block text-xs text-zinc-600 dark:text-zinc-400">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} autoComplete="off" className={input} />
    </label>
  );
}
function Area({ label, value, onChange, rows }: { label: string; value: string; onChange: (v: string) => void; rows: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-zinc-600 dark:text-zinc-400">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className={input} />
    </label>
  );
}

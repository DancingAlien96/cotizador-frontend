"use client";

import { useEffect, useRef, useState } from "react";
import { listFrases } from "../actions/frases";
import type { CampoFrase } from "../lib/api";
import { FRASES_SEED } from "../lib/frases-seed";

// Textarea con autocompletado de frases: combina una lista semilla con lo que
// el sistema ha aprendido de cotizaciones anteriores (endpoint /api/frases).
// Tab o clic completan; ↑/↓ mueven la selección; Esc cierra.
export function AutocompleteTexto({
  campo,
  value,
  onChange,
  rows = 2,
  className,
  wrapperClassName = "relative",
  placeholder,
}: {
  campo: CampoFrase;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  className?: string;
  wrapperClassName?: string;
  placeholder?: string;
}) {
  const [historial, setHistorial] = useState<string[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [resalta, setResalta] = useState(0);
  const caja = useRef<HTMLDivElement>(null);

  // Trae del servidor las frases aprendidas que coinciden con lo escrito.
  useEffect(() => {
    if (!abierto) return;
    const t = setTimeout(async () => {
      setHistorial(await listFrases(campo, value).catch(() => []));
    }, 200);
    return () => clearTimeout(t);
  }, [value, abierto, campo]);

  useEffect(() => {
    function fuera(e: MouseEvent) {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, []);

  // Sugerencias: semilla + historial, filtradas por lo escrito, sin repetir y
  // sin ofrecer exactamente lo que ya está en el campo.
  const q = value.trim().toLowerCase();
  const semilla = FRASES_SEED[campo].filter((f) => !q || f.toLowerCase().includes(q));
  const sugerencias = [...new Set([...historial, ...semilla])]
    .filter((f) => f.toLowerCase() !== q)
    .slice(0, 8);

  const mostrar = abierto && sugerencias.length > 0;

  function aceptar(frase: string) {
    onChange(frase);
    setAbierto(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!mostrar) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setResalta((r) => (r + 1) % sugerencias.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setResalta((r) => (r - 1 + sugerencias.length) % sugerencias.length);
    } else if (e.key === "Tab") {
      // Solo intercepta Tab si hay una sugerencia para aplicar.
      e.preventDefault();
      aceptar(sugerencias[resalta] ?? sugerencias[0]);
    } else if (e.key === "Escape") {
      setAbierto(false);
    }
  }

  return (
    <div ref={caja} className={wrapperClassName}>
      <textarea
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setAbierto(true);
          setResalta(0);
        }}
        onFocus={() => setAbierto(true)}
        onKeyDown={onKeyDown}
        rows={rows}
        placeholder={placeholder}
        className={className}
      />
      {mostrar && (
        <div className="absolute z-30 mt-0.5 max-h-52 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          {sugerencias.map((f, i) => (
            <button
              key={f}
              type="button"
              onMouseEnter={() => setResalta(i)}
              onClick={() => aceptar(f)}
              className={`block w-full px-3 py-1.5 text-left text-zinc-700 dark:text-zinc-200 ${
                i === resalta ? "bg-teal-50 dark:bg-teal-950/40" : ""
              }`}
            >
              {f}
            </button>
          ))}
          <p className="px-3 pt-1 text-[10px] text-zinc-400">
            Tab o clic para completar
          </p>
        </div>
      )}
    </div>
  );
}

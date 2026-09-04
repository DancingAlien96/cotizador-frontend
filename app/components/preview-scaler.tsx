"use client";

import { useEffect, useRef, useState } from "react";

const BASE = 816; // ancho real del documento (tamaño carta)
const ALTO_HOJA = 1056; // alto real de una hoja carta (11" a 96 dpi)

// Escala la vista previa (documento fijo de 816px) para que quepa en el ancho
// disponible. En pantallas grandes queda 1:1 y centrado; en móvil se reduce
// proporcionalmente. En impresión se neutraliza vía CSS (.preview-scaled).
//
// Además marca dónde termina cada hoja: antes la vista previa era un pliego
// continuo y no se veía que el documento fuera a salir en varias páginas.
// Las guías van FUERA de #print-area, así que no entran ni al PDF ni al Word.
export function PreviewScaler({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState(0);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [alto, setAlto] = useState(0);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const recompute = () => {
      const w = outer.clientWidth;
      const s = Math.min(1, w / BASE);
      setScale(s);
      setOffset(Math.max(0, (w - BASE * s) / 2));
      setHeight(inner.offsetHeight * s);
      setAlto(inner.offsetHeight);
    };

    const ro = new ResizeObserver(recompute);
    ro.observe(outer);
    ro.observe(inner);
    recompute();
    return () => ro.disconnect();
  }, []);

  const hojas = Math.max(1, Math.ceil(alto / ALTO_HOJA));
  // Una guía por cada corte interno (con 2 hojas hay 1 corte).
  const cortes = Array.from({ length: hojas - 1 }, (_, i) => (i + 1) * ALTO_HOJA);

  return (
    <div
      ref={outerRef}
      className="preview-scaler relative w-full overflow-x-hidden"
      style={{ height }}
    >
      {hojas > 1 && (
        <span className="no-print absolute right-2 top-2 z-10 rounded-full bg-zinc-800/85 px-2 py-0.5 text-[11px] font-medium text-white">
          {hojas} hojas · carta
        </span>
      )}

      <div
        ref={innerRef}
        className="preview-scaled relative"
        style={{
          width: BASE,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          marginLeft: offset,
        }}
      >
        {children}

        {cortes.map((y, i) => (
          <div
            key={y}
            aria-hidden
            className="no-print pointer-events-none absolute left-0 z-10 w-full border-t-2 border-dashed border-rose-400/80"
            style={{ top: y }}
          >
            <span className="absolute right-0 -top-5 rounded-t bg-rose-400/80 px-1.5 text-[10px] font-medium text-white">
              fin de la hoja {i + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

const BASE = 816; // ancho real del documento (tamaño carta)

// Escala la vista previa (documento fijo de 816px) para que quepa en el ancho
// disponible. En pantallas grandes queda 1:1 y centrado; en móvil se reduce
// proporcionalmente. En impresión se neutraliza vía CSS (.preview-scaled).
export function PreviewScaler({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState(0);
  const [height, setHeight] = useState<number | undefined>(undefined);

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
    };

    const ro = new ResizeObserver(recompute);
    ro.observe(outer);
    ro.observe(inner);
    recompute();
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={outerRef}
      className="preview-scaler w-full overflow-x-hidden"
      style={{ height }}
    >
      <div
        ref={innerRef}
        className="preview-scaled"
        style={{
          width: BASE,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          marginLeft: offset,
        }}
      >
        {children}
      </div>
    </div>
  );
}

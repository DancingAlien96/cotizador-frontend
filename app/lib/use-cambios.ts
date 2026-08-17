"use client";

import { useEffect, useState } from "react";

// Detecta si el documento tiene cambios sin guardar comparando `data` contra
// una "línea base" (el último estado guardado/cargado). Además avisa por el
// navegador al cerrar/recargar/salir del sitio con cambios pendientes.
//
// El editor debe llamar `marcarLimpio(data)` cuando el documento queda
// sincronizado: al montar, al guardar, al cargar otra, al crear nueva y al
// abrir una versión.
export function useCambios(data: unknown) {
  const serialized = JSON.stringify(data);
  const [baseline, setBaseline] = useState(serialized);
  const dirty = serialized !== baseline;

  function marcarLimpio(d: unknown = data) {
    setBaseline(JSON.stringify(d));
  }

  // Aviso nativo al intentar cerrar/recargar/navegar fuera con cambios.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  return { dirty, marcarLimpio };
}

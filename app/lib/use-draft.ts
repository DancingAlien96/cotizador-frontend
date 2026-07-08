"use client";

import { useEffect, useRef, useState } from "react";

export type DraftEnvelope<T> = { snapshot: T; at: number };

// Auto-guardado de borrador en localStorage (por sección).
// - Guarda el `snapshot` (debounced) cuando el usuario cambia algo.
// - Al montar, lee un borrador previo; `canRestore` indica si hay uno para
//   ofrecer restaurar (y el usuario aún no editó en esta sesión).
export function useDraft<T>(key: string, snapshot: T) {
  const storageKey = `cotizador-draft:${key}`;
  const serialized = JSON.stringify(snapshot);

  const baseline = useRef<string | null>(null);
  if (baseline.current === null) baseline.current = serialized;

  const [draft, setDraft] = useState<DraftEnvelope<T> | null>(null);

  // Leer borrador existente una vez.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setDraft(JSON.parse(raw) as DraftEnvelope<T>);
    } catch {
      // localStorage no disponible o JSON inválido: ignorar.
    }
  }, [storageKey]);

  const dirty = serialized !== baseline.current;

  // Guardar (debounced) cuando hay cambios respecto al estado inicial.
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ snapshot, at: Date.now() }),
        );
      } catch {
        // Cuota excedida (p. ej. imagen muy grande): ignorar.
      }
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized]);

  function clear() {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignorar
    }
    setDraft(null);
    baseline.current = serialized;
  }

  const canRestore =
    !!draft && !dirty && JSON.stringify(draft.snapshot) !== baseline.current;

  return { draft, dirty, canRestore, clear };
}

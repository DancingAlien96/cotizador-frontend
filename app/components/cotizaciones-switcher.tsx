"use client";

import { useState } from "react";
import { EditorTienda } from "./editor-tienda";
import { EditorPrivada } from "./editor-privada";
import type { SavedTienda } from "../lib/store-tienda";
import type { SavedCotizacionPrivada } from "../lib/store-privadas";

export type Formato = "tienda" | "empresas";

export function CotizacionesSwitcher({
  tienda,
  empresas,
  siguienteNumero,
  userEmail,
  initialFormato = "tienda",
  initialSelectedId,
}: {
  tienda: SavedTienda[];
  empresas: SavedCotizacionPrivada[];
  siguienteNumero: string;
  userEmail: string;
  initialFormato?: Formato;
  initialSelectedId?: string;
}) {
  const [formato, setFormato] = useState<Formato>(initialFormato);
  // Tienda y Empresas comparten el correlativo: se mantiene aquí para que siga
  // actualizado al cambiar de formato sin recargar.
  const [sigNumero, setSigNumero] = useState(siguienteNumero);

  const selector = (
    <div className="flex rounded-lg border border-zinc-300 p-0.5 text-sm dark:border-zinc-700">
      {(["tienda", "empresas"] as const).map((f) => (
        <button
          key={f}
          onClick={() => setFormato(f)}
          className={`rounded-md px-3 py-1 capitalize transition-colors ${
            formato === f
              ? "bg-teal-600 font-medium text-white"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          {f === "tienda" ? "Tienda" : "Empresas"}
        </button>
      ))}
    </div>
  );

  // El ?id solo aplica al formato con el que se abrió desde el historial.
  const selectedId = (f: Formato) =>
    f === initialFormato ? initialSelectedId : undefined;

  return formato === "tienda" ? (
    <EditorTienda
      initialCotizaciones={tienda}
      siguienteNumero={sigNumero}
      onSiguienteNumero={setSigNumero}
      initialSelectedId={selectedId("tienda")}
      userEmail={userEmail}
      headerExtra={selector}
    />
  ) : (
    <EditorPrivada
      initialCotizaciones={empresas}
      siguienteNumero={sigNumero}
      onSiguienteNumero={setSigNumero}
      initialSelectedId={selectedId("empresas")}
      userEmail={userEmail}
      headerExtra={selector}
    />
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { listClientes, saveCliente } from "../actions/clientes";
import type { Cliente } from "../lib/api";

// Datos del cliente que maneja la cotización que está abierta. Cada formato
// llena solo los campos que tiene (Tienda no maneja dirección, etc.).
export type DatosCliente = {
  nombre: string;
  nit?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
};

// Campo de nombre de cliente con sugerencias de los clientes ya guardados.
// Al elegir uno, `onSelect` recibe el registro completo para que el editor
// reparta los campos como le corresponda a su formato.
// Mismo aspecto que los campos de los editores (ver `inputClass` en cada uno).
const inputClass =
  "w-full rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

export function ClienteAutocomplete({
  label = "Cliente",
  value,
  onChange,
  onSelect,
  datosActuales,
  // Piscina rotula con text-xs; el resto de editores con text-sm.
  labelClass = "mb-1 block text-sm text-zinc-600 dark:text-zinc-400",
}: {
  label?: string;
  value: string;
  onChange: (nombre: string) => void;
  onSelect: (cliente: Cliente) => void;
  // Lo que se guardaría al pulsar "Guardar cliente" desde esta cotización.
  datosActuales?: () => DatosCliente;
  labelClass?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [opciones, setOpciones] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(false);
  const [guardado, setGuardado] = useState<null | "ok" | "error">(null);
  const caja = useRef<HTMLDivElement>(null);

  // Busca en el servidor mientras se escribe (con respiro para no saturar).
  useEffect(() => {
    if (!abierto) return;
    setCargando(true);
    const t = setTimeout(async () => {
      try {
        setOpciones(await listClientes(value));
      } catch {
        setOpciones([]);
      } finally {
        setCargando(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [value, abierto]);

  // Cierra al hacer clic fuera.
  useEffect(() => {
    function fuera(e: MouseEvent) {
      if (caja.current && !caja.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, []);

  const yaExiste = opciones.some(
    (c) => c.nombre.toLowerCase() === value.trim().toLowerCase(),
  );

  async function guardarCliente() {
    if (!datosActuales) return;
    const datos = datosActuales();
    if (!datos.nombre.trim()) return;
    try {
      await saveCliente(datos);
      setGuardado("ok");
      setOpciones(await listClientes(value));
    } catch {
      setGuardado("error");
    }
    setTimeout(() => setGuardado(null), 2500);
  }

  return (
    <div ref={caja} className="relative">
      {/* El input va dentro del label, como el resto de campos de los editores. */}
      <label className="block">
        <span className={labelClass}>{label}</span>
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setAbierto(true);
          }}
          onFocus={() => setAbierto(true)}
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
          placeholder="Escribe para buscar…"
          className={inputClass}
        />
      </label>

      {abierto && (
        <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          {cargando && opciones.length === 0 && (
            <p className="px-3 py-2 text-xs text-zinc-400">Buscando…</p>
          )}
          {!cargando && opciones.length === 0 && (
            <p className="px-3 py-2 text-xs text-zinc-400">
              No hay clientes guardados que coincidan.
            </p>
          )}
          {opciones.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onSelect(c);
                setAbierto(false);
              }}
              className="block w-full px-3 py-1.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700"
            >
              <span className="block truncate text-sm text-zinc-800 dark:text-zinc-100">
                {c.nombre}
              </span>
              {(c.nit || c.telefono) && (
                <span className="block truncate text-[11px] text-zinc-400">
                  {[c.nit && `NIT ${c.nit}`, c.telefono].filter(Boolean).join(" · ")}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {datosActuales && value.trim() && !yaExiste && (
        <button
          type="button"
          onClick={guardarCliente}
          className="mt-1 text-[11px] font-medium text-teal-700 hover:underline dark:text-teal-400"
        >
          + Guardar este cliente para reutilizarlo
        </button>
      )}
      {guardado === "ok" && (
        <p className="mt-1 text-[11px] text-emerald-600">Cliente guardado.</p>
      )}
      {guardado === "error" && (
        <p className="mt-1 text-[11px] text-rose-600">No se pudo guardar.</p>
      )}
    </div>
  );
}

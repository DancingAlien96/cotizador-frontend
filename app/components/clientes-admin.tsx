"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { listClientes, removeCliente, saveCliente } from "../actions/clientes";
import type { Cliente } from "../lib/api";

const VACIO = {
  nombre: "",
  nit: "",
  direccion: "",
  telefono: "",
  correo: "",
  contacto: "",
  notas: "",
};

export function ClientesAdmin({ initial }: { initial: Cliente[] }) {
  const [clientes, setClientes] = useState(initial);
  const [q, setQ] = useState("");
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [creando, setCreando] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [firstRun, setFirstRun] = useState(true);

  useEffect(() => {
    if (firstRun) {
      setFirstRun(false);
      return;
    }
    const t = setTimeout(() => {
      startTransition(async () => setClientes(await listClientes(q)));
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function recargar() {
    startTransition(async () => setClientes(await listClientes(q)));
  }

  function eliminar(c: Cliente) {
    if (!confirm(`¿Eliminar a "${c.nombre}"? Las cotizaciones ya hechas no se tocan.`)) {
      return;
    }
    startTransition(async () => {
      await removeCliente(c.id);
      recargar();
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-teal-700 hover:underline">
            ← Volver
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-zinc-800 dark:text-zinc-100">
            Clientes
          </h1>
          <p className="text-sm text-zinc-500">
            Se autocompletan al escribir el nombre en cualquier cotización.
          </p>
        </div>
        <button
          onClick={() => setCreando(true)}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          Nuevo cliente
        </button>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nombre, NIT o contacto…"
        className="mb-4 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
              <th className="px-4 py-2.5 font-medium">Nombre</th>
              <th className="px-4 py-2.5 font-medium">NIT</th>
              <th className="px-4 py-2.5 font-medium">Contacto</th>
              <th className="px-4 py-2.5 font-medium">Teléfono</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className={isPending ? "opacity-50" : ""}>
            {clientes.map((c) => (
              <tr
                key={c.id}
                className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
              >
                <td className="px-4 py-2.5 text-zinc-800 dark:text-zinc-100">
                  {c.nombre}
                </td>
                <td className="px-4 py-2.5 text-zinc-500">{c.nit || "—"}</td>
                <td className="px-4 py-2.5 text-zinc-500">{c.contacto || "—"}</td>
                <td className="px-4 py-2.5 text-zinc-500">{c.telefono || "—"}</td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex justify-end gap-3">
                    {/* Reusa la búsqueda del historial para ver su seguimiento. */}
                    <Link
                      href={`/?q=${encodeURIComponent(c.nombre)}`}
                      className="text-xs font-medium text-teal-700 hover:underline"
                    >
                      Cotizaciones
                    </Link>
                    <button
                      onClick={() => setEditando(c)}
                      className="text-xs font-medium text-zinc-500 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminar(c)}
                      className="text-xs font-medium text-rose-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-zinc-400">
                  {q
                    ? "Ningún cliente coincide."
                    : "Aún no hay clientes. Agrega uno o guárdalo desde una cotización."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(creando || editando) && (
        <ClienteDialog
          cliente={editando}
          onCancel={() => {
            setCreando(false);
            setEditando(null);
          }}
          onSaved={() => {
            setCreando(false);
            setEditando(null);
            recargar();
          }}
        />
      )}
    </div>
  );
}

function ClienteDialog({
  cliente,
  onCancel,
  onSaved,
}: {
  cliente: Cliente | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    nombre: cliente?.nombre ?? VACIO.nombre,
    nit: cliente?.nit ?? "",
    direccion: cliente?.direccion ?? "",
    telefono: cliente?.telefono ?? "",
    correo: cliente?.correo ?? "",
    contacto: cliente?.contacto ?? "",
    notas: cliente?.notas ?? "",
  });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function set(k: keyof typeof form, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function guardar() {
    setError("");
    startTransition(async () => {
      try {
        await saveCliente({ id: cliente?.id, ...form });
        onSaved();
      } catch {
        setError("No se pudo guardar. ¿Ya existe otro cliente con ese nombre?");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-full w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl dark:bg-zinc-900">
        <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
          {cliente ? "Editar cliente" : "Nuevo cliente"}
        </h3>

        <div className="mt-4 space-y-3">
          <Campo label="Nombre *" value={form.nombre} onChange={(v) => set("nombre", v)} />
          <Campo label="NIT" value={form.nit} onChange={(v) => set("nit", v)} />
          <Campo label="Persona de contacto" value={form.contacto} onChange={(v) => set("contacto", v)} />
          <Campo label="Teléfono" value={form.telefono} onChange={(v) => set("telefono", v)} />
          <Campo label="Correo" value={form.correo} onChange={(v) => set("correo", v)} />
          <Campo label="Dirección" value={form.direccion} onChange={(v) => set("direccion", v)} />
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Notas</label>
            <textarea
              value={form.notas}
              onChange={(e) => set("notas", e.target.value)}
              rows={2}
              className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-rose-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={!form.nombre.trim() || isPending}
            className="rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {isPending ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-zinc-500">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        data-1p-ignore
        data-lpignore="true"
        className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      />
    </div>
  );
}

import { redirect } from "next/navigation";
import { getSession } from "../lib/session";
import { apiHistorial, type HistorialItem } from "../lib/api";
import { Alertas } from "../components/alertas";
import { HistorialGlobal } from "../components/historial-global";

export default async function SeguimientoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  // ?q= llega desde "Cotizaciones" en la ficha de un cliente.
  const { q = "" } = await searchParams;

  let historial: { items: HistorialItem[]; total: number } = { items: [], total: 0 };
  try {
    historial = await apiHistorial({ q, limit: 20, offset: 0 });
  } catch {
    // Si el backend no responde, mostramos el historial vacío.
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
        Seguimiento
      </h1>
      <p className="text-sm text-zinc-500">
        En qué va cada cotización y cuáles piden atención.
      </p>

      <Alertas />
      <HistorialGlobal initial={historial} initialQ={q} />
    </main>
  );
}

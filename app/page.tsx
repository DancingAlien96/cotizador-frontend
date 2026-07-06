import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "./lib/session";
import { apiHistorial, type HistorialItem } from "./lib/api";
import { AppHeader } from "./components/app-header";
import { HistorialGlobal } from "./components/historial-global";

type Categoria = {
  href: string;
  titulo: string;
  descripcion: string;
  icon: React.ReactNode;
};

const categorias: Categoria[] = [
  {
    href: "/privadas",
    titulo: "Cotizaciones tienda",
    descripcion: "Cotizaciones de venta en tienda.",
    icon: (
      <path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z" />
    ),
  },
  {
    href: "/guatecompras",
    titulo: "Cotizaciones Guatecompras",
    descripcion: "Eventos y concursos del portal Guatecompras.",
    icon: (
      <>
        <path d="M3 21h18M4 21V10M20 21V10M4 10l8-6 8 6M9 21v-6h6v6" />
      </>
    ),
  },
  {
    href: "/empresas",
    titulo: "Cotizaciones de empresas",
    descripcion: "Cotizaciones para empresas y corporativos.",
    icon: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="1.5" />
        <path d="M8 7V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3M3 13h18" />
      </>
    ),
  },
  {
    href: "/construccion-piscina",
    titulo: "Cotización construcción de piscina",
    descripcion: "Cotizaciones para proyectos de construcción de piscinas.",
    icon: (
      <>
        <path d="M2 6c.6.5 1.2 1 2.5 1C6 7 6 5 8.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      </>
    ),
  },
];

export default async function Home() {
  const session = await getSession();
  if (!session) redirect("/login");

  let historial: { items: HistorialItem[]; total: number } = { items: [], total: 0 };
  try {
    historial = await apiHistorial({ limit: 20, offset: 0 });
  } catch {
    // Si el backend no responde, mostramos el historial vacío.
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 dark:bg-zinc-950">
      <AppHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold text-zinc-800 dark:text-zinc-100">
            Cotizador PROMESA
          </h1>
          <p className="mt-2 text-zinc-500">
            Selecciona el tipo de cotización que deseas crear.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categorias.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-teal-50 text-teal-700 transition-colors group-hover:bg-teal-600 group-hover:text-white dark:bg-teal-950/40">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {c.icon}
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                {c.titulo}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">{c.descripcion}</p>
              <span className="mt-4 text-sm font-medium text-teal-700 group-hover:underline">
                Entrar →
              </span>
            </Link>
          ))}
        </div>

        <HistorialGlobal initial={historial} />
      </main>
    </div>
  );
}

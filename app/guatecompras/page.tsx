import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "../lib/session";
import { AppHeader } from "../components/app-header";

type Herramienta = {
  href: string;
  titulo: string;
  descripcion: string;
  icon: React.ReactNode;
  disabled?: boolean;
};

const herramientas: Herramienta[] = [
  {
    href: "/guatecompras/carta-garantia",
    titulo: "Carta de Garantía",
    descripcion: "Genera la carta de garantía del evento.",
    icon: (
      <>
        <path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    href: "/guatecompras/cotizacion",
    titulo: "Cotizaciones",
    descripcion: "Crea y administra cotizaciones de eventos.",
    icon: (
      <>
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </>
    ),
  },
];

export default async function GuatecomprasPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 dark:bg-zinc-950">
      <AppHeader backHref="/" />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-zinc-800 dark:text-zinc-100">
            Cotizaciones Guatecompras
          </h1>
          <p className="mt-2 text-zinc-500">
            Herramientas y documentos para eventos del portal Guatecompras.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {herramientas.map((h) => {
            const inner = (
              <>
                <div
                  className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${
                    h.disabled
                      ? "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                      : "bg-teal-50 text-teal-700 transition-colors group-hover:bg-teal-600 group-hover:text-white dark:bg-teal-950/40"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {h.icon}
                  </svg>
                </div>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                  {h.titulo}
                  {h.disabled && (
                    <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[11px] font-normal text-zinc-500 dark:bg-zinc-700 dark:text-zinc-300">
                      Próximamente
                    </span>
                  )}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">{h.descripcion}</p>
                {!h.disabled && (
                  <span className="mt-4 text-sm font-medium text-teal-700 group-hover:underline">
                    Abrir →
                  </span>
                )}
              </>
            );

            if (h.disabled) {
              return (
                <div
                  key={h.titulo}
                  className="flex cursor-not-allowed flex-col rounded-2xl border border-zinc-200 bg-white p-6 opacity-70 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {inner}
                </div>
              );
            }

            return (
              <Link
                key={h.titulo}
                href={h.href}
                className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                {inner}
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

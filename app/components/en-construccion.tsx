import Link from "next/link";
import { AppHeader } from "./app-header";

export function EnConstruccion({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 dark:bg-zinc-950">
      <AppHeader backHref="/" />
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-950/50">
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
          {titulo}
        </h1>
        {descripcion && (
          <p className="mt-2 max-w-md text-zinc-500">{descripcion}</p>
        )}
        <p className="mt-4 text-sm text-zinc-400">Sección en construcción.</p>
        <Link
          href="/"
          className="mt-6 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          Volver al inicio
        </Link>
      </main>
    </div>
  );
}

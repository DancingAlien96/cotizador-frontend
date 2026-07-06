import Link from "next/link";
import { logout } from "../actions/auth";

export function AppHeader({ backHref }: { backHref?: string }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            ← Volver
          </Link>
        )}
        <Link href="/" className="flex items-center">
          <span className="flex items-center rounded-lg bg-teal-600 px-2.5 py-1.5">
            <img
              src="/logocotizacionprivada.png"
              alt="PROMESA"
              className="h-8 w-auto"
            />
          </span>
        </Link>
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cerrar sesión
        </button>
      </form>
    </header>
  );
}

import Link from "next/link";

// Barra de "volver" para las pantallas intermedias. El logo, la navegación y
// el cierre de sesión viven en el sidebar (ver components/sidebar.tsx).
export function AppHeader({ backHref }: { backHref?: string }) {
  if (!backHref) return null;
  return (
    <header className="no-print flex items-center border-b border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
      <Link
        href={backHref}
        className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        ← Volver
      </Link>
    </header>
  );
}

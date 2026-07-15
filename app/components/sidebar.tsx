"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "../actions/auth";

// Rutas con vista previa del documento: ahí el sidebar se colapsa a iconos
// para no quitarle ancho a la hoja.
const EDITORES = [
  "/cotizaciones",
  "/guatecompras/cotizacion",
  "/guatecompras/carta-garantia",
  "/construccion-piscina",
];

type Seccion = { href: string; label: string; icon: React.ReactNode };

const SECCIONES: Seccion[] = [
  {
    href: "/",
    label: "Inicio",
    icon: <path d="M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />,
  },
  {
    href: "/seguimiento",
    label: "Seguimiento",
    icon: (
      <>
        <rect x="3" y="4" width="5" height="16" rx="1" />
        <rect x="10" y="4" width="5" height="11" rx="1" />
        <rect x="17" y="4" width="4" height="7" rx="1" />
      </>
    ),
  },
  {
    href: "/clientes",
    label: "Clientes",
    icon: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 20a5.5 5.5 0 0 0-2-4.3" />
      </>
    ),
  },
  {
    href: "/reportes",
    label: "Reportes",
    icon: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </>
    ),
  },
];

function esActiva(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  // El login no lleva navegación.
  if (pathname === "/login") return <>{children}</>;

  const compacto = EDITORES.some((r) => pathname.startsWith(r));

  return (
    <div className="flex min-h-screen">
      {/* Escritorio */}
      <aside
        className={`no-print sticky top-0 hidden h-screen shrink-0 flex-col border-r border-zinc-200 bg-white transition-[width] lg:flex dark:border-zinc-800 dark:bg-zinc-900 ${
          compacto ? "w-14" : "w-56"
        }`}
      >
        <Contenido compacto={compacto} pathname={pathname} />
      </aside>

      {/* Cajón en móvil */}
      {abierto && (
        <>
          <div
            className="no-print fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setAbierto(false)}
          />
          <aside className="no-print fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-zinc-200 bg-white lg:hidden dark:border-zinc-800 dark:bg-zinc-900">
            <Contenido
              compacto={false}
              pathname={pathname}
              onNavegar={() => setAbierto(false)}
            />
          </aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra superior solo en móvil, para abrir el cajón */}
        <div className="no-print flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-2 lg:hidden dark:border-zinc-800 dark:bg-zinc-900">
          <button
            onClick={() => setAbierto(true)}
            aria-label="Abrir menú"
            className="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Logo />
        </div>
        {children}
      </div>
    </div>
  );
}

function Logo() {
  return (
    <span className="flex items-center rounded-lg bg-teal-600 px-2 py-1.5">
      <img src="/logocotizacionprivada.png" alt="PROMESA" className="h-6 w-auto" />
    </span>
  );
}

function Contenido({
  compacto,
  pathname,
  onNavegar,
}: {
  compacto: boolean;
  pathname: string;
  onNavegar?: () => void;
}) {
  return (
    <>
      <Link
        href="/"
        onClick={onNavegar}
        className={`flex items-center border-b border-zinc-200 px-3 py-3 dark:border-zinc-800 ${
          compacto ? "justify-center" : ""
        }`}
      >
        <Logo />
      </Link>

      <nav className="flex-1 space-y-0.5 p-2">
        {SECCIONES.map((s) => {
          const activa = esActiva(pathname, s.href);
          return (
            <Link
              key={s.href}
              href={s.href}
              onClick={onNavegar}
              title={compacto ? s.label : undefined}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                compacto ? "justify-center" : ""
              } ${
                activa
                  ? "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px] shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {s.icon}
              </svg>
              {!compacto && s.label}
            </Link>
          );
        })}
      </nav>

      <form action={logout} className="border-t border-zinc-200 p-2 dark:border-zinc-800">
        <button
          type="submit"
          title={compacto ? "Cerrar sesión" : undefined}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 ${
            compacto ? "justify-center" : ""
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-[18px] w-[18px] shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 17l5-5-5-5M20 12H9M12 20H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6" />
          </svg>
          {!compacto && "Cerrar sesión"}
        </button>
      </form>
    </>
  );
}

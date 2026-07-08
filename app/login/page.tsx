"use client";

import { useActionState, useState } from "react";
import { login } from "../actions/auth";

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-100 px-4 dark:bg-zinc-950">
      <form
        action={action}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="flex items-center rounded-xl bg-teal-600 px-3 py-2">
            <img
              src="/logocotizacionprivada.png"
              alt="PROMESA"
              className="h-11 w-auto"
            />
          </span>
          <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
            Cotizador PROMESA
          </h1>
          <p className="text-sm text-zinc-500">Acceso privado</p>
        </div>

        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoFocus
          required
          className="mb-4 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />

        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 pr-10 text-zinc-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.7 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4.5 10 7a13.3 13.3 0 0 1-2.4 3.4M6.6 6.6C4 8.1 2.5 10.4 2 12c1 2.5 5 7 10 7 1.9 0 3.6-.6 5-1.5" />
                <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                <path d="M3 3l18 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-5 w-full rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
        >
          {pending ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}

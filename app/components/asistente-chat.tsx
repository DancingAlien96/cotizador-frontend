"use client";

import { useEffect, useRef, useState } from "react";
import { asistenteConfigurado, preguntarAsistente } from "../actions/asistente";

// Un mensaje de la conversación (mismo shape que espera el backend).
type MensajeChat = { role: "user" | "assistant"; content: string };

const BIENVENIDA =
  "¡Hola! Soy el asistente del Cotizador PROMESA. Puedo ayudarte con dudas de uso: cómo crear una cotización, agregar productos del inventario, dar seguimiento, ver reportes y más. ¿En qué te ayudo?";

// Chat de ayuda flotante (esquina inferior derecha). Aparece en todo el sistema
// menos en el login. Si el asistente no está configurado (sin API key) muestra
// un aviso en lugar del chat.
export function AsistenteChat() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  // null = aún no comprobado; true/false = resultado.
  const [configurado, setConfigurado] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const finRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Comprueba la configuración la primera vez que se abre.
  useEffect(() => {
    if (abierto && configurado === null) {
      asistenteConfigurado().then(setConfigurado).catch(() => setConfigurado(false));
    }
  }, [abierto, configurado]);

  // Baja al último mensaje.
  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, cargando, abierto]);

  useEffect(() => {
    if (abierto && configurado) inputRef.current?.focus();
  }, [abierto, configurado]);

  async function enviar() {
    const pregunta = texto.trim();
    if (!pregunta || cargando) return;
    setError(null);
    const nuevos: MensajeChat[] = [...mensajes, { role: "user", content: pregunta }];
    setMensajes(nuevos);
    setTexto("");
    setCargando(true);
    try {
      const reply = await preguntarAsistente(nuevos);
      setMensajes([...nuevos, { role: "assistant", content: reply }]);
    } catch {
      setError("No se pudo consultar al asistente. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  }

  return (
    <>
      {/* Botón flotante */}
      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          aria-label="Abrir asistente de ayuda"
          className="no-print fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-white shadow-lg transition-transform hover:scale-105 hover:bg-teal-800"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z" />
          </svg>
        </button>
      )}

      {/* Panel del chat */}
      {abierto && (
        <div className="no-print fixed bottom-5 right-5 z-40 flex h-[min(32rem,80vh)] w-[min(24rem,92vw)] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
          {/* Encabezado */}
          <div className="flex items-center justify-between bg-teal-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z" />
              </svg>
              <span className="text-sm font-semibold">Asistente PROMESA</span>
            </div>
            <button
              onClick={() => setAbierto(false)}
              aria-label="Cerrar"
              className="rounded-md p-1 hover:bg-white/20"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          {/* Conversación */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-zinc-50 p-3 text-sm dark:bg-zinc-950">
            {configurado === false ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                El asistente aún no está activado. Cuando se configure la clave de
                IA en el servidor, este chat empezará a responder. Escribe a
                soporte@piums.io para activarlo.
              </div>
            ) : (
              <>
                <Burbuja role="assistant">{BIENVENIDA}</Burbuja>
                {mensajes.map((m, i) => (
                  <Burbuja key={i} role={m.role}>
                    {m.content}
                  </Burbuja>
                ))}
                {cargando && (
                  <Burbuja role="assistant">
                    <span className="inline-flex gap-1">
                      <Punto /> <Punto /> <Punto />
                    </span>
                  </Burbuja>
                )}
                {error && (
                  <p className="text-center text-xs text-rose-600">{error}</p>
                )}
              </>
            )}
            <div ref={finRef} />
          </div>

          {/* Entrada */}
          {configurado !== false && (
            <div className="flex items-end gap-2 border-t border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
              <textarea
                ref={inputRef}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Escribe tu pregunta…"
                disabled={configurado === null}
                className="max-h-28 flex-1 resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <button
                onClick={enviar}
                disabled={cargando || !texto.trim() || configurado === null}
                aria-label="Enviar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function Burbuja({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
}) {
  const esUsuario = role === "user";
  return (
    <div className={`flex ${esUsuario ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 ${
          esUsuario
            ? "bg-teal-700 text-white"
            : "border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Punto() {
  return (
    <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
  );
}

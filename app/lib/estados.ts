import type { Estado } from "./api";

export type EstadoInfo = {
  label: string;
  // Píldora (historial y tarjetas del tablero)
  pill: string;
  // Punto de color (encabezado de columna del tablero)
  dot: string;
};

export const ESTADO_INFO: Record<Estado, EstadoInfo> = {
  PENDIENTE: {
    label: "Pendiente",
    pill: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
    dot: "bg-zinc-400",
  },
  EN_CURSO: {
    label: "En curso",
    pill: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  CONFIRMADA: {
    label: "Confirmada",
    pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  RECHAZADA: {
    label: "Rechazada",
    pill: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
    dot: "bg-rose-500",
  },
};

// Orden del pipeline: así se ven las columnas del tablero, de izquierda a derecha.
export const ESTADO_ORDEN: Estado[] = [
  "PENDIENTE",
  "EN_CURSO",
  "CONFIRMADA",
  "RECHAZADA",
];

// Motivos frecuentes de rechazo. Sin esto los reportes de "por qué perdemos"
// no sirven, porque cada quien escribiría el motivo distinto.
export const MOTIVOS_RECHAZO = [
  "Precio",
  "Tiempo de entrega",
  "Se fue con la competencia",
  "Ya no lo necesita",
  "Sin presupuesto",
  "No respondió",
  "Otro",
];

// Presentación de los tipos de cotización: etiqueta, color y a dónde se abre.
// Compartido por el historial (lista) y el tablero (Kanban).

export type TipoInfo = { label: string; ruta: string; color: string };

export const TIPO_INFO: Record<string, TipoInfo> = {
  TIENDA: {
    label: "Tienda",
    ruta: "/cotizaciones?formato=tienda",
    color: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  },
  GUATECOMPRAS: {
    label: "Guatecompras",
    ruta: "/guatecompras/cotizacion",
    color: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  },
  EMPRESAS: {
    label: "Empresas",
    ruta: "/cotizaciones?formato=empresas",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  },
  CARTA: {
    label: "Carta de Garantía",
    ruta: "/guatecompras/carta-garantia",
    color: "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
  },
  PISCINA: {
    label: "Piscina",
    ruta: "/construccion-piscina",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300",
  },
};

const DESCONOCIDO: TipoInfo = {
  label: "—",
  ruta: "/",
  color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export function tipoInfo(tipo: string): TipoInfo {
  return TIPO_INFO[tipo] ?? { ...DESCONOCIDO, label: tipo };
}

// Enlace para abrir una cotización en su editor, respetando el ?formato= que
// ya traen algunas rutas.
export function rutaAbrir(item: { tipo: string; id: string }): string {
  const { ruta } = tipoInfo(item.tipo);
  return `${ruta}${ruta.includes("?") ? "&" : "?"}id=${item.id}`;
}

import { parseNum } from "./cotizacion-privada";

export type ItemTienda = {
  descripcion: string;
  precio: string;
  cantidad: string;
  unidad: string;
};

export type CotizacionTiendaData = {
  fecha: string;
  validoHasta: string;
  asesor: string;
  cliente: string;
  nitCliente: string;
  // Contacto del membrete (encabezado)
  membreteCorreo: string;
  membreteTel1: string;
  membreteTel2: string;
  items: ItemTienda[];
  otros: string;
  terminos: string[];
};

export const tiendaDefaults: CotizacionTiendaData = {
  fecha: "19/6/26",
  validoHasta: "4/7/26",
  asesor: "Ing. Isabel Regalado",
  cliente: "USAC / FMVZ",
  nitCliente: "255117-9",
  membreteCorreo: "eregalado@aquaequipos.com",
  membreteTel1: "+502 3340 7786",
  membreteTel2: "4004 5414",
  items: [
    {
      descripcion:
        "Osmosis inversa de 600gpd - 5 etapas - Etapas de sedimentos, carbón activado, membrana de ósmosis inversa y pos-filtro + Filtro de resina mixta para agua desmineralizada + Lampara UV para desinfección",
      precio: "11300",
      cantidad: "1",
      unidad: "",
    },
  ],
  otros: "0",
  terminos: [
    "Precio incluye instalacion.",
    "Precio incluye Iva.",
    "Precio incluye set de medicion de TDS.",
  ],
};

export function totalItemTienda(it: ItemTienda): number {
  return parseNum(it.precio) * parseNum(it.cantidad);
}

export function subtotalTienda(items: ItemTienda[]): number {
  return items.reduce((acc, it) => acc + totalItemTienda(it), 0);
}

export function totalTienda(items: ItemTienda[], otros: string): number {
  return subtotalTienda(items) + parseNum(otros);
}

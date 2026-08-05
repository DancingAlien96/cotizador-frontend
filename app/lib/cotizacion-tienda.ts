import { parseNum } from "./cotizacion-privada";
import { fechaCorta, enDias } from "./fecha-actual";

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
  // Recuadro de datos (empresa emisora + contacto del cliente)
  empresaNombre: string;
  empresaNit: string;
  empresaDireccion: string;
  empresaCelular: string;
  empresaCorreo: string;
  validez: string;
  clienteCelular: string;
  clienteCorreo: string;
  items: ItemTienda[];
  otros: string;
  terminos: string[];
};

export const tiendaDefaults: CotizacionTiendaData = {
  fecha: "19/6/26",
  validoHasta: "4/7/26",
  asesor: "Ing. Isabel Regalado",
  // Datos del cliente: vacíos (se llenan por cotización).
  cliente: "",
  nitCliente: "",
  membreteCorreo: "eregalado@aquaequipos.com",
  membreteTel1: "+502 3340 7786",
  membreteTel2: "4004 5414",
  empresaNombre: "PROMESA",
  empresaNit: "1654601-6",
  empresaDireccion: "8va Avenida lote 17 Zona 2, Chiquimula",
  empresaCelular: "3340 7786 / 4004 5414",
  empresaCorreo: "eregalado@aquaequipos.com",
  validez: "20 días calendario",
  clienteCelular: "",
  clienteCorreo: "",
  // Un ítem en blanco listo para llenar.
  items: [{ descripcion: "", precio: "", cantidad: "1", unidad: "" }],
  otros: "0",
  terminos: ["Precio incluye Iva."],
};

// Defaults con la fecha de hoy (y "válido hasta" a 15 días). Se llama en el
// cliente al abrir una cotización nueva.
export function tiendaDefaultsHoy(): CotizacionTiendaData {
  return {
    ...tiendaDefaults,
    fecha: fechaCorta(),
    validoHasta: fechaCorta(enDias(15)),
  };
}

export function totalItemTienda(it: ItemTienda): number {
  return parseNum(it.precio) * parseNum(it.cantidad);
}

export function subtotalTienda(items: ItemTienda[]): number {
  return items.reduce((acc, it) => acc + totalItemTienda(it), 0);
}

export function totalTienda(items: ItemTienda[], otros: string): number {
  return subtotalTienda(items) + parseNum(otros);
}

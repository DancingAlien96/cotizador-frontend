import { fechaLarga } from "./fecha-actual";

export type ItemCotizacion = {
  cantidad: string;
  descripcion: string;
  precioUnidad: string;
};

export type CotizacionPrivadaData = {
  fecha: string;
  // Asesor (variable)
  asesorNombre: string;
  asesorTelefono: string;
  asesorCorreo: string;
  // Empresa (fijos, editables)
  empresaNombre: string;
  empresaDireccion: string;
  empresaNit: string;
  // Contacto del membrete (encabezado)
  membreteCorreo: string;
  membreteTel1: string;
  membreteTel2: string;
  // Cliente / destinatario
  clienteNombre: string;
  // Concepto de la oferta
  concepto: string;
  // Ítems y observaciones
  items: ItemCotizacion[];
  observaciones: string[];
};

export function cotizacionPrivadaDefaultsHoy(): CotizacionPrivadaData {
  return { ...cotizacionPrivadaDefaults, fecha: fechaLarga() };
}

export const cotizacionPrivadaDefaults: CotizacionPrivadaData = {
  fecha: "19 de mayo de 2026",
  asesorNombre: "Ing. Isabel Regalado",
  asesorTelefono: "3340-7786",
  asesorCorreo: "isabel@aquaequipos.com",
  empresaNombre: "PROMESA",
  empresaDireccion: "8va Avenida lote 17 Zona 2, Chiquimula, Chiquimula",
  empresaNit: "1654601-6",
  membreteCorreo: "eregalado@aquaequipos.com",
  membreteTel1: "+502 3340 7786",
  membreteTel2: "4004 5414",
  clienteNombre: "ABASTECIMIENTOS ABASA",
  concepto: "repuesto de bomba de alta presión",
  items: [
    {
      cantidad: "1",
      descripcion: "Kit de etapa VR1512-00/ 15KW/20HP 12 ETAPAS",
      precioUnidad: "26747",
    },
  ],
  observaciones: [
    "Tiempo de entrega: 2 meses luego de recibida la OC (producto de importación)",
    "Precio no incluye instalación",
    "Precio incluye IVA",
    "Forma de pago: 50% de anticipo y 50% al recibir",
  ],
};

// Teléfono fijo de la empresa (segundo número que acompaña al del asesor).
export const TELEFONO_EMPRESA = "4004-5414";

export function parseNum(v: string): number {
  const n = parseFloat(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

export function totalItem(item: ItemCotizacion): number {
  return parseNum(item.cantidad) * parseNum(item.precioUnidad);
}

export function totalGeneral(items: ItemCotizacion[]): number {
  return items.reduce((acc, it) => acc + totalItem(it), 0);
}

// Formatea un monto como "Q26,747.00" (separador de miles con coma).
export function formatQ(n: number): string {
  const [ent, dec] = n.toFixed(2).split(".");
  const conSep = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `Q${conSep}.${dec}`;
}

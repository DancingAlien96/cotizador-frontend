import type { ItemCotizacion } from "./cotizacion-privada";

export type { ItemCotizacion };

export type CotizacionGuatecomprasData = {
  fecha: string;
  numeroOperacion: string;
  cotizacionA: string;
  dirigidaA: string;
  direccion: string;
  // Empresa (fijos, editables)
  empresaNombre: string;
  razonSocial: string;
  empresaDireccion: string;
  empresaNit: string;
  regimen: string;
  telefono: string;
  correo1: string;
  correo2: string;
  // Ítems y observaciones
  items: ItemCotizacion[];
  observaciones: string[];
};

export const guatecomprasDefaults: CotizacionGuatecomprasData = {
  fecha: "01 de julio de 2026",
  numeroOperacion: "31050468",
  cotizacionA: "INSTITUTO GUATEMALTECO DE SEGURIDAD SOCIAL -IGSS-",
  dirigidaA: 'Hospital de Antigua Guatemala, Sacatepéquez "La Capitana"',
  direccion:
    "6ª. Avenida norte final Finca El Manchen La Antigua Guatemala, Sacatepéquez.",
  empresaNombre: "PROMESA",
  razonSocial: "Cesar Eduardo Regalado Salguero",
  empresaDireccion: "8va Avenida lote 17 Zona 2, Chiquimula",
  empresaNit: "1654601-6",
  regimen: "sujeto a pagos trimestrales",
  telefono: "4004-5414",
  correo1: "eregalado@aquaequipos.com",
  correo2: "isabelreg99@gmail.com",
  items: [
    {
      cantidad: "1",
      descripcion:
        "SUMINISTRO E INSTALACIÓN DE SISTEMA DE AGUA DESMINERALIZADA EN ÁREA DE CENTRAL DE EQUIPO",
      precioUnidad: "15000",
    },
  ],
  observaciones: [
    "Tiempo de entrega: 5 días hábiles al confirmar Orden de Compra.",
    "Garantía de 12 meses por desperfectos de fábrica.",
    "Sostenimiento de la oferta: 30 días hábiles",
    "Precio incluye IVA 12%",
    "Número de la cuenta bancaria registrada en el Inventario de Cuentas: 81-0088115-4 INTERBANCO – MONETARIA – CESAR EDUARDO REGALADO SALGUERO - PROMESA",
  ],
};

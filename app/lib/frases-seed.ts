import type { CampoFrase } from "./api";

// Frases de arranque para el autocompletado, mientras el sistema aprende de lo
// que se escribe. Son las típicas de PROMESA/Aquaequipos (tratamiento de agua).
export const FRASES_SEED: Record<CampoFrase, string[]> = {
  termino: [
    "Precio incluye Iva.",
    "Precio incluye instalación.",
    "Precio incluye set de medición de TDS.",
    "Precio incluye transporte.",
    "Precio incluye capacitación de uso.",
    "Precio no incluye Iva.",
    "Garantía de 1 año contra defectos de fábrica.",
    "Tiempo de entrega: 3 a 5 días hábiles.",
    "Validez de la oferta: 15 días.",
    "Forma de pago: 50% anticipo, 50% contra entrega.",
  ],
  descripcion: [
    "Filtro de sedimentos de 5 micras.",
    "Filtro de carbón activado granular.",
    "Membrana de ósmosis inversa.",
    "Lámpara UV para desinfección.",
    "Ablandador de agua con resina catiónica.",
    "Bomba de presión para sistema de ósmosis.",
    "Tanque hidroneumático.",
    "Sistema de cloración salina.",
    "Cambio de filtros y mantenimiento preventivo.",
    "Análisis de calidad de agua.",
  ],
  observacion: [
    "Precios expresados en Quetzales (GTQ).",
    "Los precios pueden variar según disponibilidad.",
    "Instalación sujeta a condiciones del sitio.",
    "Se requiere toma de agua y energía eléctrica en el punto de instalación.",
    "El mantenimiento se cotiza por separado.",
  ],
  concepto: [
    "Suministro e instalación de equipo de tratamiento de agua.",
    "Repuesto y mantenimiento de sistema de ósmosis inversa.",
    "Venta de equipo de purificación de agua.",
  ],
};

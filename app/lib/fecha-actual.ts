// Fecha de hoy con los formatos que usa cada cotización. Se calcula en el
// cliente (no en el servidor) para que sea la fecha real del usuario aunque
// el VPS esté en otra zona horaria.

// "17 de julio de 2026" — el formato largo de Empresas, Guatecompras,
// Piscina y Carta.
export function fechaLarga(d: Date = new Date()): string {
  return d.toLocaleDateString("es-GT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// "17/7/26" — el formato corto de Tienda (día/mes/año de 2 dígitos).
export function fechaCorta(d: Date = new Date()): string {
  const anio = String(d.getFullYear()).slice(-2);
  return `${d.getDate()}/${d.getMonth() + 1}/${anio}`;
}

// Hoy más N días (para "válido hasta").
export function enDias(dias: number, desde: Date = new Date()): Date {
  const d = new Date(desde);
  d.setDate(d.getDate() + dias);
  return d;
}

// Hoy más N meses (para la vigencia de la propuesta de piscina).
export function enMeses(meses: number, desde: Date = new Date()): Date {
  const d = new Date(desde);
  d.setMonth(d.getMonth() + meses);
  return d;
}

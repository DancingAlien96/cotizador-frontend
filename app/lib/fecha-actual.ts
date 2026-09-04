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

// "4 de septiembre de 2026" -> "4 sep 2026". Solo para la tabla de
// seguimiento, donde la fecha larga se partia en tres lineas y estiraba tanto
// el ancho como el alto de cada fila. Si el texto no tiene esa forma (por
// ejemplo "4/9/26", que usa Tienda) se devuelve tal cual.
const MESES_CORTOS: Record<string, string> = {
  enero: "ene",
  febrero: "feb",
  marzo: "mar",
  abril: "abr",
  mayo: "may",
  junio: "jun",
  julio: "jul",
  agosto: "ago",
  septiembre: "sep",
  octubre: "oct",
  noviembre: "nov",
  diciembre: "dic",
};

export function fechaCompacta(texto: string): string {
  const m = /^(\d{1,2}) de ([a-zA-ZáéíóúÁÉÍÓÚ]+) de (\d{4})$/.exec(texto.trim());
  if (!m) return texto;
  const mes = MESES_CORTOS[m[2].toLowerCase()];
  return mes ? `${m[1]} ${mes} ${m[3]}` : texto;
}

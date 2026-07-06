// Conversión de números a letras en español (para el total de la cotización).

const UNIDADES = [
  "",
  "uno",
  "dos",
  "tres",
  "cuatro",
  "cinco",
  "seis",
  "siete",
  "ocho",
  "nueve",
];

const DIEZ_A_VEINTINUEVE = [
  "diez",
  "once",
  "doce",
  "trece",
  "catorce",
  "quince",
  "dieciséis",
  "diecisiete",
  "dieciocho",
  "diecinueve",
  "veinte",
  "veintiuno",
  "veintidós",
  "veintitrés",
  "veinticuatro",
  "veinticinco",
  "veintiséis",
  "veintisiete",
  "veintiocho",
  "veintinueve",
];

const DECENAS = [
  "",
  "",
  "",
  "treinta",
  "cuarenta",
  "cincuenta",
  "sesenta",
  "setenta",
  "ochenta",
  "noventa",
];

const CENTENAS = [
  "",
  "ciento",
  "doscientos",
  "trescientos",
  "cuatrocientos",
  "quinientos",
  "seiscientos",
  "setecientos",
  "ochocientos",
  "novecientos",
];

function decenasYUnidades(n: number): string {
  if (n < 10) return UNIDADES[n];
  if (n <= 29) return DIEZ_A_VEINTINUEVE[n - 10];
  const d = Math.floor(n / 10);
  const u = n % 10;
  return u === 0 ? DECENAS[d] : `${DECENAS[d]} y ${UNIDADES[u]}`;
}

function centenas(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cien";
  const c = Math.floor(n / 100);
  const r = n % 100;
  const parte = CENTENAS[c];
  return r === 0 ? parte : `${parte} ${decenasYUnidades(r)}`.trim();
}

// Apocopa "uno" -> "un" y "veintiuno" -> "veintiún" (antes de "mil"/"millones"/moneda).
function apocopar(palabras: string): string {
  if (palabras.endsWith("veintiuno")) {
    return palabras.slice(0, -"veintiuno".length) + "veintiún";
  }
  if (palabras.endsWith("uno")) {
    return palabras.slice(0, -"uno".length) + "un";
  }
  return palabras;
}

// Entero 0..999,999,999 a palabras (sin moneda).
export function enteroALetras(num: number): string {
  if (num === 0) return "cero";

  const millones = Math.floor(num / 1_000_000);
  const resto = num % 1_000_000;
  const miles = Math.floor(resto / 1000);
  const cientos = resto % 1000;

  const partes: string[] = [];

  if (millones > 0) {
    partes.push(
      millones === 1
        ? "un millón"
        : `${apocopar(enteroALetras(millones))} millones`,
    );
  }
  if (miles > 0) {
    partes.push(miles === 1 ? "mil" : `${apocopar(centenas(miles))} mil`);
  }
  if (cientos > 0) {
    partes.push(centenas(cientos));
  }

  return partes.join(" ").trim();
}

// Total en quetzales a letras, ej: "Veintiséis mil setecientos cuarenta y siete quetzales exactos."
export function quetzalesEnLetras(total: number): string {
  const entero = Math.floor(total);
  const centavos = Math.round((total - entero) * 100);

  let palabras = apocopar(enteroALetras(entero));
  const moneda = entero === 1 ? "quetzal" : "quetzales";

  let frase = `${palabras} ${moneda}`;
  frase +=
    centavos === 0
      ? " exactos"
      : ` con ${String(centavos).padStart(2, "0")}/100`;

  frase = frase.charAt(0).toUpperCase() + frase.slice(1) + ".";
  return frase;
}

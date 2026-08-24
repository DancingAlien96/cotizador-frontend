// Piezas para construir documentos Word (.docx) REALES con la librería `docx`.
// Antes se generaba HTML que Word reinterpretaba (afchunk.mht) y los formatos
// salían mal; ahora se arma OOXML nativo, con anchos de columna, sombreado,
// bordes e imágenes exactos.

import {
  AlignmentType,
  BorderStyle,
  ImageRun,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

export const FUENTE = "Times New Roman";

// Ancho útil de la hoja (Carta 12240 twips menos márgenes de 1.4cm por lado).
export const CONTENT_TWIPS = 10652;

const TW_POR_CM = 566.9291; // 1440 / 2.54
export const cm = (v: number) => Math.round(v * TW_POR_CM); // cm -> twips
export const cmPx = (v: number) => Math.round((v * 96) / 2.54); // cm -> px (96 dpi)

export const ALINE = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
  justify: AlignmentType.JUSTIFIED,
} as const;
export type Alineacion = keyof typeof ALINE;

// ---------- Texto ----------
export type EstiloRun = {
  bold?: boolean;
  italics?: boolean;
  underline?: boolean;
  color?: string; // hex sin "#"
  size?: number; // medios puntos (22 = 11pt)
  break?: number;
};

export function t(text: string, e: EstiloRun = {}): TextRun {
  return new TextRun({
    text: String(text ?? ""),
    font: FUENTE,
    size: e.size ?? 22,
    bold: e.bold,
    italics: e.italics,
    color: e.color,
    underline: e.underline ? {} : undefined,
    break: e.break,
  });
}

export type OpcPar = {
  align?: Alineacion;
  after?: number;
  before?: number;
  indent?: number; // sangría de primera línea (twips)
  shading?: string; // color de fondo (hex sin #)
};

export function par(runs: (TextRun | string)[], o: OpcPar = {}): Paragraph {
  return new Paragraph({
    alignment: o.align ? ALINE[o.align] : undefined,
    spacing: { after: o.after ?? 120, before: o.before },
    indent: o.indent ? { firstLine: o.indent } : undefined,
    shading: o.shading
      ? { type: ShadingType.CLEAR, color: "auto", fill: o.shading }
      : undefined,
    children: runs.map((r) => (typeof r === "string" ? t(r) : r)),
  });
}

// Texto de varias líneas (los "\n" se vuelven saltos dentro del mismo párrafo).
export function parLineas(
  text: string,
  o: OpcPar & EstiloRun = {},
): Paragraph {
  const lineas = String(text ?? "").split("\n");
  const runs = lineas.map((ln, i) =>
    t(ln, {
      size: o.size,
      color: o.color,
      bold: o.bold,
      break: i > 0 ? 1 : undefined,
    }),
  );
  return new Paragraph({
    alignment: o.align ? ALINE[o.align] : undefined,
    spacing: { after: o.after ?? 120, before: o.before },
    children: runs,
  });
}

export function vinieta(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 40 },
    children: [t(text)],
  });
}

// Título de sección (usado en la propuesta de piscina).
export function seccionTitulo(
  n: number | string,
  titulo: string,
  color = "0027A5",
): Paragraph {
  return new Paragraph({
    spacing: { before: 220, after: 90 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color, space: 2 } },
    children: [t(`${n}. ${titulo}`, { bold: true, color, size: 26 })],
  });
}

// ---------- Imágenes ----------
export async function bytesImagen(src: string): Promise<Uint8Array | null> {
  try {
    const r = await fetch(src);
    return new Uint8Array(await r.arrayBuffer());
  } catch {
    return null;
  }
}

// Dimensiones reales (cualquier formato). Corre en el navegador.
export function dimImagen(src: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
    img.onerror = () => resolve({ w: 1, h: 1 });
    img.src = src;
  });
}

function tipoImagen(src: string): "png" | "jpg" | "gif" | "bmp" {
  const s = src.slice(0, 40).toLowerCase();
  if (s.includes("jpeg") || s.includes("jpg")) return "jpg";
  if (s.includes("gif")) return "gif";
  if (s.includes("bmp")) return "bmp";
  return "png";
}

// Párrafo con una imagen de ancho fijo (cm) y alto proporcional.
export async function imagenCm(
  src: string,
  anchoCm: number,
  align: Alineacion = "right",
): Promise<Paragraph | null> {
  const bytes = await bytesImagen(src);
  if (!bytes) return null;
  const { w, h } = await dimImagen(src);
  const wpx = cmPx(anchoCm);
  const hpx = Math.round((wpx * h) / w);
  return new Paragraph({
    alignment: ALINE[align],
    spacing: { before: 60, after: 60 },
    children: [
      new ImageRun({
        type: tipoImagen(src),
        data: bytes,
        transformation: { width: wpx, height: hpx },
      }),
    ],
  });
}

// ---------- Tablas ----------
export type Celda = {
  text?: string;
  runs?: TextRun[];
  children?: (Paragraph | Table)[]; // contenido libre (párrafos o tabla anidada)
  align?: Alineacion;
  bold?: boolean;
  fill?: string; // fondo (hex sin #)
  color?: string; // color de texto
  size?: number;
};

function bordeCelda(borde: string) {
  const estilo =
    borde === "none"
      ? { style: BorderStyle.NONE, size: 0, color: "auto" }
      : { style: BorderStyle.SINGLE, size: 4, color: borde };
  return { top: estilo, bottom: estilo, left: estilo, right: estilo };
}

function celda(c: Celda, widthDxa: number, borde: string): TableCell {
  const contenido: (Paragraph | Table)[] =
    c.children ??
    [
      new Paragraph({
        alignment: c.align ? ALINE[c.align] : undefined,
        children:
          c.runs ?? [t(c.text ?? "", { bold: c.bold, color: c.color, size: c.size })],
      }),
    ];
  return new TableCell({
    width: { size: widthDxa, type: WidthType.DXA },
    shading: c.fill
      ? { type: ShadingType.CLEAR, color: "auto", fill: c.fill }
      : undefined,
    margins: { top: 50, bottom: 50, left: 90, right: 90 },
    borders: bordeCelda(borde),
    children: contenido,
  });
}

// colsPct: porcentajes del ancho útil (deben sumar ~100).
export function tabla(
  colsPct: number[],
  filas: Celda[][],
  o: { borde?: string } = {},
): Table {
  const borde = o.borde ?? "000000";
  const widths = colsPct.map((p) => Math.round((CONTENT_TWIPS * p) / 100));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: widths,
    layout: TableLayoutType.FIXED,
    rows: filas.map(
      (f) =>
        new TableRow({
          children: f.map((c, i) => celda(c, widths[i] ?? widths[0], borde)),
        }),
    ),
  });
}

// Bloque de datos "Etiqueta: valor" (una línea por par no vacío).
export function bloqueDatos(
  pares: [string, string][],
  o: OpcPar & { size?: number } = {},
): Paragraph {
  const size = o.size ?? 20;
  const items = pares.filter(([, v]) => (v ?? "").trim());
  const runs: TextRun[] = [];
  items.forEach(([et, v], i) => {
    runs.push(t(`${et}: `, { bold: true, size, break: i > 0 ? 1 : undefined }));
    runs.push(t(v, { size }));
  });
  return new Paragraph({
    spacing: { after: o.after ?? 120 },
    children: runs.length ? runs : [t("")],
  });
}

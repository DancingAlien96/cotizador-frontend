// Exportación a Word (.docx) NATIVO con la librería `docx`.
// Antes se generaba HTML que Word reinterpretaba (afchunk.mht) y los formatos
// (anchos de columna, sombreado, márgenes) salían mal. Ahora se construye OOXML
// real. El membrete (gráfico) se inserta como imagen para conservar el diseño;
// el resto va como párrafos y tablas editables.

import {
  Document,
  ImageRun,
  Packer,
  Paragraph,
  Table,
} from "docx";
import { bytesImagen, cm } from "./word-kit";
import {
  aDataUrl,
  membreteASvg,
  noTieneNadaVisible,
  sobreBlanco,
  svgALienzo,
} from "./membrete-svg";

type Html2Canvas = typeof import("html2canvas-pro").default;

// Rasteriza el membrete por la via SVG; si falla, vuelve al render clasico de
// html2canvas (mejor un membrete amontonado que ninguno).
async function capturarMembrete(
  m: HTMLElement,
  html2canvas: Html2Canvas,
): Promise<HTMLCanvasElement> {
  try {
    const logos = new Map<HTMLImageElement, string>();
    await Promise.all(
      Array.from(m.querySelectorAll("img")).map(async (img) => {
        const d = await aDataUrl(img.src);
        if (d) logos.set(img, d);
      }),
    );
    const r = m.getBoundingClientRect();
    const lienzo = await svgALienzo(membreteASvg(m, logos), r.width, r.height);
    if (!noTieneNadaVisible(lienzo)) return lienzo;
  } catch {
    /* cae al render clasico */
  }
  return sobreBlanco(
    await html2canvas(m, { scale: 2, useCORS: true, backgroundColor: "#ffffff" }),
  );
}

// Imagen a ancho de página completo (para membrete de encabezado/pie).
async function imagenAncho(dataUrl: string, ratioHW: number): Promise<Paragraph | null> {
  const bytes = await bytesImagen(dataUrl);
  if (!bytes) return null;
  const wpx = 710; // ancho útil de la hoja en px (≈ 18.8 cm a 96 dpi)
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new ImageRun({
        type: "png",
        data: bytes,
        transformation: { width: wpx, height: Math.round(wpx * ratioHW) },
      }),
    ],
  });
}

export async function descargarWord(opts: {
  filename: string;
  /** Nodo que contiene el documento renderizado (para tomar el membrete). */
  root: HTMLElement | null;
  /** Cuerpo del documento como elementos `docx` (párrafos y tablas). */
  children: (Paragraph | Table)[];
}): Promise<void> {
  const { default: html2canvas } = await import("html2canvas-pro");

  // Membrete (encabezado y pie) como imágenes, capturadas del documento.
  const membretes = opts.root
    ? Array.from(opts.root.querySelectorAll<HTMLElement>(".membrete"))
    : [];
  const imgs: { dataUrl: string; ratio: number }[] = [];
  for (const m of membretes) {
    const canvas = await capturarMembrete(m, html2canvas);
    imgs.push({
      dataUrl: canvas.toDataURL("image/png"),
      ratio: canvas.height / canvas.width,
    });
  }

  const cuerpo: (Paragraph | Table)[] = [];
  if (imgs[0]) {
    const h = await imagenAncho(imgs[0].dataUrl, imgs[0].ratio);
    if (h) cuerpo.push(h);
  }
  cuerpo.push(...opts.children);
  if (imgs[1]) {
    const f = await imagenAncho(imgs[1].dataUrl, imgs[1].ratio);
    if (f) cuerpo.push(f);
  }

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Times New Roman", size: 22 } } },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 }, // Carta (Letter)
            margin: {
              top: cm(0.5),
              bottom: cm(0.5),
              left: cm(1.4),
              right: cm(1.4),
            },
          },
        },
        children: cuerpo,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = opts.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

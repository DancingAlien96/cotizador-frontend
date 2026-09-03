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

type Html2Canvas = typeof import("html2canvas-pro").default;

// Descarga un recurso y lo devuelve como data URI.
async function aDataUrl(src: string): Promise<string | null> {
  try {
    const blob = await (await fetch(src)).blob();
    return await new Promise<string | null>((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = () => resolve(null);
      fr.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ¿La captura no tiene nada visible? foreignObject a veces falla en silencio y
// devuelve un lienzo vacío o totalmente transparente; ahí hay que reintentar.
//
// Ojo con el canal alfa: un pixel transparente es (0,0,0,0), así que mirar solo
// el RGB lo confunde con negro y da el lienzo por bueno. Eso metía en el .docx
// una imagen invisible y el membrete parecía haber desaparecido.
function noTieneNadaVisible(canvas: HTMLCanvasElement): boolean {
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let visibles = 0;
    for (let i = 0; i < data.length; i += 4 * 64) {
      if (data[i + 3] < 16) continue; // transparente: no se ve
      if (data[i] < 240 || data[i + 1] < 240 || data[i + 2] < 240) {
        if (++visibles > 20) return false;
      }
    }
    return true;
  } catch {
    return false; // lienzo contaminado: no podemos juzgar, lo damos por bueno
  }
}

// Aplana sobre blanco: Word no maneja bien un PNG con transparencia y el
// membrete se veria descolorido o invisible.
function sobreBlanco(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const plano = document.createElement("canvas");
  plano.width = canvas.width;
  plano.height = canvas.height;
  const ctx = plano.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, plano.width, plano.height);
  ctx.drawImage(canvas, 0, 0);
  return plano;
}

// Rasteriza el membrete.
//
// Se usa foreignObjectRendering porque el trazado del texto lo hace el propio
// navegador. El render clásico de html2canvas coloca cada palabra usando
// measureText(), y los navegadores con protección anti-fingerprinting (Brave)
// alteran esa medida: el texto del membrete salía amontonado en el .docx.
//
// Dentro del SVG de foreignObject no se cargan recursos externos, así que el
// logo se incrusta temporalmente como data URI. Si aun así el resultado sale
// vacío, se vuelve al render clásico (mejor amontonado que en blanco).
async function capturarMembrete(
  m: HTMLElement,
  html2canvas: Html2Canvas,
): Promise<HTMLCanvasElement> {
  const comun = { scale: 2, useCORS: true, backgroundColor: "#ffffff" };
  const imgs = Array.from(m.querySelectorAll("img"));
  const originales = imgs.map((i) => i.src);
  try {
    await Promise.all(
      imgs.map(async (img) => {
        const d = await aDataUrl(img.src);
        if (!d) return;
        img.src = d;
        await img.decode().catch(() => {});
      }),
    );
    const canvas = await html2canvas(m, { ...comun, foreignObjectRendering: true });
    if (!noTieneNadaVisible(canvas)) return sobreBlanco(canvas);
  } catch {
    /* cae al render clásico */
  } finally {
    imgs.forEach((img, n) => {
      img.src = originales[n];
    });
  }
  return sobreBlanco(await html2canvas(m, comun));
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

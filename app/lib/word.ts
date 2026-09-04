// Exportación a Word (.docx) NATIVO con la librería `docx`.
// Antes se generaba HTML que Word reinterpretaba (afchunk.mht) y los formatos
// (anchos de columna, sombreado, márgenes) salían mal. Ahora se construye OOXML
// real. El membrete (gráfico) se inserta como imagen para conservar el diseño;
// el resto va como párrafos y tablas editables.

import {
  Document,
  Footer,
  Header,
  HorizontalPositionRelativeFrom,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TextWrappingType,
  VerticalPositionRelativeFrom,
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

// El membrete va en el ENCABEZADO/PIE reales de Word, no como un párrafo más
// del cuerpo: antes el pie caía donde terminara el contenido en vez de al pie
// de la hoja. Word los ancla a la página y los repite si hay varias.
//
// La imagen es FLOTANTE anclada a la PÁGINA, no en línea. En línea Word ignora
// la sangría negativa: la dibujaba desde el margen izquierdo (39.7pt) con el
// ancho completo de la hoja (612pt), así que se salía 39.7pt por la derecha y
// recortaba el final del texto del membrete.
const PAGINA_PX = 816; // 8.5" a 96 dpi
const ALTO_PAGINA_PX = 1056; // 11" a 96 dpi
const TWIPS_POR_PX = 15; // 1440 / 96
const EMU_POR_PX = 9525; // 914400 / 96

async function membreteAncho(
  dataUrl: string,
  ratioHW: number,
  donde: "arriba" | "abajo",
): Promise<{ par: Paragraph; altoTwips: number } | null> {
  const bytes = await bytesImagen(dataUrl);
  if (!bytes) return null;
  const altoPx = Math.round(PAGINA_PX * ratioHW);
  const desdeArriba = donde === "arriba" ? 0 : (ALTO_PAGINA_PX - altoPx) * EMU_POR_PX;
  return {
    altoTwips: altoPx * TWIPS_POR_PX,
    par: new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [
        new ImageRun({
          type: "png",
          data: bytes,
          transformation: { width: PAGINA_PX, height: altoPx },
          floating: {
            horizontalPosition: {
              relative: HorizontalPositionRelativeFrom.PAGE,
              offset: 0,
            },
            verticalPosition: {
              relative: VerticalPositionRelativeFrom.PAGE,
              offset: desdeArriba,
            },
            wrap: { type: TextWrappingType.NONE },
            allowOverlap: true,
          },
        }),
      ],
    }),
  };
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

  const encabezado = imgs[0]
    ? await membreteAncho(imgs[0].dataUrl, imgs[0].ratio, "arriba")
    : null;
  const pie = imgs[1]
    ? await membreteAncho(imgs[1].dataUrl, imgs[1].ratio, "abajo")
    : null;

  // Los márgenes reservan el alto del membrete más el aire que deja el
  // documento en pantalla (.cotizacion-body: 24px arriba, 16px abajo), para
  // que el cuerpo nunca se le encime.
  const margenSup = (encabezado?.altoTwips ?? 0) + 360;
  const margenInf = (pie?.altoTwips ?? 0) + 240;

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
              top: margenSup,
              bottom: margenInf,
              left: cm(1.4),
              right: cm(1.4),
              header: 0,
              footer: 0,
            },
          },
        },
        headers: encabezado
          ? { default: new Header({ children: [encabezado.par] }) }
          : undefined,
        footers: pie ? { default: new Footer({ children: [pie.par] }) } : undefined,
        children: opts.children,
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

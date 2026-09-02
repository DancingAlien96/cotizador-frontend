// Generación de PDF en el cliente a partir del documento renderizado.
// html2canvas-pro soporta colores modernos (oklch de Tailwind v4); el
// html2canvas clásico no. Las librerías se importan de forma dinámica para
// no incluirlas en el bundle inicial.
//
// Todos los documentos se generan a TAMAÑO REAL en varias páginas cuando hace
// falta (antes se encogían para caber en una sola hoja y quedaban diminutos).
// El corte entre páginas busca una banda en blanco para no partir una fila de
// la tabla por la mitad.

// Calcula los puntos de corte (en px del canvas) para paginar sin partir filas.
// Para cada página busca, cerca del límite ideal, la fila más "blanca" (menos
// texto) y corta ahí. Si el canvas está contaminado (imágenes sin CORS) o no
// encuentra banda blanca, corta en el límite exacto.
function calcularCortes(canvas: HTMLCanvasElement, sliceHpx: number): number[] {
  const h = canvas.height;
  if (h <= sliceHpx) return [0, h];

  let dark: Uint32Array | null = null;
  try {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const data = ctx!.getImageData(0, 0, w, h).data;
    dark = new Uint32Array(h);
    const stepX = 4; // muestreo horizontal (velocidad)
    for (let y = 0; y < h; y++) {
      let c = 0;
      const base = y * w * 4;
      for (let x = 0; x < w; x += stepX) {
        const i = base + x * 4;
        // Cuenta como "oscuro" cualquier pixel que no sea casi blanco.
        if (data[i] < 245 || data[i + 1] < 245 || data[i + 2] < 245) c++;
      }
      dark[y] = c;
    }
  } catch {
    dark = null; // canvas contaminado -> cortes duros
  }

  const cortes = [0];
  let start = 0;
  const ventana = Math.round(sliceHpx * 0.16); // hasta dónde subir buscando blanco
  const minPagina = Math.round(sliceHpx * 0.5); // no cortar antes del 50% de la hoja
  while (start < h) {
    const ideal = start + sliceHpx;
    if (ideal >= h) {
      cortes.push(h);
      break;
    }
    let best = ideal;
    if (dark) {
      let bestDark = Infinity;
      const limite = Math.max(start + minPagina, ideal - ventana);
      for (let y = ideal; y >= limite; y--) {
        if (dark[y] < bestDark) {
          bestDark = dark[y];
          best = y;
          if (bestDark === 0) break; // banda totalmente blanca: corte perfecto
        }
      }
    }
    if (best <= start) best = ideal; // seguridad
    cortes.push(best);
    start = best;
  }
  return cortes;
}

async function renderPdf(
  element: HTMLElement,
  filename: string,
  options: { footerText?: string } = {},
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  // Espera a que las fuentes web terminen de cargar antes de rasterizar.
  try {
    await (document as unknown as { fonts?: { ready?: Promise<unknown> } }).fonts
      ?.ready;
  } catch {
    /* navegadores sin document.fonts: continuar */
  }

  const canvas = await html2canvas(element, {
    scale: 2, // mayor nitidez
    useCORS: true,
    backgroundColor: "#ffffff",
    // Geist (next/font) es una fuente VARIABLE; html2canvas mide mal el ancho
    // del espacio con fuentes variables y el texto sale amontonado
    // ("Nombredelaempresa"). Al clonar el DOM forzamos una fuente no-variable
    // web-safe (visualmente casi idéntica) solo para el render del PDF.
    onclone: (doc) => {
      const style = doc.createElement("style");
      style.textContent =
        "*{font-family:Arial,Helvetica,'Liberation Sans',sans-serif !important;font-variation-settings:normal !important}";
      doc.head.appendChild(style);
    },
  });

  const pdf = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const footerH = 22; // franja reservada para el pie (número de página)
  const contentH = pageHeight - footerH;
  const pxPerPt = canvas.width / pageWidth;
  const sliceHpx = contentH * pxPerPt;

  const cortes = calcularCortes(canvas, sliceHpx);
  const totalPages = cortes.length - 1;

  for (let i = 0; i < totalPages; i++) {
    const sy = cortes[i];
    const sh = cortes[i + 1] - cortes[i];

    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = sh;
    slice
      .getContext("2d")
      ?.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);

    if (i > 0) pdf.addPage();
    pdf.addImage(
      slice.toDataURL("image/png"),
      "PNG",
      0,
      0,
      pageWidth,
      sh / pxPerPt,
    );

    // Pie: texto opcional a la izquierda y "Página N de M" (solo si hay varias).
    if (options.footerText || totalPages > 1) {
      pdf.setFontSize(8);
      pdf.setTextColor(120);
      if (options.footerText) pdf.text(options.footerText, 40, pageHeight - 10);
      if (totalPages > 1) {
        pdf.text(`Página ${i + 1} de ${totalPages}`, pageWidth - 40, pageHeight - 10, {
          align: "right",
        });
      }
    }
  }

  pdf.save(filename);
}

// PDF a tamaño real (multipágina si el contenido no cabe en una hoja).
export function descargarPdf(element: HTMLElement, filename: string): Promise<void> {
  return renderPdf(element, filename);
}

// Igual, con un texto de pie a la izquierda (usado por la propuesta de piscina).
export function descargarPdfMultipagina(
  element: HTMLElement,
  filename: string,
  options: { footerText?: string } = {},
): Promise<void> {
  return renderPdf(element, filename, options);
}

// Convierte un nombre libre en un nombre de archivo seguro.
export function toFilename(nombre: string): string {
  const base = nombre
    .normalize("NFD") // separa acentos; el filtro siguiente los elimina
    .replace(/[^a-zA-Z0-9\- ]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return `${base || "cotizacion"}.pdf`;
}

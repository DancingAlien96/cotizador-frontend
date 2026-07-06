// Generación de PDF en el cliente a partir del documento renderizado.
// html2canvas-pro soporta colores modernos (oklch de Tailwind v4); el
// html2canvas clásico no. Las librerías se importan de forma dinámica para
// no incluirlas en el bundle inicial.

export async function descargarPdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2, // mayor nitidez
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const pdf = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Toda la carta en una sola página tamaño carta (ajuste "contain"),
  // preservando la proporción y centrada horizontalmente.
  const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
  const w = canvas.width * ratio;
  const h = canvas.height * ratio;
  const x = (pageWidth - w) / 2;

  const imgData = canvas.toDataURL("image/png");
  pdf.addImage(imgData, "PNG", x, 0, w, h);
  pdf.save(filename);
}

// Genera un PDF de varias páginas (tamaño carta) reservando un pie con el
// número de página. Cada página se recorta por separado para que el contenido
// no invada la franja del pie.
export async function descargarPdfMultipagina(
  element: HTMLElement,
  filename: string,
  options: { footerText?: string } = {},
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const pdf = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const footerH = 26; // franja reservada para el pie
  const contentH = pageHeight - footerH;
  const pxPerPt = canvas.width / pageWidth;
  const sliceHpx = contentH * pxPerPt;
  const totalPages = Math.max(1, Math.ceil(canvas.height / sliceHpx));

  for (let i = 0; i < totalPages; i++) {
    const sy = i * sliceHpx;
    const sh = Math.min(sliceHpx, canvas.height - sy);

    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = sh;
    const ctx = slice.getContext("2d");
    if (ctx) {
      ctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);
    }

    if (i > 0) pdf.addPage();
    pdf.addImage(slice.toDataURL("image/png"), "PNG", 0, 0, pageWidth, sh / pxPerPt);

    // Pie: texto opcional a la izquierda y "Página N de M" a la derecha
    pdf.setFontSize(8);
    pdf.setTextColor(120);
    if (options.footerText) {
      pdf.text(options.footerText, 40, pageHeight - 10);
    }
    pdf.text(
      `Página ${i + 1} de ${totalPages}`,
      pageWidth - 40,
      pageHeight - 10,
      { align: "right" },
    );
  }

  pdf.save(filename);
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

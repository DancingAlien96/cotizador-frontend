// Exportación a Word (.docx) con cuerpo editable.
// El membrete (gráfico) se inserta como imagen para conservar el diseño; el
// resto va como HTML compatible con Word (texto y tablas editables).

async function imagenADataUrl(src: string): Promise<string> {
  const res = await fetch(src);
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Word no puede resolver rutas relativas: incrusta las imágenes en base64.
async function incrustarImagenes(html: string): Promise<string> {
  const srcs = Array.from(html.matchAll(/src="(\/[^"]+)"/g)).map((m) => m[1]);
  const unicos = Array.from(new Set(srcs));
  let out = html;
  for (const src of unicos) {
    try {
      const dataUrl = await imagenADataUrl(src);
      out = out.split(`src="${src}"`).join(`src="${dataUrl}"`);
    } catch {
      // Si falla una imagen, se deja como está.
    }
  }
  return out;
}

export async function descargarWord(opts: {
  filename: string;
  /** Nodo que contiene el documento renderizado (para tomar el membrete). */
  root: HTMLElement | null;
  /** Cuerpo del documento en HTML compatible con Word. */
  bodyHtml: string;
}): Promise<void> {
  const { default: html2canvas } = await import("html2canvas-pro");

  // Membrete (encabezado/pie) como imágenes
  const membretes = opts.root
    ? Array.from(opts.root.querySelectorAll<HTMLElement>(".membrete"))
    : [];
  const imgs: string[] = [];
  for (const m of membretes) {
    const canvas = await html2canvas(m, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    imgs.push(canvas.toDataURL("image/png"));
  }
  const header = imgs[0]
    ? `<img src="${imgs[0]}" style="width:100%;display:block" />`
    : "";
  const footer = imgs[1]
    ? `<img src="${imgs[1]}" style="width:100%;display:block" />`
    : "";

  const body = await incrustarImagenes(opts.bodyHtml);

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<title>${opts.filename}</title>
<style>
  @page { size: 21.59cm 27.94cm; margin: 0cm; }
  body { font-family: "Times New Roman", Times, serif; font-size: 11pt; color: #111; margin: 0; }
  .cuerpo { padding: 0.8cm 1.4cm; }
  table { border-collapse: collapse; }
  p { margin: 0 0 6pt 0; }
</style>
</head>
<body>
${header}
<div class="cuerpo">${body}</div>
${footer}
</body>
</html>`;

  // Genera un .docx real (Word lo abre sin avisos de formato).
  const { asBlob } = await import("html-docx-js-typescript");
  const blob = (await asBlob(html, {
    orientation: "portrait",
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
  })) as Blob;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = opts.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

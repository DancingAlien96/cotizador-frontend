// Generación de PDF usando la impresión nativa del navegador.
//
// Antes se rasterizaba el documento con html2canvas + jsPDF. Eso tenía dos
// problemas:
//
//  1. El resultado era una imagen dentro de un PDF (los lectores lo detectaban
//     como "PDF escaneado"): texto no seleccionable y borroso al acercar.
//  2. html2canvas coloca cada palabra usando measureText(). Los navegadores con
//     protección anti-fingerprinting —Brave -- alteran esa medida, así que el
//     texto salía amontonado ("Nombredelaempresa", "wwwaquaequiposom").
//
// La impresión nativa genera un PDF vectorial de verdad: el navegador hace el
// trazado del texto, pagina solo y no depende de measureText().
//
// El documento se CLONA a un contenedor al final del <body> en vez de moverlo,
// para no tocar el DOM que administra React. Los estilos de @media print en
// globals.css se encargan de ocultar el resto de la página.

// Espera a que las imágenes del clon estén listas; si no, el navegador puede
// abrir el diálogo de impresión con el logo todavía en blanco.
async function esperarImagenes(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((res) => {
            img.addEventListener("load", () => res(), { once: true });
            img.addEventListener("error", () => res(), { once: true });
          }),
    ),
  );
}

async function imprimir(
  element: HTMLElement,
  filename: string,
  options: { footerText?: string } = {},
): Promise<void> {
  const host = document.createElement("div");
  host.className = "print-host";

  const clone = element.cloneNode(true) as HTMLElement;
  // El original ya usa id="print-area"; el clon no debe duplicar ningún id.
  clone.removeAttribute("id");
  clone.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
  host.appendChild(clone);

  // Pie al final del documento (lo usa la propuesta de piscina).
  if (options.footerText) {
    const pie = document.createElement("div");
    pie.className = "print-footer";
    pie.textContent = options.footerText;
    host.appendChild(pie);
  }

  document.body.appendChild(host);
  document.body.classList.add("imprimiendo");

  // El navegador propone document.title como nombre al "Guardar como PDF".
  const tituloOriginal = document.title;
  document.title = filename.replace(/\.pdf$/i, "");

  await esperarImagenes(host);

  await new Promise<void>((resolve) => {
    let hecho = false;
    const limpiar = () => {
      if (hecho) return;
      hecho = true;
      window.removeEventListener("afterprint", limpiar);
      document.title = tituloOriginal;
      document.body.classList.remove("imprimiendo");
      host.remove();
      resolve();
    };

    window.addEventListener("afterprint", limpiar);
    window.print();
    // Red de seguridad por si el navegador no dispara afterprint.
    setTimeout(limpiar, 1000);
  });
}

// PDF del documento (pagina solo si el contenido no cabe en una hoja).
export function descargarPdf(element: HTMLElement, filename: string): Promise<void> {
  return imprimir(element, filename);
}

// Igual, con un texto de pie en cada hoja (usado por la propuesta de piscina).
export function descargarPdfMultipagina(
  element: HTMLElement,
  filename: string,
  options: { footerText?: string } = {},
): Promise<void> {
  return imprimir(element, filename, options);
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
